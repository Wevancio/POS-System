/**
 * Hardware Agent — POS System
 * Corre localmente en la PC de caja (localhost:3001)
 * Maneja impresora térmica ESC/POS y cajón de dinero
 *
 * CONFIGURACIÓN:
 *   1. Conecta la impresora USB y ejecuta GET /devices para obtener VID y PID
 *   2. Copia los valores en PRINTER_VID y PRINTER_PID abajo
 *   3. Sin configurar, el agente trabaja en modo simulado (ideal para desarrollo)
 */

import express from 'express'
import cors from 'cors'

const app  = express()
const PORT = 3001

// ─── Configura tu impresora aquí ─────────────────────────────────
// Deja en null para usar el modo simulado
const PRINTER_VID = null   // ej: 0x04b8 (Epson)
const PRINTER_PID = null   // ej: 0x0202

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }))
app.use(express.json())

// ─── Formateador de ticket (compartido entre real y simulado) ─────
const ANCHO = 32

function centrar(texto) {
  const t = String(texto)
  const pad = Math.max(0, Math.floor((ANCHO - t.length) / 2))
  return ' '.repeat(pad) + t
}

function fila(izq, der) {
  const d = String(der)
  return String(izq).substring(0, ANCHO - d.length - 1).padEnd(ANCHO - d.length) + d
}

function lineasTicket(ticket) {
  const sep = '─'.repeat(ANCHO)
  const lines = [
    centrar(ticket.negocio || 'MI TIENDA'),
    sep,
    `Folio: ${ticket.folio}`,
    ticket.fecha,
    sep,
  ]

  for (const item of (ticket.items || [])) {
    lines.push(fila(`${item.qty}x ${item.nombre}`, `$${item.total.toFixed(2)}`))
  }

  lines.push(sep)
  if (ticket.descuento) {
    lines.push(fila('Subtotal', `$${ticket.subtotal.toFixed(2)}`))
    lines.push(fila('Descuento', `-$${ticket.descuento.toFixed(2)}`))
  }
  lines.push(fila('TOTAL', `$${ticket.total.toFixed(2)}`))
  lines.push(`Pago: ${ticket.metodoPago}`)
  if (ticket.cambio > 0) lines.push(fila('Cambio', `$${ticket.cambio.toFixed(2)}`))
  lines.push(sep)
  lines.push(centrar('¡Gracias por su compra!'))
  lines.push('')
  lines.push('')
  return lines
}

// ─── Impresión real ESC/POS ───────────────────────────────────────
async function imprimirReal(ticket, abrirCajon) {
  const escposModule = await import('escpos')
  const escpos       = escposModule.default ?? escposModule
  const { USB }      = await import('escpos-usb')

  const device  = PRINTER_VID
    ? new USB(PRINTER_VID, PRINTER_PID)
    : new USB()                               // primer dispositivo encontrado

  const printer = new escpos.Printer(device)

  return new Promise((resolve, reject) => {
    device.open((err) => {
      if (err) return reject(err)

      const p = printer
        .align('CT').style('B').text(ticket.negocio || 'MI TIENDA').style('NORMAL')

      for (const line of lineasTicket(ticket).slice(1)) {
        p.text(line)
      }

      if (abrirCajon) p.cashdraw(2)

      p.cut().close(resolve)
    })
  })
}

// ─── Impresión simulada (consola) ─────────────────────────────────
function imprimirSimulado(ticket, abrirCajon) {
  console.log('\n🖨️  TICKET (modo simulado):')
  for (const line of lineasTicket(ticket)) {
    console.log(line)
  }
  if (abrirCajon) console.log('💰  Cajón abierto (simulado)\n')
}

// ─── Health check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, version: '0.2.0', timestamp: new Date().toISOString() })
})

// ─── Listar impresoras USB ────────────────────────────────────────
app.get('/devices', async (_req, res) => {
  try {
    const { USB } = await import('escpos-usb')
    const printers = USB.findPrinter() || []
    res.json({
      devices: printers.map(d => ({
        vendorId:  `0x${d.deviceDescriptor.idVendor.toString(16).padStart(4, '0')}`,
        productId: `0x${d.deviceDescriptor.idProduct.toString(16).padStart(4, '0')}`,
      })),
      hint: 'Copia vendorId y productId en PRINTER_VID / PRINTER_PID de index.js',
    })
  } catch (err) {
    res.json({ devices: [], error: err.message })
  }
})

// ─── Imprimir ticket ──────────────────────────────────────────────
app.post('/print', async (req, res) => {
  const { ticket, openDrawer = false } = req.body

  if (!ticket) {
    return res.status(400).json({ error: 'Se requiere el objeto ticket' })
  }

  let modo = 'real'
  try {
    await imprimirReal(ticket, openDrawer)
  } catch (err) {
    modo = 'simulado'
    console.warn(`⚠️  Impresora no disponible (${err.message}) — modo simulado`)
    imprimirSimulado(ticket, openDrawer)
  }

  res.json({ ok: true, modo })
})

// ─── Abrir cajón (standalone) ─────────────────────────────────────
app.post('/drawer/open', async (_req, res) => {
  let modo = 'real'
  try {
    const escposModule = await import('escpos')
    const escpos       = escposModule.default ?? escposModule
    const { USB }      = await import('escpos-usb')
    const device       = PRINTER_VID ? new USB(PRINTER_VID, PRINTER_PID) : new USB()
    const printer      = new escpos.Printer(device)

    await new Promise((resolve, reject) => {
      device.open((err) => {
        if (err) return reject(err)
        printer.cashdraw(2).close(resolve)
      })
    })
  } catch (err) {
    modo = 'simulado'
    console.log(`💰  Cajón abierto (simulado — ${err.message})`)
  }

  res.json({ ok: true, modo })
})

// ─── Iniciar servidor ──────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  const cfg = PRINTER_VID ? `VID=${PRINTER_VID} PID=${PRINTER_PID}` : 'sin configurar (modo simulado)'
  console.log(`\n✅  Hardware Agent v0.2.0 → http://localhost:${PORT}`)
  console.log(`    Impresora: ${cfg}`)
  console.log(`    GET  /health        Estado del agente`)
  console.log(`    GET  /devices       Impresoras USB detectadas`)
  console.log(`    POST /print         Imprimir ticket`)
  console.log(`    POST /drawer/open   Abrir cajón\n`)
})

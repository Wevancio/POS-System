/**
 * Hardware Agent — POS System
 * Corre localmente en la PC de caja (localhost:3001)
 * Maneja impresora térmica ESC/POS y cajón de dinero
 */

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

// Solo acepta peticiones desde la PWA local
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }))
app.use(express.json())

// ─── Health check ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, version: '0.1.0', timestamp: new Date().toISOString() })
})

// ─── Listar dispositivos USB conectados ──────────────────────────
app.get('/devices', async (_req, res) => {
  try {
    // En producción: usar escpos-usb para listar
    // const devices = USB.findPrinter()
    res.json({ devices: [], message: 'Conecta tu impresora USB e instala escpos-usb' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Imprimir ticket ─────────────────────────────────────────────
app.post('/print', async (req, res) => {
  try {
    const { ticket } = req.body

    if (!ticket) {
      return res.status(400).json({ error: 'Se requiere el objeto ticket' })
    }

    // TODO (siguiente paso): integrar escpos real
    // Por ahora loggeamos el ticket para pruebas
    console.log('\n🖨️  TICKET A IMPRIMIR:')
    console.log('─'.repeat(32))
    console.log(ticket.negocio || 'MI TIENDA')
    console.log('─'.repeat(32))
    ticket.items?.forEach(item => {
      const linea = `${item.qty}x ${item.nombre}`.padEnd(24)
      const precio = `$${item.total.toFixed(2)}`
      console.log(linea + precio.padStart(8))
    })
    console.log('─'.repeat(32))
    console.log('TOTAL'.padEnd(24) + `$${ticket.total?.toFixed(2)}`.padStart(8))
    console.log('─'.repeat(32))

    res.json({ ok: true, modo: 'simulado' })
  } catch (err) {
    console.error('Error al imprimir:', err)
    res.status(500).json({ error: err.message })
  }
})

// ─── Abrir cajón de dinero ───────────────────────────────────────
app.post('/drawer/open', async (_req, res) => {
  try {
    // TODO: printer.cashdraw(2) cuando escpos esté conectado
    console.log('💰 Cajón abierto (simulado)')
    res.json({ ok: true, modo: 'simulado' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Iniciar servidor ────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✅ Hardware Agent corriendo en http://localhost:${PORT}`)
  console.log('   Endpoints:')
  console.log(`   GET  /health        → Estado del agente`)
  console.log(`   GET  /devices       → Dispositivos USB`)
  console.log(`   POST /print         → Imprimir ticket`)
  console.log(`   POST /drawer/open   → Abrir cajón\n`)
})

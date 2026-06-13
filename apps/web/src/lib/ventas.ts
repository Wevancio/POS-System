import 'server-only'
import { db } from './db'
import type { Venta } from '@/types/pos'

export interface VentaResumen {
  id: number
  folio: string
  total: number
  metodo_pago: string
  creado_en: string
  num_items: number
}

const stmtInsertVenta = db.prepare<{
  folio: string; subtotal: number; descuento: number; total: number
  metodo_pago: string; efectivo: number | null; cambio: number | null
}>(`
  INSERT INTO ventas (folio, subtotal, descuento, total, metodo_pago, efectivo, cambio)
  VALUES (@folio, @subtotal, @descuento, @total, @metodo_pago, @efectivo, @cambio)
`)

const stmtInsertItem = db.prepare<{
  venta_id: number | bigint; producto_id: number | null
  nombre: string; precio: number; qty: number; total: number
}>(`
  INSERT INTO items_venta (venta_id, producto_id, nombre, precio, qty, total)
  VALUES (@venta_id, @producto_id, @nombre, @precio, @qty, @total)
`)

const stmtDescontarStock = db.prepare<{ qty: number; id: number }>(`
  UPDATE productos SET stock = MAX(0, stock - @qty) WHERE id = @id
`)

const txGuardar = db.transaction((venta: Venta) => {
  const { lastInsertRowid } = stmtInsertVenta.run({
    folio:       venta.id,
    subtotal:    venta.subtotal,
    descuento:   venta.descuento,
    total:       venta.total,
    metodo_pago: venta.metodoPago,
    efectivo:    venta.cambio !== undefined ? venta.total + venta.cambio : null,
    cambio:      venta.cambio ?? null,
  })

  for (const item of venta.items) {
    const producto_id = parseInt(item.producto.id, 10) || null
    stmtInsertItem.run({
      venta_id: lastInsertRowid,
      producto_id,
      nombre:   item.producto.nombre,
      precio:   item.precioUnitario,
      qty:      item.qty,
      total:    item.total,
    })
    if (producto_id) stmtDescontarStock.run({ qty: item.qty, id: producto_id })
  }
})

export function guardarVenta(venta: Venta): void {
  txGuardar(venta)
}

const stmtListarDia = db.prepare(`
  SELECT
    v.id, v.folio, v.total, v.metodo_pago, v.creado_en,
    COALESCE(SUM(i.qty), 0) AS num_items
  FROM ventas v
  LEFT JOIN items_venta i ON i.venta_id = v.id
  WHERE date(v.creado_en) = date('now')
  GROUP BY v.id
  ORDER BY v.creado_en DESC
`)

export function listarVentasDelDia(): VentaResumen[] {
  return stmtListarDia.all() as VentaResumen[]
}

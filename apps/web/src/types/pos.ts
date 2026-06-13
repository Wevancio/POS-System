// ─── Producto / Inventario ────────────────────────────────────────
export interface Producto {
  id: string
  nombre: string
  precio: number
  sku?: string
  stock?: number
  categoria?: string
}

// ─── Venta ────────────────────────────────────────────────────────
export interface ItemVenta {
  producto: Producto
  qty: number
  precioUnitario: number
  total: number
}

export interface Venta {
  id: string
  items: ItemVenta[]
  subtotal: number
  descuento: number
  total: number
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'
  cambio?: number
  creadoEn: Date
}

// ─── Ticket de impresión ──────────────────────────────────────────
export interface TicketImpresion {
  negocio: string
  folio: string
  fecha: string
  items: {
    qty: number
    nombre: string
    total: number
  }[]
  subtotal: number
  descuento?: number
  total: number
  metodoPago: string
  cambio?: number
}

// ─── Hardware Agent ───────────────────────────────────────────────
export interface HardwareStatus {
  ok: boolean
  version: string
  timestamp: string
}

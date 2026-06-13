import 'server-only'
import { db } from './db'
import type { Producto } from '@/types/pos'

type ProductoRow = {
  id: number
  nombre: string
  precio: number
  sku: string | null
  stock: number
  categoria: string | null
}

function toProducto(row: ProductoRow): Producto {
  return {
    id: String(row.id),
    nombre: row.nombre,
    precio: row.precio,
    sku: row.sku ?? undefined,
    stock: row.stock,
    categoria: row.categoria ?? undefined,
  }
}

// ─── Seed inicial si la tabla está vacía ──────────────────────────
const SEED: Omit<Producto, 'id'>[] = [
  { nombre: 'Coca-Cola 600ml',      precio: 18, sku: '7501055300310', stock: 48, categoria: 'Bebidas'   },
  { nombre: 'Sabritas Original',    precio: 16, sku: '7501011103052', stock: 30, categoria: 'Botanas'   },
  { nombre: 'Pan Bimbo Blanco',     precio: 42, sku: '7441029502706', stock: 12, categoria: 'Panadería' },
  { nombre: 'Leche Lala Entera 1L', precio: 26, sku: '7501055360291', stock: 20, categoria: 'Lácteos'   },
  { nombre: 'Agua Bonafont 1.5L',   precio: 14, sku: '7501011300403', stock: 60, categoria: 'Bebidas'   },
  { nombre: 'Galletas Marías',      precio: 12, sku: '7501007400026', stock: 25, categoria: 'Galletas'  },
  { nombre: 'Jabón Zote',           precio: 22, sku: '7501011104059', stock: 15, categoria: 'Limpieza'  },
  { nombre: 'Arroz 1kg',            precio: 28, sku: '7500000001234', stock: 35, categoria: 'Básicos'   },
]

const { n } = db.prepare('SELECT COUNT(*) as n FROM productos').get() as { n: number }
if (n === 0) {
  const insert = db.prepare(`
    INSERT INTO productos (nombre, precio, sku, stock, categoria)
    VALUES (@nombre, @precio, @sku, @stock, @categoria)
  `)
  db.transaction((rows: typeof SEED) => { for (const r of rows) insert.run(r) })(SEED)
}

// ─── Queries públicas ────────────────────────────────────────────

const stmtBuscar = db.prepare<[string, string, string]>(`
  SELECT * FROM productos
  WHERE activo = 1 AND (sku = ? OR CAST(id AS TEXT) = ? OR nombre LIKE ?)
  LIMIT 1
`)

export function buscarProducto(query: string): Producto | null {
  const q = query.trim()
  const row = stmtBuscar.get(q, q, `%${q}%`) as ProductoRow | undefined
  return row ? toProducto(row) : null
}

const stmtListar = db.prepare(`
  SELECT * FROM productos WHERE activo = 1 ORDER BY categoria, nombre
`)

export function listarProductos(): Producto[] {
  return (stmtListar.all() as ProductoRow[]).map(toProducto)
}

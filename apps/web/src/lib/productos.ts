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

// ─── CRUD ────────────────────────────────────────────────────────

export type ProductoConEstado = Producto & { activo: boolean }

const stmtListarTodos = db.prepare(`
  SELECT * FROM productos ORDER BY categoria, nombre
`)

export function listarTodosProductos(): ProductoConEstado[] {
  return (stmtListarTodos.all() as (ProductoRow & { activo: number })[]).map(row => ({
    ...toProducto(row),
    activo: row.activo === 1,
  }))
}

const stmtInsertar = db.prepare<{
  nombre: string; precio: number; sku: string | null; stock: number; categoria: string | null
}>(`
  INSERT INTO productos (nombre, precio, sku, stock, categoria)
  VALUES (@nombre, @precio, @sku, @stock, @categoria)
  RETURNING *
`)

export function crearProducto(data: Omit<Producto, 'id'>): Producto {
  const row = stmtInsertar.get({
    nombre:    data.nombre,
    precio:    data.precio,
    sku:       data.sku ?? null,
    stock:     data.stock ?? 0,
    categoria: data.categoria ?? null,
  }) as ProductoRow
  return toProducto(row)
}

const stmtActualizar = db.prepare<{
  id: number; nombre: string; precio: number
  sku: string | null; stock: number; categoria: string | null
}>(`
  UPDATE productos
  SET nombre = @nombre, precio = @precio, sku = @sku, stock = @stock, categoria = @categoria
  WHERE id = @id
`)

export function actualizarProducto(id: string, data: Omit<Producto, 'id'>): void {
  stmtActualizar.run({
    id:        parseInt(id, 10),
    nombre:    data.nombre,
    precio:    data.precio,
    sku:       data.sku ?? null,
    stock:     data.stock ?? 0,
    categoria: data.categoria ?? null,
  })
}

const stmtToggle = db.prepare(`
  UPDATE productos SET activo = CASE WHEN activo = 1 THEN 0 ELSE 1 END WHERE id = ?
`)

export function toggleActivo(id: string): void {
  stmtToggle.run(parseInt(id, 10))
}

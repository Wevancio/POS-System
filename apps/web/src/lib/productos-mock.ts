import type { Producto } from '@/types/pos'

export const productosMock: Producto[] = [
  { id: '1', nombre: 'Coca-Cola 600ml',       precio: 18, sku: '7501055300310', stock: 48, categoria: 'Bebidas'   },
  { id: '2', nombre: 'Sabritas Original',     precio: 16, sku: '7501011103052', stock: 30, categoria: 'Botanas'   },
  { id: '3', nombre: 'Pan Bimbo Blanco',      precio: 42, sku: '7441029502706', stock: 12, categoria: 'Panadería' },
  { id: '4', nombre: 'Leche Lala Entera 1L',  precio: 26, sku: '7501055360291', stock: 20, categoria: 'Lácteos'   },
  { id: '5', nombre: 'Agua Bonafont 1.5L',    precio: 14, sku: '7501011300403', stock: 60, categoria: 'Bebidas'   },
  { id: '6', nombre: 'Galletas Marías',       precio: 12, sku: '7501007400026', stock: 25, categoria: 'Galletas'  },
  { id: '7', nombre: 'Jabón Zote',            precio: 22, sku: '7501011104059', stock: 15, categoria: 'Limpieza'  },
  { id: '8', nombre: 'Arroz 1kg',             precio: 28, sku: '7500000001234', stock: 35, categoria: 'Básicos'   },
]

export function buscarProducto(query: string): Producto | undefined {
  const q = query.trim().toLowerCase()
  return productosMock.find(
    (p) => p.sku === q || p.id === q || p.nombre.toLowerCase().includes(q)
  )
}

'use client'

import type { ItemVenta } from '@/types/pos'

interface CarritoProps {
  items: ItemVenta[]
  onCambiarCantidad: (productoId: string, delta: number) => void
  onEliminar: (productoId: string) => void
}

export function Carrito({ items, onCambiarCantidad, onEliminar }: CarritoProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-12">
        <span className="text-4xl">🛒</span>
        <p className="text-sm">Escanea o busca un producto</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => (
        <li key={item.producto.id} className="flex items-center gap-3 py-3 px-1">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">{item.producto.nombre}</p>
            <p className="text-xs text-gray-400">${item.precioUnitario.toFixed(2)} c/u</p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onCambiarCantidad(item.producto.id, -1)}
              className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-lg leading-none"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
            <button
              onClick={() => onCambiarCantidad(item.producto.id, 1)}
              className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-lg leading-none"
            >
              +
            </button>
          </div>

          <span className="text-sm font-semibold w-16 text-right">${item.total.toFixed(2)}</span>

          <button
            onClick={() => onEliminar(item.producto.id)}
            className="text-gray-300 hover:text-danger transition-colors ml-1"
            aria-label="Eliminar"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  )
}

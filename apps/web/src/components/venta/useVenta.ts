import { useState, useCallback } from 'react'
import type { ItemVenta, Venta } from '@/types/pos'
import { buscarProducto } from '@/lib/productos-mock'

type EstadoVenta = 'activa' | 'cobrando' | 'completada'

interface UseVentaReturn {
  items: ItemVenta[]
  estado: EstadoVenta
  total: number
  ultimaVenta: Venta | null
  agregarPorCodigo: (codigo: string) => boolean
  cambiarCantidad: (productoId: string, delta: number) => void
  eliminarItem: (productoId: string) => void
  iniciarCobro: () => void
  cancelarCobro: () => void
  procesarPago: (metodoPago: Venta['metodoPago'], efectivo?: number) => void
  nuevaVenta: () => void
}

export function useVenta(): UseVentaReturn {
  const [items, setItems] = useState<ItemVenta[]>([])
  const [estado, setEstado] = useState<EstadoVenta>('activa')
  const [ultimaVenta, setUltimaVenta] = useState<Venta | null>(null)

  const total = items.reduce((acc, i) => acc + i.total, 0)

  const agregarPorCodigo = useCallback((codigo: string): boolean => {
    const producto = buscarProducto(codigo)
    if (!producto) return false

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.producto.id === producto.id)
      if (idx >= 0) {
        return prev.map((i, index) =>
          index === idx
            ? { ...i, qty: i.qty + 1, total: (i.qty + 1) * i.precioUnitario }
            : i
        )
      }
      return [...prev, { producto, qty: 1, precioUnitario: producto.precio, total: producto.precio }]
    })
    return true
  }, [])

  const cambiarCantidad = useCallback((productoId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.producto.id !== productoId) return i
          const newQty = i.qty + delta
          if (newQty <= 0) return null
          return { ...i, qty: newQty, total: newQty * i.precioUnitario }
        })
        .filter(Boolean) as ItemVenta[]
    )
  }, [])

  const eliminarItem = useCallback((productoId: string) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId))
  }, [])

  const iniciarCobro = useCallback(() => {
    if (items.length > 0) setEstado('cobrando')
  }, [items.length])

  const cancelarCobro = useCallback(() => setEstado('activa'), [])

  const procesarPago = useCallback(
    (metodoPago: Venta['metodoPago'], efectivo?: number) => {
      const venta: Venta = {
        id: `V-${Date.now()}`,
        items,
        subtotal: total,
        descuento: 0,
        total,
        metodoPago,
        cambio: efectivo !== undefined ? efectivo - total : undefined,
        creadoEn: new Date(),
      }
      setUltimaVenta(venta)
      setEstado('completada')
    },
    [items, total]
  )

  const nuevaVenta = useCallback(() => {
    setItems([])
    setUltimaVenta(null)
    setEstado('activa')
  }, [])

  return {
    items, estado, total, ultimaVenta,
    agregarPorCodigo, cambiarCantidad, eliminarItem,
    iniciarCobro, cancelarCobro, procesarPago, nuevaVenta,
  }
}

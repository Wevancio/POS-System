'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useVenta } from '@/components/venta/useVenta'
import { Carrito } from '@/components/venta/Carrito'
import { PanelCobro } from '@/components/venta/PanelCobro'
import { VentaCompletada } from '@/components/venta/VentaCompletada'

export default function VentaPage() {
  const {
    items, estado, total, procesando, ultimaVenta,
    agregarPorCodigo, cambiarCantidad, eliminarItem,
    iniciarCobro, cancelarCobro, procesarPago, nuevaVenta,
  } = useVenta()

  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) return
    const ok = await agregarPorCodigo(codigo.trim())
    if (!ok) {
      setError(`Producto no encontrado: "${codigo}"`)
      setTimeout(() => setError(''), 2500)
    }
    setCodigo('')
    inputRef.current?.focus()
  }

  const totalArticulos = items.reduce((a, i) => a + i.qty, 0)

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <header className="bg-primary px-5 py-3 flex items-center justify-between">
        <span className="text-accent font-bold text-lg tracking-wide">POS</span>
        <nav className="flex items-center gap-5 text-sm">
          <span className="text-white font-medium">Venta</span>
          <Link href="/historial" className="text-white/50 hover:text-white transition-colors">Historial</Link>
          <Link href="/catalogo"  className="text-white/50 hover:text-white transition-colors">Catálogo</Link>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Columna principal: escáner + carrito */}
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
          <form onSubmit={handleScan} className="flex gap-2">
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Escanea o escribe código de barras…"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
              disabled={estado !== 'activa'}
            />
            <button
              type="submit"
              disabled={estado !== 'activa'}
              className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark disabled:opacity-40 transition-colors"
            >
              Agregar
            </button>
          </form>

          {error && (
            <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex-1 pos-card p-3 overflow-y-auto">
            <Carrito
              items={items}
              onCambiarCantidad={cambiarCantidad}
              onEliminar={eliminarItem}
            />
          </div>
        </div>

        {/* Panel lateral */}
        <aside className="w-80 bg-white border-l border-gray-100 p-5 flex flex-col">
          {estado === 'completada' && ultimaVenta ? (
            <VentaCompletada venta={ultimaVenta} onNuevaVenta={nuevaVenta} />
          ) : estado === 'cobrando' ? (
            <PanelCobro
              total={total}
              procesando={procesando}
              onPagar={procesarPago}
              onCancelar={cancelarCobro}
            />
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Resumen</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Artículos</span>
                  <span className="font-medium">{totalArticulos}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-gray-500 text-sm">Total</span>
                  <span className="text-3xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={iniciarCobro}
                disabled={items.length === 0}
                className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-base disabled:opacity-40 hover:bg-accent-dark transition-colors"
              >
                Cobrar
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

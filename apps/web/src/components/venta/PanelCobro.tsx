'use client'

import { useState } from 'react'
import type { Venta } from '@/types/pos'

interface PanelCobroProps {
  total: number
  onPagar: (metodo: Venta['metodoPago'], efectivo?: number) => void
  onCancelar: () => void
}

const METODOS: { value: Venta['metodoPago']; label: string }[] = [
  { value: 'efectivo',      label: 'Efectivo'      },
  { value: 'tarjeta',       label: 'Tarjeta'       },
  { value: 'transferencia', label: 'Transferencia' },
]

export function PanelCobro({ total, onPagar, onCancelar }: PanelCobroProps) {
  const [metodo, setMetodo] = useState<Venta['metodoPago']>('efectivo')
  const [efectivo, setEfectivo] = useState('')

  const montoEfectivo = parseFloat(efectivo || '0')
  const cambio = metodo === 'efectivo' ? montoEfectivo - total : 0
  const puedeConfirmar = metodo !== 'efectivo' || montoEfectivo >= total

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="text-center">
        <p className="text-sm text-gray-500">Total a cobrar</p>
        <p className="text-4xl font-bold text-primary mt-1">${total.toFixed(2)}</p>
      </div>

      <div className="flex gap-2">
        {METODOS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMetodo(m.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              metodo === m.value
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-accent'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {metodo === 'efectivo' && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Efectivo recibido</label>
          <input
            type="number"
            min={0}
            step="1"
            value={efectivo}
            onChange={(e) => setEfectivo(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
            autoFocus
          />
          {montoEfectivo >= total && montoEfectivo > 0 && (
            <p className="text-sm text-success mt-2 font-medium">
              Cambio: ${cambio.toFixed(2)}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-auto">
        <button
          onClick={onCancelar}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={() =>
            onPagar(metodo, metodo === 'efectivo' ? montoEfectivo : undefined)
          }
          disabled={!puedeConfirmar}
          className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold disabled:opacity-40 hover:bg-accent-dark transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  )
}

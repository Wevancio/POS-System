'use client'

import type { Venta } from '@/types/pos'

interface VentaCompletadaProps {
  venta: Venta
  onNuevaVenta: () => void
}

const METODO_LABEL: Record<Venta['metodoPago'], string> = {
  efectivo:      'Efectivo',
  tarjeta:       'Tarjeta',
  transferencia: 'Transferencia',
}

export function VentaCompletada({ venta, onNuevaVenta }: VentaCompletadaProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
        <span className="text-success text-4xl font-bold">✓</span>
      </div>

      <div className="text-center">
        <p className="text-xl font-bold text-primary">¡Venta completada!</p>
        <p className="text-xs text-gray-400 mt-1 font-mono">{venta.id}</p>
      </div>

      <div className="w-full pos-card p-4 space-y-2">
        <Row label="Total cobrado"  value={`$${venta.total.toFixed(2)}`} />
        <Row label="Método de pago" value={METODO_LABEL[venta.metodoPago]} />
        {venta.cambio !== undefined && venta.cambio > 0 && (
          <Row label="Cambio entregado" value={`$${venta.cambio.toFixed(2)}`} highlight />
        )}
        <Row label="Artículos" value={String(venta.items.reduce((a, i) => a + i.qty, 0))} />
      </div>

      <button
        onClick={onNuevaVenta}
        className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-dark transition-colors"
      >
        Nueva venta
      </button>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-success' : 'text-primary'}`}>
        {value}
      </span>
    </div>
  )
}

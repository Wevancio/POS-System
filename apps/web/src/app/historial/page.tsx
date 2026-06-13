import Link from 'next/link'
import { listarVentasDelDia } from '@/lib/ventas'

const METODO_LABEL: Record<string, string> = {
  efectivo:      'Efectivo',
  tarjeta:       'Tarjeta',
  transferencia: 'Transferencia',
}

function formatHora(creado_en: string): string {
  // SQLite guarda UTC: "2026-06-13 22:15:00" → parsear como UTC
  const d = new Date(creado_en.replace(' ', 'T') + 'Z')
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function HistorialPage() {
  const ventas = listarVentasDelDia()
  const totalDia = ventas.reduce((acc, v) => acc + v.total, 0)

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <header className="bg-primary px-5 py-3 flex items-center justify-between">
        <span className="text-accent font-bold text-lg tracking-wide">POS</span>
        <Link href="/venta" className="text-white/60 text-sm hover:text-white transition-colors">
          ← Volver a venta
        </Link>
      </header>

      <main className="flex-1 p-5 max-w-2xl mx-auto w-full">
        {/* Resumen del día */}
        <div className="pos-card p-5 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ventas hoy</p>
            <p className="text-3xl font-bold text-primary">${totalDia.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-700">{ventas.length}</p>
            <p className="text-xs text-gray-400">transacciones</p>
          </div>
        </div>

        {/* Lista de ventas */}
        {ventas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">No hay ventas registradas hoy</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ventas.map((v) => (
              <li key={v.id} className="pos-card px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary font-mono">{v.folio}</p>
                  <p className="text-xs text-gray-400">
                    {formatHora(v.creado_en)} · {v.num_items} artículo{v.num_items !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                  {METODO_LABEL[v.metodo_pago] ?? v.metodo_pago}
                </span>
                <span className="text-base font-bold text-primary w-20 text-right">
                  ${v.total.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

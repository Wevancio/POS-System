import Link from 'next/link'
import { obtenerCorteDelDia } from '@/lib/ventas'
import { listarVentasDelDia } from '@/lib/ventas'

const METODO_LABEL: Record<string, string> = {
  efectivo:      'Efectivo',
  tarjeta:       'Tarjeta',
  transferencia: 'Transferencia',
}

const METODO_ICON: Record<string, string> = {
  efectivo:      '💵',
  tarjeta:       '💳',
  transferencia: '🏦',
}

export default function CortePage() {
  const resumen  = obtenerCorteDelDia()
  const ventas   = listarVentasDelDia()
  const totalDia = resumen.reduce((acc, r) => acc + r.total, 0)
  const efectivo = resumen.find(r => r.metodo_pago === 'efectivo')?.total ?? 0
  const fecha    = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <header className="bg-primary px-5 py-3 flex items-center justify-between">
        <span className="text-accent font-bold text-lg tracking-wide">POS</span>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/venta"    className="text-white/50 hover:text-white transition-colors">Venta</Link>
          <Link href="/historial" className="text-white/50 hover:text-white transition-colors">Historial</Link>
          <Link href="/catalogo" className="text-white/50 hover:text-white transition-colors">Catálogo</Link>
          <span className="text-white font-medium">Corte</span>
        </nav>
      </header>

      <main className="flex-1 p-5 max-w-2xl mx-auto w-full space-y-5">
        <div>
          <h1 className="text-xl font-bold text-primary">Corte de caja</h1>
          <p className="text-sm text-gray-400 capitalize">{fecha}</p>
        </div>

        {/* Total del día */}
        <div className="pos-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total del día</p>
            <p className="text-4xl font-bold text-primary">${totalDia.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-700">{ventas.length}</p>
            <p className="text-xs text-gray-400">transacciones</p>
          </div>
        </div>

        {/* Desglose por método de pago */}
        <div className="pos-card divide-y divide-gray-100 overflow-hidden">
          <p className="px-5 py-3 text-xs text-gray-400 uppercase tracking-wider">
            Desglose por método de pago
          </p>
          {resumen.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">
              No hay ventas registradas hoy
            </p>
          ) : (
            resumen.map(r => (
              <div key={r.metodo_pago} className="px-5 py-4 flex items-center gap-3">
                <span className="text-2xl">{METODO_ICON[r.metodo_pago] ?? '💰'}</span>
                <div className="flex-1">
                  <p className="font-medium text-primary">
                    {METODO_LABEL[r.metodo_pago] ?? r.metodo_pago}
                  </p>
                  <p className="text-xs text-gray-400">{r.num_ventas} venta{r.num_ventas !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-lg font-bold text-primary">${r.total.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>

        {/* Efectivo en caja */}
        {efectivo > 0 && (
          <div className="pos-card p-5 border-l-4 border-success">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Efectivo esperado en caja
            </p>
            <p className="text-3xl font-bold text-success">${efectivo.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Verifica que el cajón cuadre con este monto
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

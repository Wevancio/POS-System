import Link from 'next/link'
import { listarTodosProductos } from '@/lib/productos'
import { GestorCatalogo } from './GestorCatalogo'

export default function CatalogoPage() {
  const productos = listarTodosProductos()

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col">
      <header className="bg-primary px-5 py-3 flex items-center justify-between">
        <span className="text-accent font-bold text-lg tracking-wide">POS</span>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/venta"    className="text-white/50 hover:text-white transition-colors">Venta</Link>
          <Link href="/historial" className="text-white/50 hover:text-white transition-colors">Historial</Link>
          <span className="text-white font-medium">Catálogo</span>
        </nav>
      </header>

      <main className="flex-1 p-5 max-w-5xl mx-auto w-full">
        <GestorCatalogo productosIniciales={productos} />
      </main>
    </div>
  )
}

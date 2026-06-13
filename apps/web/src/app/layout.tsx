import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'POS System',
  description: 'Punto de ventas',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-surface-muted text-primary antialiased">
        {children}
      </body>
    </html>
  )
}

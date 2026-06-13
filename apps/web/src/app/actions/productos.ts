'use server'

import { buscarProducto } from '@/lib/productos'
import type { Producto } from '@/types/pos'

export async function buscarProductoAction(codigo: string): Promise<Producto | null> {
  return buscarProducto(codigo)
}

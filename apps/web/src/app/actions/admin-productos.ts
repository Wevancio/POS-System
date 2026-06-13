'use server'

import { revalidatePath } from 'next/cache'
import { crearProducto, actualizarProducto, toggleActivo } from '@/lib/productos'
import type { Producto } from '@/types/pos'

type DatosProducto = Omit<Producto, 'id'>

export async function crearProductoAction(data: DatosProducto): Promise<Producto> {
  const nuevo = crearProducto(data)
  revalidatePath('/catalogo')
  return nuevo
}

export async function actualizarProductoAction(id: string, data: DatosProducto): Promise<void> {
  actualizarProducto(id, data)
  revalidatePath('/catalogo')
}

export async function toggleActivoAction(id: string): Promise<void> {
  toggleActivo(id)
  revalidatePath('/catalogo')
}

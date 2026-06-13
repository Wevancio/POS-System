'use server'

import { guardarVenta, listarVentasDelDia } from '@/lib/ventas'
import type { Venta } from '@/types/pos'
import type { VentaResumen } from '@/lib/ventas'

export async function guardarVentaAction(venta: Venta): Promise<void> {
  guardarVenta(venta)
}

export async function listarVentasDelDiaAction(): Promise<VentaResumen[]> {
  return listarVentasDelDia()
}

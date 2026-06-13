/**
 * Cliente del Hardware Agent
 * La PWA habla con el agente local en localhost:3001
 */

import type { TicketImpresion, HardwareStatus } from '@/types/pos'

const AGENT_URL = 'http://localhost:3001'
const TIMEOUT_MS = 3000

async function fetchAgent<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${AGENT_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
    if (!res.ok) throw new Error(`Agent error ${res.status}`)
    return res.json() as Promise<T>
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('Hardware agent no responde. ¿Está corriendo en localhost:3001?')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ─── API pública ──────────────────────────────────────────────────

export async function verificarAgente(): Promise<boolean> {
  try {
    const status = await fetchAgent<HardwareStatus>('/health')
    return status.ok
  } catch {
    return false
  }
}

export async function imprimirTicket(ticket: TicketImpresion): Promise<void> {
  await fetchAgent('/print', {
    method: 'POST',
    body: JSON.stringify({ ticket }),
  })
}

export async function abrirCajon(): Promise<void> {
  await fetchAgent('/drawer/open', { method: 'POST' })
}

export async function imprimirYAbrirCajon(ticket: TicketImpresion): Promise<void> {
  // El cajón se abre junto con la impresión (un solo viaje al agente)
  await fetchAgent('/print', {
    method: 'POST',
    body: JSON.stringify({ ticket, openDrawer: true }),
  })
}

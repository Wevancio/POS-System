'use client'

import { useState } from 'react'
import type { Producto } from '@/types/pos'
import type { ProductoConEstado } from '@/lib/productos'
import {
  crearProductoAction,
  actualizarProductoAction,
  toggleActivoAction,
} from '@/app/actions/admin-productos'

type FormState = {
  nombre: string
  precio: string
  sku: string
  stock: string
  categoria: string
}

const FORM_VACIO: FormState = { nombre: '', precio: '', sku: '', stock: '0', categoria: '' }

function productoAForm(p: Producto): FormState {
  return {
    nombre:    p.nombre,
    precio:    String(p.precio),
    sku:       p.sku ?? '',
    stock:     String(p.stock ?? 0),
    categoria: p.categoria ?? '',
  }
}

function formADatos(f: FormState): Omit<Producto, 'id'> {
  return {
    nombre:    f.nombre.trim(),
    precio:    parseFloat(f.precio),
    sku:       f.sku.trim() || undefined,
    stock:     parseInt(f.stock || '0', 10),
    categoria: f.categoria.trim() || undefined,
  }
}

// ─── Form inline ─────────────────────────────────────────────────

interface FormProps {
  form: FormState
  onChange: (f: FormState) => void
  guardando: boolean
  onGuardar: () => void
  onCancelar: () => void
  titulo: string
}

function ProductoForm({ form, onChange, guardando, onGuardar, onCancelar, titulo }: FormProps) {
  const valido = form.nombre.trim() !== '' && parseFloat(form.precio) > 0
  const f = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [key]: e.target.value })

  return (
    <div className="pos-card p-4 space-y-3">
      <p className="text-sm font-semibold text-primary">{titulo}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2">
          <label className="text-xs text-gray-400 block mb-1">Nombre *</label>
          <input
            value={form.nombre}
            onChange={f('nombre')}
            autoFocus
            placeholder="Nombre del producto"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Precio *</label>
          <input
            type="number" min="0" step="0.01"
            value={form.precio}
            onChange={f('precio')}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">SKU</label>
          <input
            value={form.sku}
            onChange={f('sku')}
            placeholder="7501000000000"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Stock</label>
          <input
            type="number" min="0"
            value={form.stock}
            onChange={f('stock')}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Categoría</label>
          <input
            value={form.categoria}
            onChange={f('categoria')}
            placeholder="Bebidas…"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancelar}
          className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={onGuardar}
          disabled={!valido || guardando}
          className="px-4 py-1.5 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-40 hover:bg-accent-dark transition-colors"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

// ─── Gestor principal ─────────────────────────────────────────────

export function GestorCatalogo({ productosIniciales }: { productosIniciales: ProductoConEstado[] }) {
  const [productos, setProductos] = useState(productosIniciales)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() {
    setForm(FORM_VACIO)
    setEditandoId(null)
    setMostrarNuevo(true)
  }

  function abrirEditar(p: ProductoConEstado) {
    setForm(productoAForm(p))
    setEditandoId(p.id)
    setMostrarNuevo(false)
  }

  function cancelar() {
    setMostrarNuevo(false)
    setEditandoId(null)
  }

  async function guardar() {
    setGuardando(true)
    try {
      const datos = formADatos(form)
      if (editandoId) {
        await actualizarProductoAction(editandoId, datos)
        setProductos(prev =>
          prev.map(p => p.id === editandoId ? { ...p, ...datos } : p)
        )
        setEditandoId(null)
      } else {
        const nuevo = await crearProductoAction(datos)
        setProductos(prev => [...prev, { ...nuevo, activo: true }])
        setMostrarNuevo(false)
      }
      setForm(FORM_VACIO)
    } finally {
      setGuardando(false)
    }
  }

  async function handleToggle(id: string) {
    await toggleActivoAction(id)
    setProductos(prev => prev.map(p => p.id === id ? { ...p, activo: !p.activo } : p))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Catálogo de productos</h1>
        <button
          onClick={abrirNuevo}
          className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      {mostrarNuevo && (
        <ProductoForm
          form={form}
          onChange={setForm}
          guardando={guardando}
          onGuardar={guardar}
          onCancelar={cancelar}
          titulo="Nuevo producto"
        />
      )}

      {editandoId && (
        <ProductoForm
          form={form}
          onChange={setForm}
          guardando={guardando}
          onGuardar={guardar}
          onCancelar={cancelar}
          titulo={`Editando: ${productos.find(p => p.id === editandoId)?.nombre}`}
        />
      )}

      <div className="pos-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Categoría</th>
              <th className="text-center px-4 py-3">Estado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {productos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No hay productos. Agrega el primero.
                </td>
              </tr>
            )}
            {productos.map(p => (
              <tr key={p.id} className={!p.activo ? 'opacity-40' : ''}>
                <td className="px-4 py-3 font-medium text-primary">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.sku ?? '—'}</td>
                <td className="px-4 py-3 text-right font-semibold">${p.precio.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{p.stock ?? 0}</td>
                <td className="px-4 py-3 text-gray-500">{p.categoria ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.activo ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => abrirEditar(p)}
                    className="text-xs text-accent hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggle(p.id)}
                    className="text-xs text-gray-400 hover:text-danger transition-colors"
                  >
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

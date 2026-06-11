import { useEffect, useState } from 'react'
import type { Ingredient, CreateIngredientPayload, IngredientType } from '../types/ingredient'
import { INGREDIENT_TYPES, UNIT_OPTIONS } from '../types/ingredient'
import { listIngredients, countIngredients, createIngredient, toggleAvailability } from '../api/ingredients'
import IngredientDetailModal from '../components/IngredientDetailModal'

const EMPTY_FORM: CreateIngredientPayload = {
  name: '',
  description: '',
  ingredient_type: 'produce',
  quantity: null,
  unit: null,
  is_available: true,
}

const PAGE_SIZES = [10, 20, 50]

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateIngredientPayload>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [availFilter, setAvailFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, typeFilter, availFilter, pageSize])

  const load = async () => {
    setLoading(true)
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(typeFilter ? { ingredient_type: typeFilter } : {}),
        ...(availFilter !== '' ? { is_available: availFilter === 'true' } : {}),
      }
      const [data, countData] = await Promise.all([
        listIngredients(params),
        countIngredients(params),
      ])
      setIngredients(data)
      setTotal(countData.total)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, pageSize, debouncedSearch, typeFilter, availFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createIngredient(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const updated = await toggleAvailability(id)
      setIngredients(prev => prev.map(i => i.id === updated.id ? updated : i))
    } catch (e) {
      setError(String(e))
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold foreground-content">Ingredients</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 background-primary text-white text-sm font-medium rounded hover:background-primary-hover"
        >
          {showForm ? 'Cancel' : '+ Add Ingredient'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 background-surface border border-line rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Name *</label>
              <input
                required
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Type</label>
              <select
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.ingredient_type}
                onChange={e => setForm(f => ({ ...f, ingredient_type: e.target.value as IngredientType }))}
              >
                {INGREDIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium foreground-content mb-1">Description</label>
              <input
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Quantity</label>
              <input
                type="number"
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.quantity ?? ''}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Unit</label>
              <select
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.unit ?? ''}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value as CreateIngredientPayload['unit'] || null }))}
              >
                <option value="">— none —</option>
                {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
            />
            Available
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 background-primary text-white text-sm font-medium rounded hover:background-primary-hover disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Create Ingredient'}
          </button>
        </form>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search ingredients..."
          className="border border-line rounded px-3 py-1.5 text-sm w-52"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-line rounded px-3 py-1.5 text-sm"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          {INGREDIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="border border-line rounded px-3 py-1.5 text-sm"
          value={availFilter}
          onChange={e => setAvailFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Out of stock</option>
        </select>
        <select
          className="border border-line rounded px-3 py-1.5 text-sm"
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s} per page</option>)}
        </select>
        <span className="ml-auto text-xs foreground-subtle">{total} result{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <p className="foreground-subtle text-sm">Loading...</p>
      ) : (
        <>
          <div className="background-surface border border-line rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="background-canvas border-b border-line">
                <tr>
                  {['ID', 'Name', 'Type', 'Qty / Unit', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium foreground-subtle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {ingredients.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center foreground-dim">No ingredients found.</td></tr>
                ) : ingredients.map(ing => (
                  <tr key={ing.id} className="hover:background-surface-raised cursor-pointer" onClick={() => setSelectedIngredient(ing)}>
                    <td className="px-4 py-2 foreground-dim">{ing.id}</td>
                    <td className="px-4 py-2 font-medium foreground-content">{ing.name}</td>
                    <td className="px-4 py-2 foreground-subtle capitalize">{ing.ingredient_type}</td>
                    <td className="px-4 py-2 foreground-subtle">
                      {ing.quantity != null ? `${ing.quantity} ${ing.unit}` : ing.unit || '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        ing.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {ing.is_available ? 'Available' : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={e => { e.stopPropagation(); handleToggle(ing.id) }}
                        className="text-xs foreground-primary hover:underline"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs foreground-subtle">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs border border-line rounded hover:background-surface-raised disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs border border-line rounded hover:background-surface-raised disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      {selectedIngredient && (
        <IngredientDetailModal
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
          onSaved={updated => {
            setIngredients(prev => prev.map(i => i.id === updated.id ? updated : i))
            setSelectedIngredient(null)
          }}
        />
      )}
    </div>
  )
}

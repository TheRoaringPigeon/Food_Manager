import { useEffect, useState } from 'react'
import type { Ingredient, CreateIngredientPayload, IngredientType } from '../types/ingredient'
import { INGREDIENT_TYPES } from '../types/ingredient'
import { listIngredients, createIngredient, toggleAvailability } from '../api/ingredients'

const EMPTY_FORM: CreateIngredientPayload = {
  name: '',
  description: '',
  ingredient_type: 'produce',
  quantity: null,
  unit: '',
  is_available: true,
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateIngredientPayload>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setIngredients(await listIngredients())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Ingredients</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
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
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white border border-gray-200 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
              <input
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.ingredient_type}
                onChange={e => setForm(f => ({ ...f, ingredient_type: e.target.value as IngredientType }))}
              >
                {INGREDIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.quantity ?? ''}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                placeholder="kg, cup, tsp..."
                value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              />
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
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Create Ingredient'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Name', 'Type', 'Qty / Unit', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ingredients.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No ingredients yet.</td></tr>
              ) : ingredients.map(ing => (
                <tr key={ing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400">{ing.id}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{ing.name}</td>
                  <td className="px-4 py-2 text-gray-600 capitalize">{ing.ingredient_type}</td>
                  <td className="px-4 py-2 text-gray-600">
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
                      onClick={() => handleToggle(ing.id)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import type { Ingredient, IngredientType, UpdateIngredientPayload } from '../types/ingredient'
import { INGREDIENT_TYPES, UNIT_OPTIONS } from '../types/ingredient'
import { updateIngredient, deleteIngredient } from '../api/ingredients'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

interface Props {
  ingredient: Ingredient
  onClose: () => void
  onSaved: (updated: Ingredient) => void
  onDeleted: () => void
}

export default function IngredientDetailModal({ ingredient, onClose, onSaved, onDeleted }: Props) {
  const { isAdmin } = useAuth()
  const { ingredientIds, addIngredient, removeIngredient } = useCart()
  const [form, setForm] = useState<UpdateIngredientPayload>({
    name: ingredient.name,
    description: ingredient.description,
    ingredient_type: ingredient.ingredient_type,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    is_available: ingredient.is_available,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteIngredient(ingredient.id)
      onDeleted()
    } catch (e) {
      setError(String(e))
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const updated = await updateIngredient(ingredient.id, form)
      onSaved(updated)
    } catch (e) {
      setError(String(e))
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <div
        className="background-surface rounded-lg shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-lg font-semibold foreground-content">Ingredient Details</h2>
          <button
            onClick={onClose}
            className="foreground-dim hover:foreground-subtle text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Name *</label>
              <input
                required
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.name ?? ''}
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
                value={form.description ?? ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                step="any"
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
                onChange={e => setForm(f => ({ ...f, unit: e.target.value as UpdateIngredientPayload['unit'] || null }))}
              >
                <option value="">— none —</option>
                {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm foreground-content">
            <input
              type="checkbox"
              checked={form.is_available ?? true}
              onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
            />
            Available
          </label>

          <div className="text-xs foreground-dim space-y-0.5 pt-1">
            <div>ID: {ingredient.id}</div>
            <div>Created: {new Date(ingredient.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(ingredient.updated_at).toLocaleDateString()}</div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 background-primary text-white text-sm font-medium rounded hover:background-primary-hover disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium foreground-content border border-line rounded hover:background-surface-raised"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => ingredientIds.includes(ingredient.id) ? removeIngredient(ingredient.id) : addIngredient(ingredient.id)}
              className={`px-3 py-2 text-sm font-medium border rounded ${
                ingredientIds.includes(ingredient.id)
                  ? 'foreground-primary border-current'
                  : 'foreground-subtle border-line hover:background-surface-raised'
              }`}
            >
              {ingredientIds.includes(ingredient.id) ? '✓ In Cart' : '+ Cart'}
            </button>
            {isAdmin && (
              <div className="ml-auto flex gap-2">
                {confirmingDelete ? (
                  <>
                    <span className="text-sm foreground-subtle self-center">Delete this ingredient?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="px-3 py-1.5 text-sm font-medium foreground-content border border-line rounded hover:background-surface-raised"
                    >
                      No, keep it
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

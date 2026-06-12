import { useState } from 'react'
import type { Recipe, RecipeType, RecipeIngredient, UpdateRecipePayload } from '../types/recipe'
import { RECIPE_TYPES } from '../types/recipe'
import { updateRecipe, deleteRecipe } from '../api/recipes'
import { useAuth } from '../context/AuthContext'

interface Props {
  recipe: Recipe
  onClose: () => void
  onSaved: (updated: Recipe) => void
  onDeleted: () => void
}

const BLANK_ING: RecipeIngredient = { name: '', quantity: null, unit: null }

export default function RecipeDetailModal({ recipe, onClose, onSaved, onDeleted }: Props) {
  const { isAdmin } = useAuth()
  const [form, setForm] = useState<UpdateRecipePayload>({
    name: recipe.name,
    description: recipe.description,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    servings: recipe.servings,
    recipe_type: recipe.recipe_type,
  })
  const [ingredientRows, setIngredientRows] = useState<RecipeIngredient[]>(
    recipe.ingredients.length > 0 ? recipe.ingredients : [{ ...BLANK_ING }]
  )
  const [instructionsText, setInstructionsText] = useState(recipe.instructions.join('\n'))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteRecipe(recipe.id)
      onDeleted()
    } catch (e) {
      setError(String(e))
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const updateRow = (i: number, patch: Partial<RecipeIngredient>) =>
    setIngredientRows(rows => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r))

  const removeRow = (i: number) =>
    setIngredientRows(rows => rows.filter((_, idx) => idx !== i))

  const addRow = () =>
    setIngredientRows(rows => [...rows, { ...BLANK_ING }])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload: UpdateRecipePayload = {
        ...form,
        ingredients: ingredientRows.filter(r => r.name.trim()),
        instructions: instructionsText.split('\n').map(s => s.trim()).filter(Boolean),
      }
      const updated = await updateRecipe(recipe.id, payload)
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
        className="background-surface rounded-lg shadow-xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-lg font-semibold foreground-content">Recipe Details</h2>
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
                value={form.recipe_type}
                onChange={e => setForm(f => ({ ...f, recipe_type: e.target.value as RecipeType }))}
              >
                {RECIPE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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

            <div className="col-span-2">
              <label className="block text-xs font-medium foreground-content mb-1">Ingredients</label>
              <div className="space-y-1.5">
                {ingredientRows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="flex-1 border border-line rounded px-3 py-1.5 text-sm"
                      placeholder="Name"
                      value={row.name}
                      onChange={e => updateRow(i, { name: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-20 border border-line rounded px-3 py-1.5 text-sm"
                      placeholder="Qty"
                      value={row.quantity ?? ''}
                      onChange={e => updateRow(i, { quantity: e.target.value ? Number(e.target.value) : null })}
                    />
                    <input
                      className="w-20 border border-line rounded px-3 py-1.5 text-sm"
                      placeholder="Unit"
                      value={row.unit ?? ''}
                      onChange={e => updateRow(i, { unit: e.target.value || null })}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="foreground-dim hover:foreground-content text-lg leading-none px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRow}
                  className="text-xs foreground-primary hover:underline"
                >
                  + Add ingredient
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium foreground-content mb-1">Instructions (one per line)</label>
              <textarea
                rows={5}
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={instructionsText}
                onChange={e => setInstructionsText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Prep time (min)</label>
              <input
                type="number"
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.prep_time ?? ''}
                onChange={e => setForm(f => ({ ...f, prep_time: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Cook time (min)</label>
              <input
                type="number"
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.cook_time ?? ''}
                onChange={e => setForm(f => ({ ...f, cook_time: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium foreground-content mb-1">Servings</label>
              <input
                type="number"
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={form.servings ?? ''}
                onChange={e => setForm(f => ({ ...f, servings: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
          </div>

          <div className="text-xs foreground-dim space-y-0.5 pt-1">
            <div>ID: {recipe.id}</div>
            {recipe.last_cooked && <div>Last cooked: {new Date(recipe.last_cooked).toLocaleDateString()}</div>}
            <div>Created: {new Date(recipe.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(recipe.updated_at).toLocaleDateString()}</div>
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
            {isAdmin && (
              <div className="ml-auto flex gap-2">
                {confirmingDelete ? (
                  <>
                    <span className="text-sm foreground-subtle self-center">Delete this recipe?</span>
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

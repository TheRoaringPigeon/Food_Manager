import { useState } from 'react'
import type { Recipe, RecipeType, UpdateRecipePayload } from '../types/recipe'
import { RECIPE_TYPES } from '../types/recipe'
import { updateRecipe } from '../api/recipes'

interface Props {
  recipe: Recipe
  onClose: () => void
  onSaved: (updated: Recipe) => void
}

export default function RecipeDetailModal({ recipe, onClose, onSaved }: Props) {
  const [form, setForm] = useState<UpdateRecipePayload>({
    name: recipe.name,
    description: recipe.description,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    servings: recipe.servings,
    recipe_type: recipe.recipe_type,
    is_favorite: recipe.is_favorite,
  })
  const [ingredientsText, setIngredientsText] = useState(recipe.ingredients.join(', '))
  const [instructionsText, setInstructionsText] = useState(recipe.instructions.join('\n'))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload: UpdateRecipePayload = {
        ...form,
        ingredients: ingredientsText.split(',').map(s => s.trim()).filter(Boolean),
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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recipe Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
              <input
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.name ?? ''}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.recipe_type}
                onChange={e => setForm(f => ({ ...f, recipe_type: e.target.value as RecipeType }))}
              >
                {RECIPE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.description ?? ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Ingredients (comma-separated)</label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={ingredientsText}
                onChange={e => setIngredientsText(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Instructions (one per line)</label>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={instructionsText}
                onChange={e => setInstructionsText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prep time (min)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.prep_time ?? ''}
                onChange={e => setForm(f => ({ ...f, prep_time: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cook time (min)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.cook_time ?? ''}
                onChange={e => setForm(f => ({ ...f, cook_time: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Servings</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                value={form.servings ?? ''}
                onChange={e => setForm(f => ({ ...f, servings: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_favorite ?? false}
              onChange={e => setForm(f => ({ ...f, is_favorite: e.target.checked }))}
            />
            Favorite
          </label>

          <div className="text-xs text-gray-400 space-y-0.5 pt-1">
            <div>ID: {recipe.id}</div>
            {recipe.last_cooked && <div>Last cooked: {new Date(recipe.last_cooked).toLocaleDateString()}</div>}
            <div>Created: {new Date(recipe.created_at).toLocaleDateString()}</div>
            <div>Updated: {new Date(recipe.updated_at).toLocaleDateString()}</div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

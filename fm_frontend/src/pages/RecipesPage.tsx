import { useEffect, useState } from 'react'
import type { Recipe, CreateRecipePayload, RecipeType } from '../types/recipe'
import { RECIPE_TYPES } from '../types/recipe'
import { listRecipes, countRecipes, createRecipe, toggleFavorite, markCooked } from '../api/recipes'

const EMPTY_FORM: CreateRecipePayload = {
  name: '',
  description: '',
  ingredients: [],
  instructions: [],
  prep_time: null,
  cook_time: null,
  servings: null,
  recipe_type: 'dinner',
  is_favorite: false,
}

const PAGE_SIZES = [10, 20, 50]
const TIME_OPTIONS = [
  { label: 'Any total time', value: '' },
  { label: '≤15 min', value: '15' },
  { label: '≤30 min', value: '30' },
  { label: '≤60 min', value: '60' },
  { label: '≤120 min', value: '120' },
]

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateRecipePayload>(EMPTY_FORM)
  const [ingredientsText, setIngredientsText] = useState('')
  const [instructionsText, setInstructionsText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [favFilter, setFavFilter] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, typeFilter, favFilter, maxTime, pageSize])

  const load = async () => {
    setLoading(true)
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(typeFilter ? { recipe_type: typeFilter } : {}),
        ...(favFilter !== '' ? { is_favorite: favFilter === 'true' } : {}),
        ...(maxTime ? { max_total_time: Number(maxTime) } : {}),
      }
      const [data, countData] = await Promise.all([
        listRecipes(params),
        countRecipes(params),
      ])
      setRecipes(data)
      setTotal(countData.total)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page, pageSize, debouncedSearch, typeFilter, favFilter, maxTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: CreateRecipePayload = {
        ...form,
        ingredients: ingredientsText.split(',').map(s => s.trim()).filter(Boolean),
        instructions: instructionsText.split('\n').map(s => s.trim()).filter(Boolean),
      }
      await createRecipe(payload)
      setForm(EMPTY_FORM)
      setIngredientsText('')
      setInstructionsText('')
      setShowForm(false)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleFavorite = async (id: number) => {
    try {
      const updated = await toggleFavorite(id)
      setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r))
    } catch (e) {
      setError(String(e))
    }
  }

  const handleMarkCooked = async (id: number) => {
    try {
      const updated = await markCooked(id)
      setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r))
    } catch (e) {
      setError(String(e))
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Recipe'}
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
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Ingredients (comma-separated)</label>
              <textarea
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                placeholder="flour, sugar, eggs..."
                value={ingredientsText}
                onChange={e => setIngredientsText(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Instructions (one per line)</label>
              <textarea
                rows={4}
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
              checked={form.is_favorite}
              onChange={e => setForm(f => ({ ...f, is_favorite: e.target.checked }))}
            />
            Favorite
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Create Recipe'}
          </button>
        </form>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Search recipes or ingredients..."
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          {RECIPE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          value={favFilter}
          onChange={e => setFavFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="true">Favorites only</option>
          <option value="false">Non-favorites</option>
        </select>
        <select
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          value={maxTime}
          onChange={e => setMaxTime(e.target.value)}
        >
          {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s} per page</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-500">{total} result{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'Name', 'Type', 'Times', 'Last Cooked', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recipes.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No recipes found.</td></tr>
                ) : recipes.map(recipe => (
                  <tr key={recipe.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400">{recipe.id}</td>
                    <td className="px-4 py-2">
                      <span className="font-medium text-gray-900">{recipe.name}</span>
                      {recipe.is_favorite && <span className="ml-1 text-yellow-500">★</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-600 capitalize">{recipe.recipe_type}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {[
                        recipe.prep_time != null && `Prep ${recipe.prep_time}m`,
                        recipe.cook_time != null && `Cook ${recipe.cook_time}m`,
                      ].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {recipe.last_cooked ? new Date(recipe.last_cooked).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleToggleFavorite(recipe.id)}
                        className="text-xs text-yellow-600 hover:underline"
                      >
                        {recipe.is_favorite ? 'Unfavorite' : 'Favorite'}
                      </button>
                      <button
                        onClick={() => handleMarkCooked(recipe.id)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Cooked
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

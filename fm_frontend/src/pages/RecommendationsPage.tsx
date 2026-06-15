import { useState, useEffect, useRef } from 'react'
import { listIngredients } from '../api/ingredients'
import type { Ingredient } from '../types/ingredient'
import { getRecommendation, type RecommendationResponse } from '../api/recommendations'
import { useCart } from '../context/CartContext'

export default function RecommendationsPage() {
  const { recipeIds, addRecipe, removeRecipe } = useCart()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listIngredients({ limit: 500, sort_by: 'name', sort_dir: 'asc' })
      .then(setAllIngredients)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredIngredients = allIngredients.filter(
    ing => ing.name.toLowerCase().includes(pickerSearch.toLowerCase()) && !selected.includes(ing.name)
  )

  const toggleIngredient = (name: string) => {
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const removeIngredient = (name: string) => setSelected(prev => prev.filter(n => n !== name))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() && selected.length === 0) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      setResult(await getRecommendation(query.trim(), selected))
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold foreground-content mb-1">What should I cook?</h1>
      <p className="foreground-subtle text-sm mb-4">
        Pick ingredients you have on hand, describe what you're craving, or both.
      </p>

      <div className="mb-4">
        <label className="block text-sm font-medium foreground-content mb-1">
          Your ingredients <span className="foreground-subtle font-normal">(optional)</span>
        </label>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selected.map(name => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-0.5 background-primary-soft foreground-primary text-xs rounded-full"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removeIngredient(name)}
                  className="hover:opacity-70"
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-xs foreground-subtle hover:foreground-content underline"
            >
              clear all
            </button>
          </div>
        )}

        <div className="relative" ref={pickerRef}>
          <input
            className="w-full border border-line rounded px-3 py-2 text-sm"
            placeholder="Search ingredients..."
            value={pickerSearch}
            onChange={e => { setPickerSearch(e.target.value); setPickerOpen(true) }}
            onFocus={() => setPickerOpen(true)}
          />
          {pickerOpen && filteredIngredients.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 background-surface border border-line rounded shadow-md max-h-48 overflow-y-auto text-sm">
              {filteredIngredients.slice(0, 30).map(ing => (
                <li key={ing.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-1.5 hover:background-surface-raised foreground-content"
                    onClick={() => {
                      toggleIngredient(ing.name)
                      setPickerSearch('')
                      setPickerOpen(false)
                    }}
                  >
                    {ing.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          className="flex-1 border border-line rounded px-3 py-2 text-sm"
          placeholder="Describe what you're craving..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || (!query.trim() && selected.length === 0)}
          className="px-4 py-2 background-primary text-white text-sm font-medium rounded hover:background-primary-hover disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Find recipe'}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
      )}

      {result && (
        <div className="background-surface border border-line rounded-lg overflow-hidden">
          <div className="p-4 border-b border-divider background-primary-soft">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold foreground-content">{result.recipe_name}</h2>
              {result.recipe_id && (
                <button
                  type="button"
                  onClick={() => {
                    const id = Number(result.recipe_id)
                    recipeIds.includes(id) ? removeRecipe(id) : addRecipe(id)
                  }}
                  className={`flex-shrink-0 px-3 py-1 text-xs font-medium border rounded ${
                    recipeIds.includes(Number(result.recipe_id))
                      ? 'foreground-primary border-current'
                      : 'foreground-subtle border-line hover:background-surface-raised'
                  }`}
                >
                  {recipeIds.includes(Number(result.recipe_id)) ? '✓ In Cart' : '+ Cart'}
                </button>
              )}
            </div>
            {result.description && (
              <p className="foreground-subtle text-sm mt-1">{result.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-xs foreground-subtle">
              {result.prep_time != null && <span>Prep: {result.prep_time} min</span>}
              {result.cook_time != null && <span>Cook: {result.cook_time} min</span>}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <section>
              <h3 className="text-sm font-semibold foreground-content mb-1">Why this recipe?</h3>
              <p className="text-sm foreground-subtle">{result.why}</p>
            </section>

            {(result.have_ingredients.length > 0 || result.missing_ingredients.length > 0 || Object.keys(result.substitutions).length > 0) && (
              <section>
                <h3 className="text-sm font-semibold foreground-content mb-1">Ingredient match</h3>
                {result.have_ingredients.length > 0 && (
                  <p className="text-xs foreground-subtle mb-1">
                    <span className="font-medium text-green-700">Have: </span>
                    {result.have_ingredients.join(', ')}
                  </p>
                )}
                {result.missing_ingredients.length > 0 && (
                  <p className="text-xs foreground-subtle mb-1">
                    <span className="font-medium text-red-600">Missing: </span>
                    {result.missing_ingredients.join(', ')}
                  </p>
                )}
                {Object.keys(result.substitutions).length > 0 && (
                  <p className="text-xs foreground-subtle">
                    <span className="font-medium foreground-content">Substitutions: </span>
                    {Object.entries(result.substitutions).map(([k, v]) => `${k} → ${v}`).join('; ')}
                  </p>
                )}
              </section>
            )}

            {result.ingredients && result.ingredients.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold foreground-content mb-1">Ingredients</h3>
                <ul className="text-sm foreground-subtle space-y-0.5">
                  {result.ingredients.map((ing, i) => <li key={i}>• {ing}</li>)}
                </ul>
              </section>
            )}

            {result.instructions && result.instructions.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold foreground-content mb-1">Instructions</h3>
                <ol className="text-sm foreground-subtle space-y-1 list-decimal list-inside">
                  {result.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </section>
            )}

            {result.image_url && (
              <section>
                <h3 className="text-sm font-semibold foreground-content mb-1">Image</h3>
                <a
                  href={result.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs foreground-primary hover:underline break-all"
                >
                  {result.image_url}
                </a>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { getRecommendation, type RecommendationResponse } from '../api/recommendations'

export default function RecommendationsPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      setResult(await getRecommendation(query.trim()))
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">What should I cook?</h1>
      <p className="text-gray-500 text-sm mb-4">
        Tell me what you're craving and I'll find the best match from your recipes.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="e.g. something warm and comforting..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Find recipe'}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
      )}

      {result && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-indigo-50">
            <h2 className="text-lg font-bold text-gray-900">{result.recipe_name}</h2>
            {result.description && (
              <p className="text-gray-600 text-sm mt-1">{result.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              {result.prep_time != null && <span>Prep: {result.prep_time} min</span>}
              {result.cook_time != null && <span>Cook: {result.cook_time} min</span>}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Why this recipe?</h3>
              <p className="text-sm text-gray-600">{result.why}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Pantry status</h3>
              {result.have_ingredients.length > 0 && (
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium text-green-700">Have: </span>
                  {result.have_ingredients.join(', ')}
                </p>
              )}
              {result.missing_ingredients.length > 0 && (
                <p className="text-xs text-gray-600 mb-1">
                  <span className="font-medium text-red-600">Missing: </span>
                  {result.missing_ingredients.join(', ')}
                </p>
              )}
              {Object.keys(result.substitutions).length > 0 && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium text-gray-700">Substitutions: </span>
                  {Object.entries(result.substitutions).map(([k, v]) => `${k} → ${v}`).join('; ')}
                </p>
              )}
            </section>

            {result.ingredients && result.ingredients.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Ingredients</h3>
                <ul className="text-sm text-gray-600 space-y-0.5">
                  {result.ingredients.map((ing, i) => <li key={i}>• {ing}</li>)}
                </ul>
              </section>
            )}

            {result.instructions && result.instructions.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Instructions</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  {result.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </section>
            )}

            {result.image_url && (
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Image</h3>
                <a
                  href={result.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline break-all"
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

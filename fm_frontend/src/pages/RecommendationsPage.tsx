import { useState, useEffect, useRef } from 'react'
import { listIngredients } from '../api/ingredients'
import type { Ingredient } from '../types/ingredient'
import { streamRecommendation } from '../api/recommendations'
import type { CandidateRecipe, WinnerDetails } from '../api/recommendations'
import { identifyIngredients } from '../api/ingredient_vision'
import { useCart } from '../context/CartContext'
import RecommendationCandidateModal from '../components/RecommendationCandidateModal'
import IngredientScanModal from '../components/IngredientScanModal'

export default function RecommendationsPage() {
  const { recipeIds, addRecipe, removeRecipe } = useCart()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Streaming state
  const [messages, setMessages] = useState<string[]>([])
  const [candidates, setCandidates] = useState<CandidateRecipe[]>([])
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [winnerDetails, setWinnerDetails] = useState<WinnerDetails | null>(null)
  const [logExpanded, setLogExpanded] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecipe | null>(null)

  // Ref so the result event handler can read the latest candidates without stale closure
  const candidatesRef = useRef<CandidateRecipe[]>([])

  // Ingredient scan state
  const scanInputRef = useRef<HTMLInputElement>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanIngredients, setScanIngredients] = useState<string[]>([])
  const [scanError, setScanError] = useState<string | null>(null)

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setScanIngredients([])
    setScanError(null)
    setScanLoading(true)
    setScanOpen(true)
    try {
      const result = await identifyIngredients(file)
      setScanIngredients(result)
    } catch (err) {
      setScanError(String(err))
    } finally {
      setScanLoading(false)
    }
  }

  const handleScanConfirm = (names: string[]) => {
    setSelected(prev => {
      const merged = [...prev]
      for (const n of names) {
        if (!merged.includes(n)) merged.push(n)
      }
      return merged
    })
    setScanOpen(false)
  }

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
    setMessages([])
    setCandidates([])
    candidatesRef.current = []
    setWinnerId(null)
    setWinnerDetails(null)
    setLogExpanded(true)

    try {
      await streamRecommendation(query.trim(), selected, (event) => {
        if (event.type === 'sql_candidates') {
          const msg = event.count > 0
            ? `Found ${event.count} recipe${event.count !== 1 ? 's' : ''} matching your ingredients`
            : 'No direct ingredient matches — searching semantically across all recipes'
          setMessages(prev => [...prev, msg])

        } else if (event.type === 'semantic_search') {
          setMessages(prev => [
            ...prev,
            `Searching for "${event.query}" — found ${event.chroma_count} semantic match${event.chroma_count !== 1 ? 'es' : ''}`,
          ])

        } else if (event.type === 'top5') {
          setMessages(prev => [
            ...prev,
            `Narrowed to ${event.candidates.length} candidates, asking the LLM to pick the best one...`,
          ])
          setCandidates(event.candidates)
          candidatesRef.current = event.candidates

        } else if (event.type === 'result') {
          const winner = candidatesRef.current.find(c => c.id === event.recipe_id)
          setMessages(prev => [
            ...prev,
            `Done! LLM chose: ${winner?.name ?? event.recipe_id}`,
          ])
          setWinnerId(event.recipe_id)
          setWinnerDetails({
            why: event.why,
            have_ingredients: event.have_ingredients,
            missing_ingredients: event.missing_ingredients,
            substitutions: event.substitutions,
          })
          setLogExpanded(false)

        } else if (event.type === 'error') {
          setError(event.message)
        }
      })
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const hasDone = !loading && candidates.length > 0

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
          <div className="flex gap-2">
            <input
              className="flex-1 border border-line rounded px-3 py-2 text-sm"
              placeholder="Search ingredients..."
              value={pickerSearch}
              onChange={e => { setPickerSearch(e.target.value); setPickerOpen(true) }}
              onFocus={() => setPickerOpen(true)}
            />
            <button
              type="button"
              title="Scan ingredients from photo"
              onClick={() => scanInputRef.current?.click()}
              className="px-3 py-2 border border-line rounded text-sm foreground-subtle hover:background-surface-raised flex-shrink-0"
            >
              📷
            </button>
            <input
              ref={scanInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleScanFile}
            />
          </div>
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
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm mb-4">{error}</div>
      )}

      {/* Status log — visible while loading, collapsible after done */}
      {(loading || messages.length > 0) && (
        <div className="background-surface border border-line rounded-lg mb-4 overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium foreground-content hover:background-surface-raised text-left"
            onClick={() => setLogExpanded(e => !e)}
          >
            <span>
              {loading
                ? 'Thinking...'
                : hasDone
                  ? `Done — ${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} found`
                  : 'Processing...'}
            </span>
            <span className="foreground-subtle text-xs ml-2">{logExpanded ? '▾' : '▸'}</span>
          </button>

          {logExpanded && (
            <div className="border-t border-divider px-4 py-3 space-y-2">
              {messages.map((msg, i) => (
                <p key={i} className="text-sm foreground-subtle flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✓</span>
                  {msg}
                </p>
              ))}
              {loading && (
                <p className="text-sm foreground-dim animate-pulse flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">···</span>
                  Working...
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Candidate cards */}
      {candidates.length > 0 && (
        <div className="space-y-2">
          {candidates.map((c, i) => {
            const isWinner = c.id === winnerId
            const recipeId = Number(c.id)
            const inCart = !isNaN(recipeId) && recipeId > 0 && recipeIds.includes(recipeId)

            return (
              <div
                key={c.id}
                className={`background-surface border rounded-lg p-3 cursor-pointer hover:background-surface-raised transition-colors ${
                  isWinner ? 'border-primary' : 'border-line'
                }`}
                onClick={() => setSelectedCandidate(c)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs foreground-subtle font-medium">#{i + 1}</span>
                      {isWinner && (
                        <span className="px-1.5 py-0.5 background-primary text-white text-xs rounded font-medium">
                          LLM's Pick
                        </span>
                      )}
                    </div>
                    <p className="font-medium foreground-content truncate">{c.name}</p>
                    {c.description && (
                      <p className="text-xs foreground-subtle mt-0.5 line-clamp-1">{c.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs foreground-subtle">
                      {c.prep_time != null && <span>Prep: {c.prep_time}min</span>}
                      {c.cook_time != null && <span>Cook: {c.cook_time}min</span>}
                      {selected.length > 0 && (
                        <span>Match: {c.match_count}/{selected.length} ingredient{selected.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      inCart ? removeRecipe(recipeId) : addRecipe(recipeId)
                    }}
                    className={`flex-shrink-0 px-2.5 py-1 text-xs font-medium border rounded ${
                      inCart
                        ? 'foreground-primary border-current'
                        : 'foreground-subtle border-line hover:background-surface-raised'
                    }`}
                  >
                    {inCart ? '✓ Cart' : '+ Cart'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedCandidate && (
        <RecommendationCandidateModal
          candidate={selectedCandidate}
          rank={candidates.findIndex(c => c.id === selectedCandidate.id) + 1}
          isWinner={selectedCandidate.id === winnerId}
          winnerDetails={winnerDetails ?? undefined}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {scanOpen && (
        <IngredientScanModal
          loading={scanLoading}
          ingredients={scanIngredients}
          error={scanError}
          onConfirm={handleScanConfirm}
          onClose={() => setScanOpen(false)}
        />
      )}
    </div>
  )
}

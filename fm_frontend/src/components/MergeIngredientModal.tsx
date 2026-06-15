import { useState, useEffect } from 'react'
import type { Ingredient } from '../types/ingredient'
import { listIngredients, mergeIngredients } from '../api/ingredients'

interface Props {
  ingredient: Ingredient
  onClose: () => void
  onMerged: (survivor: Ingredient) => void
}

export default function MergeIngredientModal({ ingredient, onClose, onMerged }: Props) {
  const [step, setStep] = useState<'search' | 'resolve'>('search')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Ingredient[]>([])
  const [target, setTarget] = useState<Ingredient | null>(null)
  const [keepId, setKeepId] = useState<number | null>(null)
  const [chosenSide, setChosenSide] = useState<'a' | 'b' | null>(null)
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    if (!debouncedTerm) { setSearchResults([]); return }
    listIngredients({ search: debouncedTerm, limit: 10 })
      .then(results => setSearchResults(results.filter(r => r.id !== ingredient.id)))
      .catch(() => setSearchResults([]))
  }, [debouncedTerm, ingredient.id])

  const a = ingredient
  const b = target

  const aHasQty = a.quantity != null
  const bHasQty = b?.quantity != null
  const bothHaveQty = aHasQty && bHasQty
  const eitherHasQty = aHasQty || bHasQty

  const autoSide: 'a' | 'b' | null = bothHaveQty ? null : aHasQty ? 'a' : bHasQty ? 'b' : null
  const effectiveSide = bothHaveQty ? chosenSide : autoSide

  const deleteId = keepId === a.id ? b?.id : a.id
  const deleteName = keepId === a.id ? b?.name : a.name

  const canSubmit =
    keepId != null &&
    deleteId != null &&
    (!eitherHasQty || effectiveSide != null)

  const handleSelectTarget = (ing: Ingredient) => {
    setTarget(ing)
    setKeepId(null)
    setChosenSide(null)
    setStep('resolve')
  }

  const handleMerge = async () => {
    if (!b || keepId == null || deleteId == null) return
    setMerging(true)
    setError(null)

    const srcSide = effectiveSide === 'a' ? a : b
    const quantity = eitherHasQty ? srcSide.quantity : null
    const unit = eitherHasQty ? srcSide.unit : null

    try {
      const survivor = await mergeIngredients({
        keep_id: keepId,
        delete_id: deleteId,
        quantity,
        unit,
      })
      onMerged(survivor)
    } catch (e) {
      setError(String(e))
      setMerging(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-60 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={e => { e.stopPropagation(); onClose() }}
    >
      <div
        className="background-surface border border-line rounded-lg shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-lg font-semibold foreground-content">Merge Ingredient</h2>
          <button onClick={onClose} className="foreground-dim hover:foreground-subtle text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
          )}

          {step === 'search' && (
            <>
              <p className="text-sm foreground-content">Find the ingredient to merge with <strong>{a.name}</strong>:</p>
              <input
                autoFocus
                type="text"
                placeholder="Search ingredients..."
                className="w-full border border-line rounded px-3 py-1.5 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchResults.length > 0 && (
                <ul className="border border-line rounded divide-y divide-line">
                  {searchResults.map(ing => (
                    <li
                      key={ing.id}
                      className="px-3 py-2 text-sm foreground-content hover:background-surface-raised cursor-pointer flex justify-between"
                      onClick={() => handleSelectTarget(ing)}
                    >
                      <span className="font-medium">{ing.name}</span>
                      <span className="foreground-subtle capitalize">{ing.ingredient_type}</span>
                    </li>
                  ))}
                </ul>
              )}
              {debouncedTerm && searchResults.length === 0 && (
                <p className="text-sm foreground-dim">No results.</p>
              )}
            </>
          )}

          {step === 'resolve' && b && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([['a', a], ['b', b]] as const).map(([side, ing]) => (
                  <div
                    key={side}
                    className={`border rounded-lg p-3 space-y-1 ${keepId === ing.id ? 'border-amber-400 bg-amber-50' : 'border-line'}`}
                  >
                    <p className="font-semibold text-sm foreground-content">{ing.name}</p>
                    <p className="text-xs foreground-subtle capitalize">{ing.ingredient_type}</p>
                    {ing.quantity != null && (
                      <p className="text-xs foreground-subtle">{ing.quantity} {ing.unit ?? ''}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setKeepId(ing.id)}
                      className={`mt-2 w-full px-2 py-1 text-xs font-medium rounded border ${
                        keepId === ing.id
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'foreground-content border-line hover:background-surface-raised'
                      }`}
                    >
                      {keepId === ing.id ? '✓ Keeping this' : 'Keep this one'}
                    </button>
                  </div>
                ))}
              </div>

              {bothHaveQty && (
                <div className="space-y-1">
                  <p className="text-xs font-medium foreground-content">Which quantity to use?</p>
                  {(['a', 'b'] as const).map(side => {
                    const ing = side === 'a' ? a : b
                    return (
                      <label key={side} className="flex items-center gap-2 text-sm foreground-content cursor-pointer">
                        <input
                          type="radio"
                          name="qty-choice"
                          checked={chosenSide === side}
                          onChange={() => setChosenSide(side)}
                        />
                        Use {side === 'a' ? `A's` : `B's`}: {ing.quantity} {ing.unit ?? ''}
                      </label>
                    )
                  })}
                </div>
              )}

              {deleteName && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  This will permanently delete <strong>"{deleteName}"</strong> and update all recipes that use it.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep('search'); setTarget(null); setKeepId(null); setChosenSide(null) }}
                  className="px-3 py-1.5 text-sm foreground-content border border-line rounded hover:background-surface-raised"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!canSubmit || merging}
                  onClick={handleMerge}
                  className="px-4 py-1.5 text-sm font-medium bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                >
                  {merging ? 'Merging...' : `Merge & Delete "${deleteName ?? '...'}"`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

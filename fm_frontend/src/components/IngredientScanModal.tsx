import { useState, useEffect } from 'react'

interface Props {
  loading: boolean
  ingredients: string[]
  error: string | null
  onConfirm: (selected: string[]) => void
  onClose: () => void
}

export default function IngredientScanModal({ loading, ingredients, error, onConfirm, onClose }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && ingredients.length > 0) {
      setActive(new Set(ingredients))
    }
  }, [loading, ingredients])

  const toggle = (name: string) => {
    setActive(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const showResults = !loading && !error && ingredients.length > 0
  const showEmpty = !loading && !error && ingredients.length === 0

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="background-surface rounded-lg shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="text-base font-semibold foreground-content">Scanned ingredients</h2>
          <button onClick={onClose} className="foreground-dim hover:foreground-subtle text-xl leading-none">×</button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="flex items-center gap-3 py-6 justify-center">
              <span className="animate-spin text-xl inline-block">⟳</span>
              <span className="text-sm foreground-subtle">Identifying ingredients…</span>
            </div>
          )}

          {!loading && error && (
            <>
              <p className="text-sm text-red-600 py-4 text-center">{error}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-line rounded foreground-subtle hover:background-surface-raised"
                >
                  Close
                </button>
              </div>
            </>
          )}

          {showEmpty && (
            <>
              <p className="text-sm foreground-subtle py-4 text-center">
                No ingredients detected — try a clearer photo.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-line rounded foreground-subtle hover:background-surface-raised"
                >
                  Close
                </button>
              </div>
            </>
          )}

          {showResults && (
            <>
              <p className="text-xs foreground-subtle mb-3">
                Toggle any ingredients you'd like to exclude, then confirm.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {ingredients.map(name => {
                  const on = active.has(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggle(name)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        on
                          ? 'background-primary-soft foreground-primary border-primary'
                          : 'foreground-subtle border-line line-through opacity-50'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-line rounded foreground-subtle hover:background-surface-raised"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(ingredients.filter(n => active.has(n)))}
                  className="px-4 py-2 text-sm background-primary text-white rounded hover:background-primary-hover"
                >
                  Use selected ({active.size})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

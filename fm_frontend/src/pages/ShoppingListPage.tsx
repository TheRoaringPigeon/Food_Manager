import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { generateShoppingList, type ShoppingListResponse } from '../api/shopping_list'

function fmtQty(quantity: number | null, unit: string | null): string {
  if (quantity != null && unit) return `${quantity} ${unit}`
  if (quantity != null) return String(quantity)
  if (unit) return unit
  return ''
}

export default function ShoppingListPage() {
  const { recipeIds, ingredientIds, clearCart, cartCount } = useCart()
  const [list, setList] = useState<ShoppingListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const generate = async () => {
    setLoading(true)
    setError(null)
    setChecked(new Set())
    try {
      setList(await generateShoppingList(recipeIds, ingredientIds))
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cartCount > 0) generate()
  }, [])

  const toggleCheck = (key: string) =>
    setChecked(s => {
      const next = new Set(s)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const handleClearCart = () => {
    clearCart()
    setList(null)
  }

  if (cartCount === 0 && !list) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold foreground-content mb-4">Shopping List</h1>
        <div className="background-surface border border-line rounded-lg p-8 text-center">
          <p className="foreground-subtle mb-4">Your cart is empty. Add recipes or ingredients to generate a shopping list.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/recipes"
              className="px-4 py-2 background-primary text-white text-sm font-medium rounded hover:background-primary-hover"
            >
              Browse Recipes
            </Link>
            <Link
              to="/ingredients"
              className="px-4 py-2 border border-line text-sm font-medium foreground-content rounded hover:background-surface-raised"
            >
              Browse Ingredients
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold foreground-content">Shopping List</h1>
        <div className="flex gap-2">
          {list && (
            <button
              onClick={generate}
              disabled={loading}
              className="px-3 py-1.5 text-sm border border-line foreground-content rounded hover:background-surface-raised disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Regenerate'}
            </button>
          )}
          <button
            onClick={handleClearCart}
            className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <p className="foreground-subtle text-sm mb-4">
        {recipeIds.length} recipe{recipeIds.length !== 1 ? 's' : ''}
        {ingredientIds.length > 0 && ` · ${ingredientIds.length} ingredient${ingredientIds.length !== 1 ? 's' : ''}`}
        {' '}in cart
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
      )}

      {loading && (
        <p className="foreground-subtle text-sm">Generating shopping list...</p>
      )}

      {list && !loading && (
        <div className="space-y-4">
          {list.needed.length > 0 && (
            <div className="background-surface border border-line rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-line background-canvas">
                <h2 className="text-sm font-semibold foreground-content">
                  Need to buy
                  <span className="ml-2 text-xs font-normal foreground-subtle">({list.needed.length})</span>
                </h2>
              </div>
              <ul className="divide-y divide-divider">
                {list.needed.map(item => {
                  const key = `needed-${item.ingredient_id}`
                  const done = checked.has(key)
                  return (
                    <li
                      key={key}
                      className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:background-surface-raised"
                      onClick={() => toggleCheck(key)}
                    >
                      <input type="checkbox" className="mt-0.5 flex-shrink-0" checked={done} readOnly />
                      <div className={done ? 'line-through foreground-dim' : ''}>
                        <span className="text-sm foreground-content font-medium">{item.name}</span>
                        {fmtQty(item.quantity, item.unit) && (
                          <span className="ml-2 text-xs foreground-subtle">{fmtQty(item.quantity, item.unit)}</span>
                        )}
                        {item.source_recipes.length > 0 && (
                          <p className="text-xs foreground-dim mt-0.5">{item.source_recipes.join(', ')}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

{list.unlinked.length > 0 && (
            <div className="background-surface border border-line rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-line background-canvas">
                <h2 className="text-sm font-semibold foreground-content">
                  Untracked ingredients
                  <span className="ml-2 text-xs font-normal foreground-subtle">({list.unlinked.length})</span>
                </h2>
              </div>
              <ul className="divide-y divide-divider">
                {list.unlinked.map((item, i) => {
                  const key = `unlinked-${i}`
                  const done = checked.has(key)
                  return (
                    <li
                      key={key}
                      className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:background-surface-raised"
                      onClick={() => toggleCheck(key)}
                    >
                      <input type="checkbox" className="mt-0.5 flex-shrink-0" checked={done} readOnly />
                      <div className={done ? 'line-through foreground-dim' : ''}>
                        <span className="text-sm foreground-content">{item.name}</span>
                        {fmtQty(item.quantity, item.unit) && (
                          <span className="ml-2 text-xs foreground-subtle">{fmtQty(item.quantity, item.unit)}</span>
                        )}
                        <p className="text-xs foreground-dim mt-0.5">{item.recipe_name}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {list.needed.length === 0 && list.unlinked.length === 0 && (
            <div className="background-surface border border-line rounded-lg p-6 text-center">
              <p className="foreground-subtle text-sm">
                No items to show. The selected recipes may not have linked ingredients yet.
                <br />
                <Link to="/recipes" className="foreground-primary hover:underline">Edit a recipe</Link>
                {' '}to link ingredients from your pantry.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

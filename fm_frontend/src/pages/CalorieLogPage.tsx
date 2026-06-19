import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import type { CalorieLog, MealType, EntryType, DailyTotal } from '../types/calorieLog'
import { MEAL_TYPES } from '../types/calorieLog'
import type { Ingredient } from '../types/ingredient'
import type { Recipe } from '../types/recipe'
import {
  createCalorieLog, listCalorieLogs, getTodayTotal, getDailyHistory, deleteCalorieLog,
} from '../api/calorieLog'
import { listIngredients } from '../api/ingredients'
import { listRecipes } from '../api/recipes'
import BarcodeScanner from '../components/BarcodeScanner'
import { lookupBarcode } from '../api/barcode'

type Tab = 'ingredient' | 'recipe' | 'freeform'

const SERVING_OPTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]

function mealBadgeClass(meal: MealType) {
  const map: Record<MealType, string> = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-blue-100 text-blue-800',
    dinner: 'bg-purple-100 text-purple-800',
    snack: 'bg-green-100 text-green-800',
  }
  return map[meal] ?? 'bg-gray-100 text-gray-700'
}

function groupByDate(logs: CalorieLog[]): [string, CalorieLog[]][] {
  const map = new Map<string, CalorieLog[]>()
  for (const log of logs) {
    const day = log.logged_at.slice(0, 10)
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(log)
  }
  return Array.from(map.entries())
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export default function CalorieLogPage() {
  const { user } = useAuth()
  const goal = user?.calorie_goal ?? null

  const [tab, setTab] = useState<Tab>('ingredient')
  const [meal, setMeal] = useState<MealType>('dinner')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Ingredient tab state
  const [ingSearch, setIngSearch] = useState('')
  const [ingResults, setIngResults] = useState<Ingredient[]>([])
  const [selectedIng, setSelectedIng] = useState<Ingredient | null>(null)
  const [quantityG, setQuantityG] = useState('')
  const [ingDropOpen, setIngDropOpen] = useState(false)

  // Recipe tab state
  const [recipeSearch, setRecipeSearch] = useState('')
  const [recipeResults, setRecipeResults] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [servings, setServings] = useState(1)
  const [recipeCalPerServing, setRecipeCalPerServing] = useState<number | null>(null)
  const [recipeEstimate, setRecipeEstimate] = useState<string>('')
  const [recipeDropOpen, setRecipeDropOpen] = useState(false)

  // Freeform tab state
  const [ffName, setFfName] = useState('')
  const [ffCals, setFfCals] = useState('')
  const [ffCalPerServing, setFfCalPerServing] = useState<number | null>(null)
  const [ffServingDesc, setFfServingDesc] = useState('')
  const [ffServings, setFfServings] = useState(1)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [barcodeStatus, setBarcodeStatus] = useState<'idle' | 'loading' | 'notfound'>('idle')

  // Summary & history
  const [todayTotal, setTodayTotal] = useState(0)
  const [history, setHistory] = useState<DailyTotal[]>([])
  const [logs, setLogs] = useState<CalorieLog[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const refreshData = useCallback(async () => {
    try {
      const [total, hist, entries] = await Promise.all([
        getTodayTotal(),
        getDailyHistory(14),
        listCalorieLogs({ limit: 200 }),
      ])
      setTodayTotal(total)
      setHistory(hist)
      setLogs(entries)
    } catch {
      // non-critical
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => { refreshData() }, [refreshData])

  // Ingredient search with debounce
  useEffect(() => {
    if (!ingSearch || selectedIng) return
    const t = setTimeout(async () => {
      const results = await listIngredients({ search: ingSearch, limit: 8 })
      setIngResults(results)
      setIngDropOpen(results.length > 0)
    }, 300)
    return () => clearTimeout(t)
  }, [ingSearch, selectedIng])

  // Recipe search with debounce
  useEffect(() => {
    if (!recipeSearch || selectedRecipe) return
    const t = setTimeout(async () => {
      const results = await listRecipes({ search: recipeSearch, limit: 8 })
      setRecipeResults(results)
      setRecipeDropOpen(results.length > 0)
    }, 300)
    return () => clearTimeout(t)
  }, [recipeSearch, selectedRecipe])

  // Fetch recipe calorie estimate when recipe selected
  useEffect(() => {
    if (!selectedRecipe) { setRecipeCalPerServing(null); setRecipeEstimate(''); return }
    import('../api/calorieLog').then(({ getRecipeCalorieEstimate }) => {
      getRecipeCalorieEstimate(selectedRecipe.id).then(est => {
        setRecipeCalPerServing(est.per_serving)
        if (est.per_serving != null) {
          setRecipeEstimate(`≈ ${est.per_serving} kcal/serving${est.is_estimate ? ' (estimate)' : ''}`)
        } else {
          setRecipeEstimate('Calorie data unavailable — enter manually')
        }
      }).catch(() => setRecipeEstimate(''))
    })
  }, [selectedRecipe])

  const ingCalPreview = selectedIng?.calories_per_100g != null && quantityG
    ? Math.round(parseFloat(quantityG) * selectedIng.calories_per_100g / 100)
    : null

  async function handleBarcodeResult(barcode: string) {
    setScannerOpen(false)
    setBarcodeStatus('loading')
    const product = await lookupBarcode(barcode)
    if (product) {
      setFfName(product.name)
      if (product.caloriesPerServing > 0) {
        setFfCalPerServing(product.caloriesPerServing)
        setFfServingDesc(product.servingDescription)
      }
    } else {
      setBarcodeStatus('notfound')
    }
    setFfServings(1)
    if (product) setBarcodeStatus('idle')
  }

  async function handleSubmit() {
    setFormError(null)
    setSubmitting(true)
    try {
      if (tab === 'ingredient') {
        if (!selectedIng) { setFormError('Select an ingredient'); setSubmitting(false); return }
        if (!quantityG || isNaN(parseFloat(quantityG))) { setFormError('Enter quantity in grams'); setSubmitting(false); return }
        await createCalorieLog({
          entry_type: 'ingredient',
          ingredient_id: selectedIng.id,
          food_name: selectedIng.name,
          quantity_grams: parseFloat(quantityG),
          meal_type: meal,
          notes: notes || undefined,
        })
      } else if (tab === 'recipe') {
        if (!selectedRecipe) { setFormError('Select a recipe'); setSubmitting(false); return }
        await createCalorieLog({
          entry_type: 'recipe',
          recipe_id: selectedRecipe.id,
          food_name: selectedRecipe.name,
          servings_eaten: servings,
          calories: recipeCalPerServing != null ? recipeCalPerServing * servings : undefined,
          meal_type: meal,
          notes: notes || undefined,
        })
      } else {
        if (!ffName.trim()) { setFormError('Enter a food name'); setSubmitting(false); return }
        const totalCals = ffCalPerServing != null
          ? ffCalPerServing * ffServings
          : parseFloat(ffCals)
        if (isNaN(totalCals) || totalCals < 0) { setFormError('Enter calorie count'); setSubmitting(false); return }
        await createCalorieLog({
          entry_type: 'freeform',
          food_name: ffName.trim(),
          calories: totalCals,
          meal_type: meal,
          notes: notes || undefined,
        })
      }
      // Reset form
      setSelectedIng(null); setIngSearch(''); setQuantityG('')
      setSelectedRecipe(null); setRecipeSearch(''); setServings(1); setRecipeCalPerServing(null); setRecipeEstimate('')
      setFfName(''); setFfCals(''); setFfCalPerServing(null); setFfServingDesc(''); setFfServings(1); setBarcodeStatus('idle')
      setNotes('')
      await refreshData()
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCalorieLog(id)
      await refreshData()
    } catch { /* ignore */ }
  }

  const goalPct = goal && todayTotal ? Math.min(100, Math.round((todayTotal / goal) * 100)) : null
  const grouped = groupByDate(logs)

  const chartData = history.map(d => ({
    date: d.date.slice(5),
    calories: d.total_calories,
  }))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {scannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeResult}
          onClose={() => setScannerOpen(false)}
        />
      )}

      <h1 className="text-2xl font-semibold foreground-content">Calorie Log</h1>

      {/* Today's summary */}
      <div className="background-surface border border-line rounded-lg p-5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs foreground-subtle mb-0.5">Today</p>
            <p className="text-3xl font-bold foreground-content">{Math.round(todayTotal)}</p>
            <p className="text-xs foreground-subtle">kcal consumed</p>
          </div>
          {goal && (
            <div className="text-right">
              <p className="text-xs foreground-subtle">Goal</p>
              <p className="text-xl font-semibold foreground-content">{goal}</p>
              <p className="text-xs foreground-subtle">kcal</p>
            </div>
          )}
        </div>
        {goal && goalPct != null && (
          <div className="mt-3">
            <div className="w-full h-2 background-canvas rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${goalPct >= 100 ? 'bg-red-500' : 'background-primary'}`}
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <p className="text-xs foreground-subtle mt-1">{goalPct}% of daily goal</p>
          </div>
        )}
        {!goal && (
          <p className="text-xs foreground-dim mt-2">Set a daily goal in your profile to track progress.</p>
        )}
      </div>

      {/* Log food form */}
      <div className="background-surface border border-line rounded-lg p-5">
        <h2 className="text-sm font-semibold foreground-content mb-4">Log Food</h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-line">
          {(['ingredient', 'recipe', 'freeform'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setFormError(null) }}
              className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                tab === t
                  ? 'border-primary foreground-primary'
                  : 'border-transparent foreground-subtle hover:foreground-content'
              }`}
            >
              {t === 'freeform' ? 'Free-form' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {/* Ingredient tab */}
          {tab === 'ingredient' && (
            <>
              <div className="relative">
                <label className="block text-xs font-medium foreground-subtle mb-1">Ingredient</label>
                <input
                  type="text"
                  value={selectedIng ? selectedIng.name : ingSearch}
                  onChange={e => { setIngSearch(e.target.value); setSelectedIng(null) }}
                  placeholder="Search ingredients..."
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {ingDropOpen && !selectedIng && (
                  <div className="absolute z-10 w-full mt-1 background-surface border border-line rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {ingResults.map(ing => (
                      <button
                        key={ing.id}
                        onClick={() => { setSelectedIng(ing); setIngSearch(ing.name); setIngDropOpen(false) }}
                        className="w-full text-left px-3 py-2 text-sm foreground-content hover:background-surface-raised flex justify-between"
                      >
                        <span>{ing.name}</span>
                        {ing.calories_per_100g != null && (
                          <span className="text-xs foreground-subtle">{ing.calories_per_100g} kcal/100g</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium foreground-subtle mb-1">Quantity (grams)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantityG}
                  onChange={e => setQuantityG(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {ingCalPreview != null && (
                  <p className="text-xs foreground-primary mt-1">≈ {ingCalPreview} kcal</p>
                )}
              </div>
            </>
          )}

          {/* Recipe tab */}
          {tab === 'recipe' && (
            <>
              <div className="relative">
                <label className="block text-xs font-medium foreground-subtle mb-1">Recipe</label>
                <input
                  type="text"
                  value={selectedRecipe ? selectedRecipe.name : recipeSearch}
                  onChange={e => { setRecipeSearch(e.target.value); setSelectedRecipe(null); setRecipeCalPerServing(null); setRecipeEstimate('') }}
                  placeholder="Search recipes..."
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {recipeDropOpen && !selectedRecipe && (
                  <div className="absolute z-10 w-full mt-1 background-surface border border-line rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {recipeResults.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRecipe(r); setRecipeSearch(r.name); setRecipeDropOpen(false) }}
                        className="w-full text-left px-3 py-2 text-sm foreground-content hover:background-surface-raised flex justify-between"
                      >
                        <span>{r.name}</span>
                        <span className="text-xs foreground-subtle capitalize">{r.recipe_type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {recipeEstimate && (
                <p className="text-xs foreground-primary -mt-1">{recipeEstimate}</p>
              )}
              <div>
                <label className="block text-xs font-medium foreground-subtle mb-1">Servings eaten</label>
                <div className="flex gap-1.5 flex-wrap">
                  {SERVING_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setServings(s)}
                      className={`px-3 py-1 text-sm rounded border ${
                        servings === s
                          ? 'border-primary background-primary-soft foreground-primary-dim'
                          : 'border-line foreground-subtle hover:border-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {recipeCalPerServing != null && (
                  <p className="text-xs foreground-primary mt-1.5">
                    ≈ {Math.round(recipeCalPerServing * servings)} kcal total
                  </p>
                )}
              </div>
            </>
          )}

          {/* Free-form tab */}
          {tab === 'freeform' && (
            <>
              {/* Scan button — mobile only */}
              <button
                type="button"
                onClick={() => { setBarcodeStatus('idle'); setScannerOpen(true) }}
                className="md:hidden self-start flex items-center gap-2 px-3 py-2 border border-line rounded text-sm foreground-subtle hover:foreground-content hover:border-primary transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                </svg>
                Scan barcode
              </button>

              {barcodeStatus === 'loading' && (
                <p className="text-xs foreground-subtle animate-pulse">Looking up product…</p>
              )}
              {barcodeStatus === 'notfound' && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Product not found — enter details manually below.
                </p>
              )}

              <div>
                <label className="block text-xs font-medium foreground-subtle mb-1">Food name</label>
                <input
                  type="text"
                  value={ffName}
                  onChange={e => setFfName(e.target.value)}
                  placeholder="e.g. Granola bar"
                  className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Serving picker — shown when a barcode gave us per-serving calorie data */}
              {ffCalPerServing != null ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium foreground-subtle">
                      Servings eaten
                      {ffServingDesc && <span className="font-normal foreground-dim ml-1">({ffServingDesc} = {ffCalPerServing} kcal each)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => { setFfCalPerServing(null); setFfServingDesc(''); setFfServings(1) }}
                      className="text-xs foreground-dim hover:foreground-subtle underline"
                    >
                      Enter manually
                    </button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {SERVING_OPTIONS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFfServings(s)}
                        className={`px-3 py-1 text-sm rounded border ${
                          ffServings === s
                            ? 'border-primary background-primary-soft foreground-primary-dim'
                            : 'border-line foreground-subtle hover:border-primary'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs foreground-primary mt-1.5">
                    ≈ {Math.round(ffCalPerServing * ffServings)} kcal total
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium foreground-subtle mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={ffCals}
                    onChange={e => setFfCals(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </>
          )}

          {/* Shared fields */}
          <div>
            <label className="block text-xs font-medium foreground-subtle mb-1">Meal</label>
            <div className="flex gap-1.5 flex-wrap">
              {MEAL_TYPES.map(m => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={`px-3 py-1 text-sm rounded border capitalize ${
                    meal === m
                      ? 'border-primary background-primary-soft foreground-primary-dim'
                      : 'border-line foreground-subtle hover:border-primary'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium foreground-subtle mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes..."
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="self-start px-4 py-2 background-primary text-white rounded text-sm font-medium hover:background-primary-hover disabled:opacity-50"
          >
            {submitting ? 'Logging...' : 'Log food'}
          </button>
        </div>
      </div>

      {/* History chart */}
      {history.length > 0 && (
        <div className="background-surface border border-line rounded-lg p-5">
          <h2 className="text-sm font-semibold foreground-content mb-4">Last 14 Days</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${Math.round(Number(v))} kcal`, 'Calories']} />
              {goal && <ReferenceLine y={goal} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Goal', position: 'right', fontSize: 10 }} />}
              <Bar dataKey="calories" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log history */}
      <div className="background-surface border border-line rounded-lg p-5">
        <h2 className="text-sm font-semibold foreground-content mb-4">History</h2>
        {loadingData ? (
          <p className="text-sm foreground-dim">Loading...</p>
        ) : grouped.length === 0 ? (
          <p className="text-sm foreground-dim">No entries yet. Log your first meal above.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map(([day, entries]) => {
              const dayTotal = entries.reduce((s, e) => s + e.calories, 0)
              return (
                <div key={day}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold foreground-subtle">{formatDate(day)}</p>
                    <p className="text-xs foreground-subtle">{Math.round(dayTotal)} kcal</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {entries.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-divider last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 capitalize ${mealBadgeClass(entry.meal_type)}`}>
                            {entry.meal_type}
                          </span>
                          <span className="text-sm foreground-content truncate">{entry.food_name}</span>
                          {entry.notes && <span className="text-xs foreground-dim hidden sm:inline">— {entry.notes}</span>}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-sm font-medium foreground-content">{Math.round(entry.calories)} kcal</span>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

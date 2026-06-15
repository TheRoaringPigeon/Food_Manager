import { useCart } from '../context/CartContext'
import type { CandidateRecipe, WinnerDetails } from '../api/recommendations'

interface Props {
  candidate: CandidateRecipe
  rank: number
  isWinner: boolean
  winnerDetails?: WinnerDetails
  onClose: () => void
}

export default function RecommendationCandidateModal({ candidate, rank, isWinner, winnerDetails, onClose }: Props) {
  const { recipeIds, addRecipe, removeRecipe } = useCart()
  const recipeId = Number(candidate.id)
  const inCart = !isNaN(recipeId) && recipeId > 0 && recipeIds.includes(recipeId)

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <div
        className="background-surface rounded-lg shadow-xl w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-line background-primary-soft">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs foreground-subtle font-medium">#{rank}</span>
                {isWinner && (
                  <span className="px-2 py-0.5 background-primary text-white text-xs rounded-full font-medium">
                    LLM's Pick
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold foreground-content">{candidate.name}</h2>
              {candidate.description && (
                <p className="foreground-subtle text-sm mt-1">{candidate.description}</p>
              )}
              <div className="flex gap-4 mt-2 text-xs foreground-subtle">
                {candidate.prep_time != null && <span>Prep: {candidate.prep_time} min</span>}
                {candidate.cook_time != null && <span>Cook: {candidate.cook_time} min</span>}
              </div>
            </div>
            <div className="flex items-start gap-2 flex-shrink-0">
              {!isNaN(recipeId) && recipeId > 0 && (
                <button
                  type="button"
                  onClick={() => inCart ? removeRecipe(recipeId) : addRecipe(recipeId)}
                  className={`px-3 py-1 text-xs font-medium border rounded ${
                    inCart
                      ? 'foreground-primary border-current'
                      : 'foreground-subtle border-line hover:background-surface-raised'
                  }`}
                >
                  {inCart ? '✓ In Cart' : '+ Cart'}
                </button>
              )}
              <button
                onClick={onClose}
                className="foreground-dim hover:foreground-subtle text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isWinner && winnerDetails && (
            <>
              <section>
                <h3 className="text-sm font-semibold foreground-content mb-1">Why this recipe?</h3>
                <p className="text-sm foreground-subtle">{winnerDetails.why}</p>
              </section>

              {(winnerDetails.have_ingredients.length > 0 || winnerDetails.missing_ingredients.length > 0 || Object.keys(winnerDetails.substitutions).length > 0) && (
                <section>
                  <h3 className="text-sm font-semibold foreground-content mb-1">Ingredient match</h3>
                  {winnerDetails.have_ingredients.length > 0 && (
                    <p className="text-xs foreground-subtle mb-1">
                      <span className="font-medium text-green-700">Have: </span>
                      {winnerDetails.have_ingredients.join(', ')}
                    </p>
                  )}
                  {winnerDetails.missing_ingredients.length > 0 && (
                    <p className="text-xs foreground-subtle mb-1">
                      <span className="font-medium text-red-600">Missing: </span>
                      {winnerDetails.missing_ingredients.join(', ')}
                    </p>
                  )}
                  {Object.keys(winnerDetails.substitutions).length > 0 && (
                    <p className="text-xs foreground-subtle">
                      <span className="font-medium foreground-content">Substitutions: </span>
                      {Object.entries(winnerDetails.substitutions).map(([k, v]) => `${k} → ${v}`).join('; ')}
                    </p>
                  )}
                </section>
              )}
            </>
          )}

          {candidate.ingredients && candidate.ingredients.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold foreground-content mb-1">Ingredients</h3>
              <ul className="text-sm foreground-subtle space-y-0.5">
                {candidate.ingredients.map((ing, i) => <li key={i}>• {ing}</li>)}
              </ul>
            </section>
          )}

          {candidate.instructions && candidate.instructions.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold foreground-content mb-1">Instructions</h3>
              <ol className="text-sm foreground-subtle space-y-1 list-decimal list-inside">
                {candidate.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </section>
          )}

          {candidate.image_url && (
            <section>
              <h3 className="text-sm font-semibold foreground-content mb-1">Image</h3>
              <a
                href={candidate.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs foreground-primary hover:underline break-all"
              >
                {candidate.image_url}
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

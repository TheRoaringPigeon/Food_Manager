export interface RecommendationResponse {
  recipe_id: string
  recipe_name: string
  why: string
  have_ingredients: string[]
  missing_ingredients: string[]
  substitutions: Record<string, string>
  description: string | null
  ingredients: string[] | null
  instructions: string[] | null
  image_url: string | null
  prep_time: number | null
  cook_time: number | null
}

export async function getRecommendation(query: string): Promise<RecommendationResponse> {
  const res = await fetch('/food-manager/llm/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json()
}

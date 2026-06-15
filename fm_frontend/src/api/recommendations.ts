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

export interface CandidateRecipe {
  id: string
  name: string
  score: number
  match_count: number
  description: string | null
  prep_time: number | null
  cook_time: number | null
  ingredients: string[]
  instructions: string[] | null
  image_url: string | null
}

export interface WinnerDetails {
  why: string
  have_ingredients: string[]
  missing_ingredients: string[]
  substitutions: Record<string, string>
}

export type StreamEvent =
  | { type: 'sql_candidates'; count: number; names: string[] }
  | { type: 'semantic_search'; query: string; chroma_count: number }
  | { type: 'top5'; candidates: CandidateRecipe[] }
  | { type: 'result'; recipe_id: string; why: string; have_ingredients: string[]; missing_ingredients: string[]; substitutions: Record<string, string> }
  | { type: 'error'; message: string }

export async function getRecommendation(query: string, ingredients: string[] = []): Promise<RecommendationResponse> {
  const res = await fetch('/food-manager/llm/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, ingredients }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json()
}

export async function streamRecommendation(
  query: string,
  ingredients: string[],
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const res = await fetch('/food-manager/llm/api/recommendations/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, ingredients }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''
    for (const part of parts) {
      const line = part.trim()
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6)) as StreamEvent
          onEvent(event)
        } catch {
          // malformed event — ignore
        }
      }
    }
  }
}

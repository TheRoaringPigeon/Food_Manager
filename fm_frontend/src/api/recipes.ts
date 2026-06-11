import { apiFetch } from './client'
import type { Recipe, CreateRecipePayload, UpdateRecipePayload } from '../types/recipe'

export interface RecipeListParams {
  skip?: number
  limit?: number
  recipe_type?: string
  is_favorite?: boolean
  search?: string
  max_total_time?: number
  ids?: number[]
}

function buildQuery(params?: RecipeListParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.skip != null) q.set('skip', String(params.skip))
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.recipe_type) q.set('recipe_type', params.recipe_type)
  if (params.is_favorite != null) q.set('is_favorite', String(params.is_favorite))
  if (params.search) q.set('search', params.search)
  if (params.max_total_time != null) q.set('max_total_time', String(params.max_total_time))
  if (params.ids?.length) q.set('ids', params.ids.join(','))
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const listRecipes = (params?: RecipeListParams) =>
  apiFetch<Recipe[]>(`/recipes${buildQuery(params)}`)

export const countRecipes = (params?: RecipeListParams) =>
  apiFetch<{ total: number }>(`/recipes/count${buildQuery(params)}`)

export const createRecipe = (payload: CreateRecipePayload) =>
  apiFetch<Recipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const toggleFavorite = (id: number) =>
  apiFetch<Recipe>(`/recipes/${id}/favorite`, { method: 'POST' })

export const markCooked = (id: number) =>
  apiFetch<Recipe>(`/recipes/${id}/cooked`, { method: 'POST' })

export const updateRecipe = (id: number, payload: UpdateRecipePayload) =>
  apiFetch<Recipe>(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

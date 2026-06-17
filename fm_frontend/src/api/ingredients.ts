import { apiFetch } from './client'
import type { Ingredient, CreateIngredientPayload, UpdateIngredientPayload } from '../types/ingredient'

export interface IngredientListParams {
  skip?: number
  limit?: number
  ingredient_type?: string
  search?: string
  sort_by?: string
  sort_dir?: string
}

function buildQuery(params?: IngredientListParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.skip != null) q.set('skip', String(params.skip))
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.ingredient_type) q.set('ingredient_type', params.ingredient_type)
  if (params.search) q.set('search', params.search)
  if (params.sort_by) q.set('sort_by', params.sort_by)
  if (params.sort_dir) q.set('sort_dir', params.sort_dir)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const listIngredients = (params?: IngredientListParams) =>
  apiFetch<Ingredient[]>(`/ingredients${buildQuery(params)}`)

export const countIngredients = (params?: IngredientListParams) =>
  apiFetch<{ total: number }>(`/ingredients/count${buildQuery(params)}`)

export const createIngredient = (payload: CreateIngredientPayload) =>
  apiFetch<Ingredient>('/ingredients', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateIngredient = (id: number, payload: UpdateIngredientPayload) =>
  apiFetch<Ingredient>(`/ingredients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteIngredient = (id: number) =>
  apiFetch<void>(`/ingredients/${id}`, { method: 'DELETE' })

export interface IngredientMergePayload {
  keep_id: number
  delete_id: number
}

export const mergeIngredients = (payload: IngredientMergePayload) =>
  apiFetch<Ingredient>('/ingredients/merge', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

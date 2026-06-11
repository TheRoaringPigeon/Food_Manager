import { apiFetch } from './client'
import type { Ingredient, CreateIngredientPayload, UpdateIngredientPayload } from '../types/ingredient'

export interface IngredientListParams {
  skip?: number
  limit?: number
  ingredient_type?: string
  is_available?: boolean
  search?: string
}

function buildQuery(params?: IngredientListParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.skip != null) q.set('skip', String(params.skip))
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.ingredient_type) q.set('ingredient_type', params.ingredient_type)
  if (params.is_available != null) q.set('is_available', String(params.is_available))
  if (params.search) q.set('search', params.search)
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

export const toggleAvailability = (id: number) =>
  apiFetch<Ingredient>(`/ingredients/${id}/availability`, { method: 'POST' })

export const updateIngredient = (id: number, payload: UpdateIngredientPayload) =>
  apiFetch<Ingredient>(`/ingredients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

import { apiFetch } from './client'
import type { Ingredient, CreateIngredientPayload } from '../types/ingredient'

export const listIngredients = () =>
  apiFetch<Ingredient[]>('/ingredients')

export const createIngredient = (payload: CreateIngredientPayload) =>
  apiFetch<Ingredient>('/ingredients', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const toggleAvailability = (id: number) =>
  apiFetch<Ingredient>(`/ingredients/${id}/availability`, { method: 'POST' })

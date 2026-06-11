import { apiFetch } from './client'
import type { Recipe, CreateRecipePayload } from '../types/recipe'

export const listRecipes = () =>
  apiFetch<Recipe[]>('/recipes')

export const createRecipe = (payload: CreateRecipePayload) =>
  apiFetch<Recipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const toggleFavorite = (id: number) =>
  apiFetch<Recipe>(`/recipes/${id}/favorite`, { method: 'POST' })

export const markCooked = (id: number) =>
  apiFetch<Recipe>(`/recipes/${id}/cooked`, { method: 'POST' })

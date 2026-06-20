import { apiFetch } from './client'
import type { CalorieLog, CreateCalorieLogPayload, DailyTotal, RecipeCalorieEstimate } from '../types/calorieLog'

export const createCalorieLog = (payload: CreateCalorieLogPayload) =>
  apiFetch<CalorieLog>('/calorie-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const listCalorieLogs = (params?: { start_date?: string; end_date?: string; skip?: number; limit?: number }) => {
  const q = new URLSearchParams()
  if (params?.start_date) q.set('start_date', params.start_date)
  if (params?.end_date) q.set('end_date', params.end_date)
  if (params?.skip != null) q.set('skip', String(params.skip))
  if (params?.limit != null) q.set('limit', String(params.limit))
  const qs = q.toString()
  return apiFetch<CalorieLog[]>(`/calorie-logs${qs ? `?${qs}` : ''}`)
}

const tzOffset = () => -new Date().getTimezoneOffset()

export const getTodayTotal = () =>
  apiFetch<number>(`/calorie-logs/today?tz_offset=${tzOffset()}`)

export const getDailyHistory = (days = 14) =>
  apiFetch<DailyTotal[]>(`/calorie-logs/history?days=${days}&tz_offset=${tzOffset()}`)

export const getRecipeCalorieEstimate = (recipeId: number) =>
  apiFetch<RecipeCalorieEstimate>(`/calorie-logs/recipe/${recipeId}/estimate`)

export const deleteCalorieLog = (id: number) =>
  apiFetch<void>(`/calorie-logs/${id}`, { method: 'DELETE' })

export type EntryType = 'ingredient' | 'recipe' | 'freeform'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export interface CalorieLog {
  id: number
  user_id: number
  entry_type: EntryType
  ingredient_id?: number | null
  recipe_id?: number | null
  food_name: string
  quantity_grams?: number | null
  servings_eaten?: number | null
  calories: number
  meal_type: MealType
  logged_at: string
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateCalorieLogPayload {
  entry_type: EntryType
  ingredient_id?: number | null
  recipe_id?: number | null
  food_name?: string
  quantity_grams?: number | null
  servings_eaten?: number | null
  calories?: number | null
  meal_type: MealType
  logged_at?: string
  notes?: string
}

export interface DailyTotal {
  date: string
  total_calories: number
}

export interface RecipeCalorieEstimate {
  total_calories: number | null
  per_serving: number | null
  servings: number | null
  is_estimate: boolean
}

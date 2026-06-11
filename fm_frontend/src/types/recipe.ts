export type RecipeType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink' | 'other'

export const RECIPE_TYPES: RecipeType[] = [
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'other',
]

export interface Recipe {
  id: number
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  recipe_type: RecipeType
  is_favorite: boolean
  last_cooked: string | null
  created_at: string
  updated_at: string
}

export interface CreateRecipePayload {
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  recipe_type: RecipeType
}

export interface UpdateRecipePayload {
  name?: string
  description?: string
  ingredients?: string[]
  instructions?: string[]
  prep_time?: number | null
  cook_time?: number | null
  servings?: number | null
  recipe_type?: RecipeType
}

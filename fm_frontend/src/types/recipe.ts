export type RecipeType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink' | 'other'

export const RECIPE_TYPES: RecipeType[] = [
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'other',
]

export interface RecipeIngredient {
  id?: number
  ingredient_id?: number | null
  name: string
  quantity?: number | null
  unit?: string | null
}

export interface Recipe {
  id: number
  name: string
  description: string
  ingredients: RecipeIngredient[]
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
  ingredients: RecipeIngredient[]
  instructions: string[]
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  recipe_type: RecipeType
}

export interface UpdateRecipePayload {
  name?: string
  description?: string
  ingredients?: RecipeIngredient[]
  instructions?: string[]
  prep_time?: number | null
  cook_time?: number | null
  servings?: number | null
  recipe_type?: RecipeType
}

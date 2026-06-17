export type IngredientType = 'produce' | 'meat' | 'dairy' | 'grain' | 'spice' | 'condiment' | 'beverage' | 'other'

export const INGREDIENT_TYPES: IngredientType[] = [
  'produce', 'meat', 'dairy', 'grain', 'spice', 'condiment', 'beverage', 'other',
]

export interface Ingredient {
  id: number
  name: string
  description: string
  ingredient_type: IngredientType
  calories_per_100g?: number | null
  usda_fdc_id?: string | null
  created_at: string
  updated_at: string
}

export interface CreateIngredientPayload {
  name: string
  description: string
  ingredient_type: IngredientType
}

export interface UpdateIngredientPayload {
  name?: string
  description?: string
  ingredient_type?: IngredientType
}

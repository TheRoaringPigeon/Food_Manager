export type IngredientType = 'produce' | 'meat' | 'dairy' | 'grain' | 'spice' | 'condiment' | 'beverage' | 'other'

export const INGREDIENT_TYPES: IngredientType[] = [
  'produce', 'meat', 'dairy', 'grain', 'spice', 'condiment', 'beverage', 'other',
]

export interface Ingredient {
  id: number
  name: string
  description: string
  ingredient_type: IngredientType
  quantity: number | null
  unit: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CreateIngredientPayload {
  name: string
  description: string
  ingredient_type: IngredientType
  quantity: number | null
  unit: string
  is_available: boolean
}

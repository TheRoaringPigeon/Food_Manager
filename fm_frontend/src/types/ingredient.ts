export type IngredientType = 'produce' | 'meat' | 'dairy' | 'grain' | 'spice' | 'condiment' | 'beverage' | 'other'

export const INGREDIENT_TYPES: IngredientType[] = [
  'produce', 'meat', 'dairy', 'grain', 'spice', 'condiment', 'beverage', 'other',
]

export type UnitType =
  | 'tsp' | 'tbsp' | 'fl_oz' | 'cup' | 'pint' | 'quart' | 'gallon'
  | 'ml' | 'liter'
  | 'oz' | 'lb' | 'g' | 'kg'
  | 'whole' | 'dozen'
  | 'pinch' | 'dash' | 'clove' | 'slice' | 'bunch' | 'can' | 'package' | 'bag'

export interface UnitOption {
  value: UnitType
  label: string
}

export const UNIT_OPTIONS: UnitOption[] = [
  { value: 'tsp',     label: 'tsp (teaspoon)' },
  { value: 'tbsp',    label: 'tbsp (tablespoon)' },
  { value: 'fl_oz',   label: 'fl oz' },
  { value: 'cup',     label: 'cup' },
  { value: 'pint',    label: 'pint' },
  { value: 'quart',   label: 'quart' },
  { value: 'gallon',  label: 'gallon' },
  { value: 'ml',      label: 'ml' },
  { value: 'liter',   label: 'liter' },
  { value: 'oz',      label: 'oz (ounce)' },
  { value: 'lb',      label: 'lb (pound)' },
  { value: 'g',       label: 'g (gram)' },
  { value: 'kg',      label: 'kg' },
  { value: 'whole',   label: 'whole' },
  { value: 'dozen',   label: 'dozen' },
  { value: 'pinch',   label: 'pinch' },
  { value: 'dash',    label: 'dash' },
  { value: 'clove',   label: 'clove' },
  { value: 'slice',   label: 'slice' },
  { value: 'bunch',   label: 'bunch' },
  { value: 'can',     label: 'can' },
  { value: 'package', label: 'package' },
  { value: 'bag',     label: 'bag' },
]

export interface Ingredient {
  id: number
  name: string
  description: string
  ingredient_type: IngredientType
  quantity: number | null
  unit: UnitType | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface CreateIngredientPayload {
  name: string
  description: string
  ingredient_type: IngredientType
  quantity: number | null
  unit: UnitType | null
  is_available: boolean
}

export interface UpdateIngredientPayload {
  name?: string
  description?: string
  ingredient_type?: IngredientType
  quantity?: number | null
  unit?: UnitType | null
  is_available?: boolean
}

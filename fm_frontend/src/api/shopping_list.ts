import { apiFetch } from './client'

export interface ShoppingListItem {
  ingredient_id: number
  name: string
  quantity: number | null
  unit: string | null
  source_recipes: string[]
}

export interface UnlinkedItem {
  name: string
  quantity: number | null
  unit: string | null
  recipe_name: string
}

export interface ShoppingListResponse {
  needed: ShoppingListItem[]
  unlinked: UnlinkedItem[]
}

export async function generateShoppingList(
  recipe_ids: number[],
  ingredient_ids: number[]
): Promise<ShoppingListResponse> {
  return apiFetch('/shopping-list/generate', {
    method: 'POST',
    body: JSON.stringify({ recipe_ids, ingredient_ids }),
  })
}

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface CartState {
  recipeIds: number[]
  ingredientIds: number[]
}

interface CartContextValue extends CartState {
  addRecipe: (id: number) => void
  removeRecipe: (id: number) => void
  addIngredient: (id: number) => void
  removeIngredient: (id: number) => void
  clearCart: () => void
  cartCount: number
}

const STORAGE_KEY = 'fm_cart'

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { recipeIds: [], ingredientIds: [] }
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const addRecipe = (id: number) =>
    setCart(c => c.recipeIds.includes(id) ? c : { ...c, recipeIds: [...c.recipeIds, id] })

  const removeRecipe = (id: number) =>
    setCart(c => ({ ...c, recipeIds: c.recipeIds.filter(r => r !== id) }))

  const addIngredient = (id: number) =>
    setCart(c => c.ingredientIds.includes(id) ? c : { ...c, ingredientIds: [...c.ingredientIds, id] })

  const removeIngredient = (id: number) =>
    setCart(c => ({ ...c, ingredientIds: c.ingredientIds.filter(i => i !== id) }))

  const clearCart = () => setCart({ recipeIds: [], ingredientIds: [] })

  const cartCount = cart.recipeIds.length + cart.ingredientIds.length

  return (
    <CartContext.Provider value={{ ...cart, addRecipe, removeRecipe, addIngredient, removeIngredient, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

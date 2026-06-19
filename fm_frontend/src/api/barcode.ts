export interface BarcodeProduct {
  name: string
  caloriesPerServing: number
  servingDescription: string
}

export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,nutriments,serving_size`,
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null

    const { product } = data
    const name: string = product.product_name
    if (!name) return null

    const nutriments = product.nutriments ?? {}
    const calPerServing: number | undefined = nutriments['energy-kcal_serving']
    const calPer100g: number | undefined = nutriments['energy-kcal_100g']
    const servingSize: string = product.serving_size ?? ''

    if (calPerServing != null) {
      return {
        name,
        caloriesPerServing: Math.round(calPerServing),
        servingDescription: servingSize || '1 serving',
      }
    }

    if (calPer100g != null) {
      return {
        name,
        caloriesPerServing: Math.round(calPer100g),
        servingDescription: '100 g',
      }
    }

    // Product found but no calorie data — return name only so user can fill in manually
    return { name, caloriesPerServing: 0, servingDescription: '' }
  } catch {
    return null
  }
}

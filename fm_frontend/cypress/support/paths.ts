// api() builds an intercept path for cy.intercept(), e.g. api('/ingredients*')
// The apiBase env var comes from cypress.config.ts and mirrors VITE_BASE_PATH.
export const api = (path: string): string => `${Cypress.env('apiBase')}${path}`

// Named page routes for cy.visit(). These are relative to baseUrl (which already
// includes the context path), so no leading slash and no duplication of /food-manager.
export const pages = {
  login: 'login',
  signup: 'signup',
  ingredients: 'ingredients',
  recipes: 'recipes',
  recommendations: 'recommendations',
  shoppingList: 'shopping-list',
  calorieLog: 'calorie-log',
  profile: 'profile',
  admin: 'admin',
} as const

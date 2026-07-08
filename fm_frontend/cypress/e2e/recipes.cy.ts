import { api, pages } from '../support/paths'

const MOCK_RECIPE = {
  id: 1,
  name: 'Grilled Chicken',
  description: 'Simple grilled chicken',
  recipe_type: 'dinner',
  ingredients: [{ name: 'Chicken Breast', quantity: 200, unit: 'g' }],
  instructions: ['Season chicken', 'Grill for 20 minutes'],
  prep_time: 10,
  cook_time: 20,
  servings: 2,
  image_url: null,
  favorite: false,
  times_cooked: 3,
  last_cooked: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('Recipes page', () => {
  beforeEach(() => {
    cy.login()

    cy.intercept('GET', api('/recipes/count*'), {
      body: { total: 1 },
    }).as('count')

    cy.intercept('GET', api('/recipes*'), {
      body: [MOCK_RECIPE],
    }).as('list')

    cy.visit(pages.recipes)
    cy.wait('@list')
    cy.get('tbody').should('be.visible')
  })

  it('shows the page heading and a recipe row', () => {
    cy.contains('h1', 'Recipes')
    cy.get('tbody').contains('Grilled Chicken').should('be.visible')
    cy.get('tbody').contains('dinner').should('be.visible')
  })

  it('opens the add recipe form and creates a recipe', () => {
    const newRecipe = { ...MOCK_RECIPE, id: 2, name: 'Pasta Bake', recipe_type: 'dinner' }

    cy.intercept('POST', api('/recipes'), {
      statusCode: 201,
      body: newRecipe,
    }).as('create')

    cy.intercept('GET', api('/recipes*'), {
      body: [MOCK_RECIPE, newRecipe],
    }).as('listAfter')
    cy.intercept('GET', api('/recipes/count*'), {
      body: { total: 2 },
    }).as('countAfter')

    cy.contains('button', '+ Add Recipe').click()
    cy.get('form').within(() => {
      cy.get('input').first().should('be.visible').focus().type('Pasta Bake', { force: true })
      cy.contains('button', 'Create Recipe').click()
    })

    cy.wait('@create')
    cy.wait('@listAfter')
    cy.get('tbody').contains('Pasta Bake').should('be.visible')
  })

  it('opens recipe detail modal on row click', () => {
    // RecipeDetailModal fetches ingredients on mount for the edit dropdown.
    // Stub it so the fake token doesn't hit the real server and trigger a 401 logout.
    cy.intercept('GET', api('/ingredients*'), { body: [] }).as('modalIngredients')

    cy.get('tbody').contains('Grilled Chicken').click()
    cy.get('div.fixed').should('be.visible')
    cy.get('div.fixed input[value="Grilled Chicken"]').should('exist')
  })
})

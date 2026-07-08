import { api, pages } from '../support/paths'

const MOCK_INGREDIENT = {
  id: 1,
  name: 'Chicken Breast',
  description: 'Lean poultry',
  ingredient_type: 'meat',
  calories_per_100g: 165,
  usda_fdc_id: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('Ingredients page', () => {
  beforeEach(() => {
    cy.login()

    cy.intercept('GET', api('/ingredients/count*'), {
      body: { total: 1 },
    }).as('count')

    cy.intercept('GET', api('/ingredients*'), {
      body: [MOCK_INGREDIENT],
    }).as('list')

    cy.visit(pages.ingredients)
    cy.wait('@list')
    cy.get('tbody').should('be.visible')
  })

  it('shows the page heading and ingredient row', () => {
    cy.contains('h1', 'Ingredients')
    cy.get('tbody').contains('Chicken Breast').should('be.visible')
    cy.get('tbody').contains('meat').should('be.visible')
  })

  it('searches ingredients by typing in the search box', () => {
    cy.intercept('GET', api('/ingredients*'), { body: [] }).as('searchEmpty')
    cy.intercept('GET', api('/ingredients/count*'), { body: { total: 0 } }).as('countEmpty')

    cy.get('input[placeholder="Search ingredients..."]')
      .should('be.visible')
      .should('not.be.disabled')
      .focus()
      .type('xyz', { force: true })

    cy.wait('@searchEmpty')
    cy.get('tbody').contains('Chicken Breast').should('not.exist')
  })

  it('opens the add ingredient form and creates an ingredient', () => {
    const newIngredient = { ...MOCK_INGREDIENT, id: 2, name: 'Spinach', ingredient_type: 'produce' }

    cy.intercept('POST', api('/ingredients'), {
      statusCode: 201,
      body: newIngredient,
    }).as('create')

    cy.intercept('GET', api('/ingredients*'), {
      body: [MOCK_INGREDIENT, newIngredient],
    }).as('listAfter')
    cy.intercept('GET', api('/ingredients/count*'), {
      body: { total: 2 },
    }).as('countAfter')

    cy.contains('button', '+ Add Ingredient').click()
    cy.get('form').within(() => {
      cy.get('input').first().should('be.visible').focus().type('Spinach', { force: true })
      cy.get('select').select('produce')
      cy.contains('button', 'Create Ingredient').click()
    })

    cy.wait('@create')
    cy.wait('@listAfter')
    cy.get('tbody').contains('Spinach').should('be.visible')
  })

  it('filters by ingredient type', () => {
    cy.intercept('GET', api('/ingredients*'), { body: [] }).as('filtered')
    cy.intercept('GET', api('/ingredients/count*'), { body: { total: 0 } }).as('filteredCount')

    cy.get('select').first().should('be.visible').select('produce')
    cy.wait('@filtered')
  })
})

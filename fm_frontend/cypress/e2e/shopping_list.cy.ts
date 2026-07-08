import { api, pages } from '../support/paths'

const MOCK_LIST = {
  needed: [
    { ingredient_id: 1, name: 'Chicken Breast', quantity: 200, unit: 'g', source_recipes: ['Grilled Chicken'] },
    { ingredient_id: 2, name: 'Olive Oil', quantity: null, unit: null, source_recipes: ['Grilled Chicken'] },
  ],
  unlinked: [],
}

describe('Shopping list — empty cart', () => {
  beforeEach(() => {
    cy.login()
    cy.seedCart()
    cy.visit(pages.shoppingList)
  })

  it('shows the heading and empty state', () => {
    cy.contains('h1', 'Shopping List')
    cy.contains('Your cart is empty').should('be.visible')
  })

  it('has links to browse recipes and ingredients', () => {
    cy.contains('Browse Recipes').should('be.visible')
    cy.contains('Browse Ingredients').should('be.visible')
  })
})

describe('Shopping list — with cart items', () => {
  beforeEach(() => {
    cy.login()
    cy.seedCart([1])

    cy.intercept('POST', api('/shopping-list/generate'), {
      statusCode: 200,
      body: MOCK_LIST,
    }).as('generate')

    cy.visit(pages.shoppingList)
    cy.wait('@generate')
  })

  it('shows the heading with cart summary', () => {
    cy.contains('h1', 'Shopping List')
    cy.contains('1 recipe').should('be.visible')
  })

  it('lists items under Need to buy', () => {
    cy.contains('Need to buy').should('be.visible')
    cy.contains('Chicken Breast').should('be.visible')
    cy.contains('200 g').should('be.visible')
    cy.contains('Olive Oil').should('be.visible')
  })

  it('shows source recipe names on each item', () => {
    cy.contains('Grilled Chicken').should('be.visible')
  })

  it('checks off an item when clicked', () => {
    cy.contains('li', 'Chicken Breast').click()
    cy.contains('li', 'Chicken Breast').find('input[type="checkbox"]').should('be.checked')
  })

  it('clears the cart when Clear Cart is clicked', () => {
    cy.contains('button', 'Clear Cart').click()
    cy.contains('Your cart is empty').should('be.visible')
  })
})

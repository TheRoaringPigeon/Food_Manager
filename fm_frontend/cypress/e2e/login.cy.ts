import { api, pages } from '../support/paths'

describe('Login page', () => {
  beforeEach(() => {
    cy.visit(pages.login)
  })

  it('renders the login form', () => {
    cy.contains('h1', 'Food Manager')
    cy.get('input[type="text"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').contains('Sign in')
  })

  it('shows an error on bad credentials', () => {
    cy.intercept('POST', api('/auth/login'), {
      statusCode: 401,
      body: { detail: 'Invalid credentials' },
    }).as('loginFail')

    cy.get('input[type="text"]').should('be.visible').focus().type('wronguser', { force: true })
    cy.get('input[type="password"]').focus().type('wrongpass', { force: true })
    cy.get('button[type="submit"]').click()

    cy.wait('@loginFail')
    cy.contains('Invalid credentials').should('be.visible')
  })

  it('redirects to ingredients on successful login', () => {
    cy.intercept('POST', api('/auth/login'), {
      statusCode: 200,
      body: {
        access_token: 'fake-token',
        token_type: 'bearer',
        user: {
          id: 1,
          username: 'testuser',
          role: 'standard',
          family_id: 1,
          theme: 'indigo',
          must_change_password: false,
          calorie_goal: null,
        },
      },
    }).as('loginOk')

    cy.intercept('GET', api('/ingredients*'), { body: [] }).as('ing')
    cy.intercept('GET', api('/ingredients/count*'), { body: { total: 0 } }).as('count')

    cy.get('input[type="text"]').should('be.visible').focus().type('testuser', { force: true })
    cy.get('input[type="password"]').focus().type('testpass', { force: true })
    cy.get('button[type="submit"]').click()

    cy.wait('@loginOk')
    cy.url().should('include', pages.ingredients)
  })

  it('has a link to the signup page', () => {
    cy.contains('Sign up').click()
    cy.url().should('include', pages.signup)
  })
})

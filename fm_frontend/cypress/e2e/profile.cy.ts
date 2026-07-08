import { api, pages } from '../support/paths'

describe('Profile page', () => {
  beforeEach(() => {
    cy.login()
    cy.visit(pages.profile)
  })

  it('renders the page heading', () => {
    cy.contains('h1', 'My Profile')
  })

  it('pre-fills the username field', () => {
    cy.get('input[type="text"]').first().should('have.value', 'testuser')
  })

  it('shows an error when passwords do not match', () => {
    cy.get('input[placeholder="Leave blank to keep current"]').first().focus().type('password123!', { force: true })
    cy.get('input[placeholder="Leave blank to keep current"]').eq(1).focus().type('different123!', { force: true })
    cy.contains('button', 'Save changes').click()
    cy.contains('Passwords do not match').should('be.visible')
  })

  it('shows an error when nothing has changed', () => {
    cy.contains('button', 'Save changes').click()
    cy.contains('No changes to save').should('be.visible')
  })

  it('saves a username change successfully', () => {
    cy.intercept('PATCH', api('/users/1'), {
      statusCode: 200,
      body: { id: 1, username: 'newname', role: 'standard', family_id: 1,
              theme: 'indigo', must_change_password: false, calorie_goal: null, is_active: true },
    }).as('patch')

    cy.get('input[type="text"]').first().clear().type('newname', { force: true })
    cy.contains('button', 'Save changes').click()

    cy.wait('@patch')
    cy.contains('Profile updated successfully').should('be.visible')
  })

  it('saves a calorie goal change successfully', () => {
    cy.intercept('PATCH', api('/users/1'), {
      statusCode: 200,
      body: { id: 1, username: 'testuser', role: 'standard', family_id: 1,
              theme: 'indigo', must_change_password: false, calorie_goal: 2000, is_active: true },
    }).as('patch')

    cy.get('input[type="number"]').focus().type('2000', { force: true })
    cy.contains('button', 'Save changes').click()

    cy.wait('@patch')
    cy.contains('Profile updated successfully').should('be.visible')
  })

  it('shows theme selection buttons', () => {
    cy.contains('h2', 'Theme').should('be.visible')
    cy.contains('button', 'Indigo').should('be.visible')
  })
})

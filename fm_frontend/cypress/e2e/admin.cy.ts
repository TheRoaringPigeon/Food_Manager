import { api, pages } from '../support/paths'

const MOCK_USERS = [
  { id: 1, username: 'Admin', role: 'admin', family_id: 1, theme: 'indigo',
    must_change_password: false, calorie_goal: null, is_active: true },
  { id: 2, username: 'testuser2', role: 'standard', family_id: null, theme: 'indigo',
    must_change_password: false, calorie_goal: null, is_active: true },
]

const MOCK_FAMILIES = [
  { id: 1, name: 'Default Family', users: [] },
]

describe('Admin page', () => {
  beforeEach(() => {
    cy.login('admin')

    cy.intercept('GET', api('/users*'), { body: MOCK_USERS }).as('users')
    cy.intercept('GET', api('/families*'), { body: MOCK_FAMILIES }).as('families')

    cy.visit(pages.admin)
    cy.wait('@users')
  })

  it('renders the page heading', () => {
    cy.contains('h1', 'Admin')
  })

  it('shows the Users tab by default', () => {
    cy.contains('h2', 'Users').should('be.visible')
  })

  it('lists users in the table', () => {
    cy.get('tbody').contains('Admin').should('be.visible')
    cy.get('tbody').contains('testuser2').should('be.visible')
  })

  it('marks the current admin user with (you)', () => {
    cy.get('tbody').contains('(you)').should('be.visible')
  })

  it('creates a new user', () => {
    const newUser = { id: 3, username: 'newuser', role: 'standard', family_id: null,
                      theme: 'indigo', must_change_password: false, calorie_goal: null, is_active: true }

    cy.intercept('POST', api('/users'), {
      statusCode: 201,
      body: newUser,
    }).as('createUser')

    cy.get('input[placeholder="username"]').focus().type('newuser', { force: true })
    cy.get('input[placeholder="password"]').focus().type('Pass1234!', { force: true })
    cy.contains('button', 'Create user').click()

    cy.wait('@createUser')
    cy.get('tbody').contains('newuser').should('be.visible')
  })

  it('deactivates a user after confirmation', () => {
    cy.intercept('DELETE', api('/users/2'), { statusCode: 204, body: null }).as('deactivate')

    cy.get('tbody').contains('testuser2').closest('tr').contains('button', 'Deactivate').click()
    cy.contains('Deactivate user').should('be.visible')
    cy.get('.fixed').contains('button', 'Deactivate').click()

    cy.wait('@deactivate')
  })

  it('switches to the Families tab', () => {
    cy.wait('@families')
    cy.contains('button', 'families').click()
    cy.contains('h2', 'Families').should('be.visible')
  })

  it('shows families list on the Families tab', () => {
    cy.wait('@families')
    cy.contains('button', 'families').click()
    cy.contains('Default Family').should('be.visible')
  })

  it('creates a new family', () => {
    const newFamily = { id: 2, name: 'Smith Family', users: [] }

    cy.intercept('POST', api('/families'), {
      statusCode: 201,
      body: newFamily,
    }).as('createFamily')

    cy.wait('@families')
    cy.contains('button', 'families').click()
    cy.get('input[placeholder="family name"]').focus().type('Smith Family', { force: true })
    cy.contains('button', 'Create family').click()

    cy.wait('@createFamily')
    cy.contains('Smith Family').should('be.visible')
  })
})

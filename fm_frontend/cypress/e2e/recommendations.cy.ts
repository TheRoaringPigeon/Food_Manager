import { api, pages } from '../support/paths'

const LLM_STREAM = '**/llm/api/recommendations/stream'

const SSE_SUCCESS =
  'data: {"type":"sql_candidates","count":1,"names":["Grilled Chicken"]}\n\n' +
  'data: {"type":"top5","candidates":[{"id":"1","name":"Grilled Chicken","score":0.8,"match_count":0,"description":"Simple grilled chicken","prep_time":10,"cook_time":20,"ingredients":["Chicken Breast"],"instructions":null,"image_url":null}]}\n\n' +
  'data: {"type":"result","recipe_id":"1","why":"Great match","have_ingredients":[],"missing_ingredients":[],"substitutions":{}}\n\n'

describe('Recommendations page', () => {
  beforeEach(() => {
    cy.login()
    cy.intercept('GET', api('/ingredients*'), { body: [] }).as('ingredients')
    cy.visit(pages.recommendations)
  })

  it('renders the page heading', () => {
    cy.contains('h1', 'What should I cook?')
  })

  it('disables Find recipe when query and ingredients are both empty', () => {
    cy.contains('button', 'Find recipe').should('be.disabled')
  })

  it('enables Find recipe after typing a query', () => {
    cy.get('input[placeholder="Describe what you\'re craving..."]')
      .focus()
      .type('pasta', { force: true })
    cy.contains('button', 'Find recipe').should('not.be.disabled')
  })

  it('shows an error when the stream request fails', () => {
    cy.intercept('POST', LLM_STREAM, {
      statusCode: 500,
      body: 'Internal Server Error',
    }).as('streamFail')

    cy.get('input[placeholder="Describe what you\'re craving..."]')
      .focus()
      .type('soup', { force: true })
    cy.contains('button', 'Find recipe').click()

    cy.wait('@streamFail')
    cy.get('[class*="bg-red"]').should('be.visible')
  })

  it('shows candidate cards after a successful stream', () => {
    cy.intercept('POST', LLM_STREAM, {
      statusCode: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      body: SSE_SUCCESS,
    }).as('stream')

    cy.get('input[placeholder="Describe what you\'re craving..."]')
      .focus()
      .type('chicken', { force: true })
    cy.contains('button', 'Find recipe').click()

    cy.wait('@stream')
    cy.contains('Grilled Chicken').should('be.visible')
    cy.contains("LLM's Pick").should('be.visible')
  })

  it('opens ingredient picker dropdown when searching', () => {
    cy.intercept('GET', api('/ingredients*'), {
      body: [
        { id: 1, name: 'Chicken Breast', ingredient_type: 'meat', calories_per_100g: 165,
          description: null, usda_fdc_id: null, created_at: '', updated_at: '' },
      ],
    }).as('ingSearch')

    cy.get('input[placeholder="Search ingredients..."]')
      .focus()
      .type('chicken', { force: true })

    cy.wait('@ingSearch')
    cy.contains('Chicken Breast').should('be.visible')
  })
})

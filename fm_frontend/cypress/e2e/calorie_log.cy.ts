import { api, pages } from '../support/paths'

const MOCK_LOG = {
  id: 1,
  entry_type: 'freeform',
  food_name: 'Apple',
  calories: 95,
  meal_type: 'snack',
  notes: null,
  quantity_grams: null,
  servings_eaten: null,
  ingredient_id: null,
  recipe_id: null,
  logged_at: '2026-07-07T10:00:00',
}

describe('Calorie log page', () => {
  beforeEach(() => {
    // Register generic intercept first so specific ones registered after it win (LIFO)
    cy.login()
    cy.intercept('GET', api('/calorie-logs*'), { body: [] }).as('logsBase')
    cy.intercept('GET', api('/calorie-logs/history*'), { body: [] }).as('history')
    cy.intercept('GET', api('/calorie-logs/today*'), { body: 0 }).as('today')
    cy.visit(pages.calorieLog)
    cy.wait('@today')
    cy.wait('@history')
    cy.wait('@logsBase')
  })

  it('renders the page heading', () => {
    cy.contains('h1', 'Calorie Log')
  })

  it('shows today\'s total calories', () => {
    cy.contains('kcal consumed').should('be.visible')
    cy.contains('0').should('be.visible')
  })

  it('shows all four log tabs', () => {
    cy.contains('button', 'Ingredient').should('be.visible')
    cy.contains('button', 'Recipe').should('be.visible')
    cy.contains('button', 'Free-form').should('be.visible')
    cy.contains('button', 'Voice').should('be.visible')
  })

  it('switches to the Recipe tab', () => {
    cy.contains('button', 'Recipe').click()
    cy.contains('label', 'Recipe').should('be.visible')
    cy.get('input[placeholder="Search recipes..."]').should('be.visible')
  })

  it('switches to the Free-form tab', () => {
    cy.contains('button', 'Free-form').click()
    cy.contains('label', 'Food name').should('be.visible')
    cy.get('input[placeholder="e.g. Granola bar"]').should('be.visible')
  })

  it('shows a validation error when logging freeform without a food name', () => {
    cy.contains('button', 'Free-form').click()
    cy.get('input[placeholder="e.g. 180"]').focus().type('200', { force: true })
    cy.contains('button', 'Log food').click()
    cy.contains('Enter a food name').should('be.visible')
  })

  it('logs a freeform entry and resets the form', () => {
    cy.intercept('POST', api('/calorie-logs'), {
      statusCode: 201,
      body: MOCK_LOG,
    }).as('create')

    cy.contains('button', 'Free-form').click()
    cy.get('input[placeholder="e.g. Granola bar"]').focus().type('Apple', { force: true })
    cy.get('input[placeholder="e.g. 180"]').focus().type('95', { force: true })
    cy.contains('button', 'Log food').click()

    cy.wait('@create')
    cy.get('input[placeholder="e.g. Granola bar"]').should('have.value', '')
  })

  it('shows empty history message when no entries exist', () => {
    cy.contains('No entries yet').should('be.visible')
  })

  it('shows log entries in history', () => {
    cy.intercept('GET', api('/calorie-logs*'), { body: [MOCK_LOG] }).as('logsWithData')
    cy.intercept('GET', api('/calorie-logs/today*'), { body: 95 }).as('todayWithData')
    cy.intercept('GET', api('/calorie-logs/history*'), { body: [] }).as('historyWithData')
    cy.visit(pages.calorieLog)
    cy.wait('@logsWithData')
    cy.contains('Apple').should('be.visible')
    cy.contains('95 kcal').should('be.visible')
  })
})

// ---- Voice tab ----

const LLM_API = '/food-manager/llm/api'

// Injects a fake SpeechRecognition that fires `transcript` as a final result on start()
// and calls onend() when stop() is called.
function makeSpeechStub(transcript: string) {
  return (win: Cypress.AUTWindow) => {
    function SpeechRecognitionStub(this: any) {
      this.continuous = false
      this.interimResults = false
      this.lang = ''
      this.start = function () {
        this.onresult?.({
          resultIndex: 0,
          results: [{ 0: { transcript }, isFinal: true, length: 1 }],
        })
      }
      this.stop = function () { this.onend?.() }
      this.abort = function () {}
    }
    ;(win as any).SpeechRecognition = SpeechRecognitionStub
    delete (win as any).webkitSpeechRecognition
  }
}

// Simulates mobile Chrome (webkitSpeechRecognition) where each onresult event has
// resultIndex=0 and re-delivers all previous final results in the results array.
// This triggers the duplicate-accumulation bug when finalAccumulated is used.
function makeMobileChromeSpeechStub(part1: string, part2: string) {
  return (win: Cypress.AUTWindow) => {
    function SpeechRecognitionStub(this: any) {
      this.continuous = true
      this.interimResults = true
      this.lang = ''
      this.start = function () {
        // Event 1: first segment finalised
        this.onresult?.({
          resultIndex: 0,
          results: [{ 0: { transcript: part1 }, isFinal: true, length: 1 }],
        })
        // Event 2: first segment re-delivered (resultIndex still 0), second segment interim
        this.onresult?.({
          resultIndex: 0,
          results: [
            { 0: { transcript: part1 }, isFinal: true, length: 1 },
            { 0: { transcript: part2 }, isFinal: false, length: 1 },
          ],
        })
        // Event 3: first segment re-delivered again, second segment finalised
        this.onresult?.({
          resultIndex: 0,
          results: [
            { 0: { transcript: part1 }, isFinal: true, length: 1 },
            { 0: { transcript: part2 }, isFinal: true, length: 1 },
          ],
        })
      }
      this.stop = function () { this.onend?.() }
      this.abort = function () {}
    }
    delete (win as any).SpeechRecognition
    ;(win as any).webkitSpeechRecognition = SpeechRecognitionStub
  }
}

describe('Voice tab', () => {
  beforeEach(() => {
    cy.login()
    cy.intercept('GET', api('/calorie-logs*'), { body: [] }).as('logsBase')
    cy.intercept('GET', api('/calorie-logs/history*'), { body: [] }).as('history')
    cy.intercept('GET', api('/calorie-logs/today*'), { body: 0 }).as('today')
    // Suppress background job polls from VoiceJobContext unless a test overrides this
    cy.intercept('GET', `${LLM_API}/voice-log/jobs/*`, { statusCode: 404 }).as('jobPollDefault')
  })

  it('shows the mic button and idle prompt when Voice tab is active', () => {
    cy.visit(pages.calorieLog)
    cy.wait('@today')
    cy.wait('@history')
    cy.wait('@logsBase')
    cy.contains('button', 'Voice').click()
    cy.get('button.rounded-full').should('be.visible')
    cy.contains('Tap the mic and speak').should('be.visible')
  })

  it('shows an error when SpeechRecognition is not supported by the browser', () => {
    cy.visit(pages.calorieLog, {
      onBeforeLoad(win) {
        delete (win as any).SpeechRecognition
        delete (win as any).webkitSpeechRecognition
      },
    })
    cy.wait('@today')
    cy.wait('@history')
    cy.wait('@logsBase')
    cy.contains('button', 'Voice').click()
    cy.get('button.rounded-full').click()
    cy.contains('Speech recognition is not supported in this browser').should('be.visible')
  })

  it('does not duplicate text on mobile Chrome (webkitSpeechRecognition re-delivering results)', () => {
    // Mobile Chrome fires onresult with resultIndex=0 on every event, re-delivering all
    // previously finalised results. Without the fix the textarea would show something like
    // "I had a I had a I had a granola bar" instead of "I had a granola bar".
    cy.visit(pages.calorieLog, {
      onBeforeLoad: makeMobileChromeSpeechStub('I had a ', 'granola bar'),
    })
    cy.wait('@today')
    cy.wait('@history')
    cy.wait('@logsBase')

    cy.contains('button', 'Voice').click()
    cy.get('button.rounded-full').click()
    cy.contains('Listening…').should('be.visible')

    cy.contains('button', 'Stop').click()

    cy.get('textarea').should('have.value', 'I had a granola bar')
  })

  it('captures transcript, enters review state, and POSTs to the voice-log API', () => {
    const TRANSCRIPT = 'I had a granola bar and an apple'
    cy.intercept('POST', `${LLM_API}/voice-log`, {
      body: { job_id: 'job-abc' },
    }).as('voiceSubmit')
    cy.intercept('GET', `${LLM_API}/voice-log/jobs/job-abc`, {
      body: { status: 'processing', transcript: TRANSCRIPT, items: [], error: null },
    }).as('jobPoll')

    cy.visit(pages.calorieLog, { onBeforeLoad: makeSpeechStub(TRANSCRIPT) })
    cy.wait('@today')
    cy.wait('@history')
    cy.wait('@logsBase')

    cy.contains('button', 'Voice').click()
    cy.get('button.rounded-full').click()
    cy.contains('Listening…').should('be.visible')

    cy.contains('button', 'Stop').click()

    // Review state — editable transcript textarea
    cy.get('textarea').should('have.value', TRANSCRIPT)
    cy.contains('button', 'Send').should('be.visible')

    cy.contains('button', 'Send').click()
    cy.wait('@voiceSubmit')
      .its('request.body')
      .should('deep.equal', { transcript: TRANSCRIPT })

    // Processing state — mic button disabled with spinner
    cy.get('button.rounded-full').should('be.disabled')
    cy.contains('Processing with AI').should('be.visible')
  })

  it('shows the pending approval UI when a completed job is returned by the poll', () => {
    const JOB_ID = 'job-done-xyz'
    cy.intercept('GET', `${LLM_API}/voice-log/jobs/${JOB_ID}`, {
      body: {
        status: 'done',
        transcript: 'I ate an apple and a banana',
        items: [
          { name: 'apple', quantity: 1, unit: null, calories: 95, source: 'local' },
          { name: 'banana', quantity: 1, unit: null, calories: 89, source: 'usda' },
        ],
        error: null,
      },
    }).as('jobPoll')

    cy.visit(pages.calorieLog, {
      onBeforeLoad(win) {
        win.localStorage.setItem('fm_voice_pending_jobs', JSON.stringify([JOB_ID]))
      },
    })
    cy.wait('@today')
    cy.wait('@history')
    cy.wait('@logsBase')
    cy.wait('@jobPoll')

    cy.contains('Pending Approval').should('be.visible')
    cy.contains('apple').should('be.visible')
    cy.contains('95 kcal').should('be.visible')
    cy.contains('banana').should('be.visible')
    cy.contains('89 kcal').should('be.visible')
  })

  it('logs all items and dismisses the entry when Approve all is clicked', () => {
    const JOB_ID = 'job-approve-all'
    cy.intercept('GET', `${LLM_API}/voice-log/jobs/${JOB_ID}`, {
      body: {
        status: 'done',
        transcript: 'I had an apple',
        items: [{ name: 'apple', quantity: 1, unit: null, calories: 95, source: 'local' }],
        error: null,
      },
    }).as('jobPoll')
    cy.intercept('POST', api('/calorie-logs'), {
      statusCode: 201,
      body: {
        id: 99, entry_type: 'freeform', food_name: 'apple (1)', calories: 95,
        meal_type: 'dinner', logged_at: '2026-07-07T10:00:00',
        notes: null, quantity_grams: null, servings_eaten: null,
        ingredient_id: null, recipe_id: null,
      },
    }).as('createLog')

    cy.visit(pages.calorieLog, {
      onBeforeLoad(win) {
        win.localStorage.setItem('fm_voice_pending_jobs', JSON.stringify([JOB_ID]))
      },
    })
    cy.wait('@today')
    cy.wait('@history')
    cy.wait('@logsBase')
    cy.wait('@jobPoll')

    cy.contains('button', 'Approve all').click()
    cy.wait('@createLog')
    cy.contains('Pending Approval').should('not.exist')
  })
})

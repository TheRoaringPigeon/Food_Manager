import './commands'

// Vite's HMR client is configured with clientPort: 5173 in vite.config.ts,
// so the browser polls that port for hot-reload events even when the app is
// accessed via the Docker-mapped port 5183. Stub those requests so they
// don't clutter the Cypress log or hang waiting for a connection.
beforeEach(() => {
  cy.intercept('http://localhost:5173/**', { forceNetworkError: true }).as('viteHmr')
})

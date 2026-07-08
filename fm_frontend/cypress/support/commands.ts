// Seed localStorage so ProtectedRoute passes without hitting the login UI.
// Use this at the start of any test that doesn't need to test auth itself.
Cypress.Commands.add('login', (role: 'admin' | 'standard' = 'standard') => {
  const user = {
    id: 1,
    username: role === 'admin' ? 'Admin' : 'testuser',
    role,
    family_id: 1,
    theme: 'indigo',
    must_change_password: false,
    calorie_goal: null,
  }
  localStorage.setItem('fm_token', 'fake-test-token')
  localStorage.setItem('fm_user', JSON.stringify(user))
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: 'admin' | 'standard'): void
    }
  }
}

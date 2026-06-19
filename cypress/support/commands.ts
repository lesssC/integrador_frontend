declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: {
      access_token: 'fake-jwt-token',
      token_type: 'bearer',
      rol_id: 1,
    },
  }).as('loginRequest')

  cy.visit('/login')
  cy.get('[data-testid="login-email-input"]').type('admin@seguridadgnn.com')
  cy.get('[data-testid="login-password-input"]').type('password123')
  cy.get('[data-testid="login-submit-button"]').click()

  cy.wait('@loginRequest')
})

export {}
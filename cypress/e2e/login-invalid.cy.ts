describe('Suite Funcional: Prevención de Errores en Login', () => {
  it('Debe mostrar error con credenciales inválidas', () => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: {
        detail: 'Credenciales incorrectas',
      },
    }).as('loginFailed')

    cy.visit('/login')

    cy.get('[data-testid="login-email-input"]').type('fake@test.com')
    cy.get('[data-testid="login-password-input"]').type('incorrecto')
    cy.get('[data-testid="login-submit-button"]').click()

    cy.wait('@loginFailed')

    cy.contains('Credenciales incorrectas').should('be.visible')
    cy.screenshot('login-error')
  })
})
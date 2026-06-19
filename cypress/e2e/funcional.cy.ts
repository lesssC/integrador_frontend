describe('Suite Funcional: Seguridad GNN', () => {
  it('Debe permitir al usuario iniciar sesión y ver el mapa predictivo', () => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        rol_id: 1,
      },
    }).as('loginRequest')

    cy.intercept('GET', '**/predict/distritos', {
      statusCode: 200,
      body: {
        success: true,
        data: ['LIMA CENTRO'],
      },
    }).as('getDistritos')

    cy.intercept('GET', '**/dashboard/stats-distrito/*', {
      statusCode: 200,
      body: {
        success: true,
        data: [{ name: 'Centro Historico', value: 80 }],
      },
    }).as('getStats')

    cy.intercept('GET', '**/dashboard/mapa-geojson', {
      statusCode: 200,
      body: {
        success: true,
        data: [{ id: 1, lat: -12.0464, lng: -77.0428, tipo: 'Robo Agravado' }],
      },
    }).as('getGeojson')

    cy.visit('/login')

    cy.get('[data-testid="login-email-input"]').type('admin@seguridadgnn.com')
    cy.get('[data-testid="login-password-input"]').type('password123')
    cy.get('[data-testid="login-submit-button"]').click()
    cy.wait('@loginRequest')

    cy.url().should('include', '/dashboard')

    cy.contains('.dash-nav a', 'Mapa de Delitos').click()
    cy.url().should('include', '/dashboard/mapa')
    cy.wait('@getDistritos')
    cy.wait('@getStats')
    cy.wait('@getGeojson')
    cy.get('.leaflet-container', { timeout: 10000 }).should('be.visible')
    cy.screenshot('mapa')
  })
})
describe('Suite Funcional: Dashboard Principal', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.intercept('GET', '**/dashboard/kpis', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          total_delitos_30d: 23,
          top_zonas: [
            { zone: 'Centro', count: 12 },
            { zone: 'Norte', count: 11 },
          ],
          nivel_riesgo_global: 'Alto',
          distribucion_tipos: [
            { type: 'Robo', count: 10 },
            { type: 'Asalto', count: 8 },
          ],
          tendencia_7d: [
            { date: '2026-06-12', count: 3 },
            { date: '2026-06-13', count: 4 },
          ],
        },
      },
    }).as('dashboardKpis')

    ;(cy as any).login()
  })

  it('Debe mostrar el Dashboard, Menú Lateral y el Usuario logueado', () => {
    cy.wait('@dashboardKpis')

    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard Analítico').should('be.visible')
    cy.contains('Mapa de Delitos').should('be.visible')
    cy.contains('Predicciones').should('be.visible')
    cy.contains('admin').should('be.visible')
    cy.get('[data-testid="dashboard-kpi-grid"]').should('be.visible')

    cy.screenshot('dashboard') 
  })
})

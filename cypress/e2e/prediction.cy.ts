describe("Suite Funcional y de Interoperabilidad: Predicción Delictiva (GNN)", () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    ;(cy as any).login() 

    cy.intercept('GET', '**/predict/distritos', {
      statusCode: 200,
      body: { success: true, data: ['San Juan de Lurigancho', 'MIRAFLORES'] },
    }).as('getDistritos')

    cy.intercept('GET', '**/predict/detalles*', (req) => {
      if (req.url.includes('distrito=TODOS')) {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            prediction_vs_history: [],
            risk_by_hour: [],
            zone_comparison: [],
          },
        })
      }
    }).as('getPrediccionTodos')

    cy.intercept('GET', '**/predict/detalles*', (req) => {
      if (
        req.url.includes('San%20Juan%20de%20Lurigancho') ||
        req.url.includes('San+Juan+de+Lurigancho')
      ) {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            prediction_vs_history: [{ date: '2026-06-12', real: 10, pred: 12 }],
            risk_by_hour: [{ hour: '00:00-03:00', risk: 8 }],
            zone_comparison: [{ zone: 'Sector A', risk: 'Alto', value: 85, color: '#f97316' }],
          },
        })
      }
    }).as('getPrediccionLurigancho')
  })

  it("Debe cargar predicciones automáticamente al cambiar de distrito", () => {
    cy.visit("/dashboard/predicciones")

    cy.wait('@getDistritos')
    cy.wait('@getPrediccionTodos')

    cy.get('[data-testid="predictions-district-select"]')
      .should('be.visible')
      .select('San Juan de Lurigancho')

    cy.get('[data-testid="predictions-loading"]')
      .should('be.visible')

    cy.wait('@getPrediccionLurigancho')
      .its('response.statusCode')
      .should('eq', 200)

    cy.contains("Distrito Seleccionado: San Juan de Lurigancho", { timeout: 10000 })
      .should("be.visible")
      
    cy.contains("Nivel de Riesgo:")
      .should("be.visible")

    cy.screenshot("prediccion-dinamica-exitosa")
  })
})
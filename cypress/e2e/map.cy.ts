describe("Suite Funcional: Visualización del Mapa", () => {
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
          ],
          nivel_riesgo_global: 'Alto',
          distribucion_tipos: [
            { type: 'Robo', count: 10 },
          ],
          tendencia_7d: [
            { date: '2026-06-12', count: 3 },
          ],
        },
      },
    }).as('dashboardKpis')

    cy.intercept('GET', '**/dashboard/mapa-geojson', {
      statusCode: 200,
      body: {
        success: true,
        data: [{ id: 1, lat: -12.0464, lng: -77.0428, tipo: 'Robo Agravado' }],
      },
    }).as('getGeojson')

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
        data: [{ name: 'Centro', value: 80 }],
      },
    }).as('getStats')

    ;(cy as any).login()
  })

  it("Debe cargar el contenedor Leaflet y renderizar los marcadores", () => {
    cy.wait('@dashboardKpis')
    cy.visit("/dashboard/mapa")

    cy.wait('@getDistritos')
    cy.wait('@getStats')
    cy.wait('@getGeojson')

    cy.get(".leaflet-container", { timeout: 10000 })
      .should("exist")
      .and("be.visible")

    cy.get(".leaflet-interactive", { timeout: 10000 })
      .should("exist")
      .and("be.visible")
    cy.screenshot('mapa')
  })
})
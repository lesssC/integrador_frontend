describe("Suite Pública y Usabilidad: Reporte de Denuncia Ciudadana", () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.visit("/reportar-denuncia")
  })

  it("Debe mostrar una validación si el usuario intenta enviar sin seleccionar una ubicación", () => {
    cy.get('[data-testid="report-crime-type-select"]').select('2')
    cy.get('[data-testid="report-crime-desc-textarea"]').type('Me robaron el celular en la esquina.')
    
    cy.get('[data-testid="report-crime-submit-btn"]').should('be.disabled')
    
    cy.contains("* La ubicación es obligatoria.").should('be.visible')
    
    cy.screenshot("denuncia-error-ubicacion")
  })

  it("Debe permitir al usuario marcar una ubicación en el mapa e habilitar el botón", () => {
    cy.get('.leaflet-container', { timeout: 10000 }).should('be.visible')

    cy.get('.leaflet-container').click('center')

    cy.get('.leaflet-marker-icon', { timeout: 5000 }).should('exist').and('be.visible')

    cy.get('[data-testid="report-crime-submit-btn"]').should('not.be.disabled')
    
    cy.get('[data-testid="report-crime-map-container"]')
      .should('have.css', 'border-color')
      .and('match', /rgb\(34, 197, 94\)|#22c55e/) 
      
    cy.screenshot("denuncia-mapa-interactivo")
  })

  it("Debe enviar el reporte exitosamente al backend y mostrar alerta verde", () => {
    cy.intercept('POST', '**/denuncias/publica', {
      statusCode: 201,
      body: {
        success: true,
        message: "Denuncia registrada con éxito"
      }
    }).as('submitDenuncia')

    cy.get('[data-testid="report-crime-type-select"]').select('1')
    
    cy.get('[data-testid="report-crime-date-input"]').type('2026-06-15')
    cy.get('[data-testid="report-crime-time-input"]').type('14:30')
    
    cy.get('[data-testid="report-crime-desc-textarea"]').type('Dos sujetos armados en moto interceptaron mi vehículo.')

    cy.get('.leaflet-container').click('center')

    cy.get('[data-testid="report-crime-submit-btn"]').click()

    cy.wait('@submitDenuncia')
      .its('request.body')
      .should('deep.include', {
        id_tipo_delito: 1,
        descripcion: 'Dos sujetos armados en moto interceptaron mi vehículo.',
        fecha_delito: '2026-06-15',
        hora_delito: '14:30:00'
      })

    cy.contains("Su denuncia ha sido registrada de manera anónima", { timeout: 10000 })
      .should("be.visible")
      
    cy.get('[data-testid="report-crime-desc-textarea"]').should('have.value', '')
    cy.get('[data-testid="report-crime-submit-btn"]').should('be.disabled')
    
    cy.screenshot("denuncia-enviada-exitosa")
  })
})
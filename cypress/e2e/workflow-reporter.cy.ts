describe("Flujo E2E Completo: Ciudadano reporta -> Agente valida", () => {
  
  const idDenuncia = 999;
  const descripcionReporte = "Sujeto sospechoso intentando abrir vehículos estacionados.";

  it("Debe registrar la denuncia pública y luego permitir al agente validarla en el dashboard", () => {
    

    cy.clearCookies();
    cy.clearLocalStorage();

    cy.intercept('POST', '**/denuncias/publica', {
      statusCode: 201,
      body: { success: true, id_generado: idDenuncia }
    }).as('postDenuncia');

    cy.visit("/reportar-denuncia");

    cy.get('[data-testid="report-crime-type-select"]').select('2'); // Hurto simple
    cy.get('[data-testid="report-crime-desc-textarea"]').type(descripcionReporte);
    
    cy.get('.leaflet-container', { timeout: 10000 }).click('center');
    cy.get('[data-testid="report-crime-submit-btn"]').click();
    cy.wait('@postDenuncia');

    cy.contains("registrada de manera anónima").should('be.visible');
    cy.screenshot("denuncia-registrada-ciudadano");

    cy.clearCookies();
    cy.clearLocalStorage();

    
    cy.intercept('GET', '**/denuncias/pendientes*', {
      statusCode: 200,
      body: {
        success: true,
        data: [{
          id_denuncia_ciudadana: idDenuncia,
          id_tipo_delito: 2,
          fecha_delito: "2026-06-18",
          hora_delito: "12:30:00",
          descripcion: descripcionReporte,
          estado: "PENDIENTE",
        }]
      }
    }).as('getBandeja');

    
    cy.intercept('POST', `**/denuncias/aprobar/${idDenuncia}`, {
      statusCode: 200,
      body: { success: true, message: "Estado actualizado a VALIDADO" }
    }).as('validarDenuncia');

    ;(cy as any).login() 

    cy.visit("/dashboard/denuncias");
    cy.wait('@getBandeja');

    cy.contains(descripcionReporte).should('be.visible');
    cy.contains("PENDIENTE").should('be.visible');

    cy.screenshot("denuncia-estado-pendiente");

    cy.get('[data-testid="inbox-approve-btn"]').click();
    
    cy.wait('@validarDenuncia')
      .its('response.statusCode')
      .should('eq', 200);

    cy.contains(descripcionReporte).should('not.exist');

    cy.screenshot("flujo-completo-finalizado");
  });
});
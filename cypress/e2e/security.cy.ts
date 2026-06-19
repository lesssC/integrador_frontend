describe("Suite de Seguridad: Protección de Rutas (JWT)", () => {
  it("No debe permitir el acceso al dashboard sin sesión activa", () => {
    cy.clearCookies()
    cy.clearLocalStorage()

    cy.visit("/dashboard")

    cy.url().should("include", "/login")
  })
})
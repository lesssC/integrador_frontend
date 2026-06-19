describe("Suite Funcional y Seguridad: Cierre de Sesión (Logout)", () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    ;(cy as any).login() 
    
    cy.intercept('GET', '**/dashboard/kpis*', { statusCode: 200, body: { success: true, data: {} } }).as('getKpis')
  })

  it("Debe ejecutar logout, destruir el SessionData y expulsar al login", () => {
    cy.visit("/dashboard")
    cy.wait('@getKpis')

    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="logout-button"]').length > 0) {
        cy.get('[data-testid="logout-button"]').click()
      } else {
        cy.contains(/cerrar sesión|salir/i).click()
      }
    })

    cy.url().should("include", "/login")

    cy.window().then((win) => {
      const storageKeys = Object.keys(win.localStorage)
      const authData = storageKeys.find(key => {
        const item = win.localStorage.getItem(key)
        return item && item.includes('access_token') && item.includes('user')
      })
      
      expect(authData).to.be.undefined
    })
    
    cy.screenshot("logout-exitoso")
  })
})
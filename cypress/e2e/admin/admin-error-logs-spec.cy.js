const cypressEnv = Cypress.env('CYPRESS_ENV')
const { url, apiUrl } = Cypress.env(cypressEnv)
const errorLogFixture = 'mockErrorLogs.json'
describe('Admin', () => {
  beforeEach(() => {
    cy.login()
    cy.intercept(
      {
        method: 'GET',
        url: `${apiUrl}/api/skylogs?skylogType=Errors*`
      },
      {
        fixture: errorLogFixture
      }
    ).as('errorLogs')
  })

  it('should display errors in the Admin Error Logs Page', () => {
    cy.visit(`${url}/#/admin/errorlogs`)
    cy.wait('@errorLogs')
    cy.get('h1')
      .should('contain', 'Error Logs')
    cy.get('[data-cy="error-table-spinner"]', { timeout: 20000 })
      .should('not.exist')

    // Verify error table information
    cy.get('[data-cy="error-time"]')
      .should('have.text', '2:17 pm')
    cy.get('[data-cy="error-location-url"]')
      .should('have.text', '/error-test')
    cy.get('[data-cy="error-message"]')
      .should('contain', 'This is an example error message')
    cy.get('[data-cy="error-display-name"]')
      .should('have.text', 'Neil Hoff')
    cy.get('[data-cy="error-browser"]')
      .should('have.text', 'Microsoft Edge')

    // Verify error dialog popup
    cy.get('[data-cy="error-message"]')
      .click()
    cy.get('[data-cy="error-dialog-popup"]')
      .should('contain', 'Error Details')
      .should('contain', '6-9-2023')
      .should('contain', '"stack": "This is an example stack trace"')
  })
})
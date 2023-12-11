const cypressEnv = Cypress.env('CYPRESS_ENV')
const { url, apiUrl } = Cypress.env(cypressEnv)
const analyticsFixture = 'mockAnalyticsLogs.json'
const errorLogFixture = 'mockErrorLogs.json'

describe('Admin', () => {
  beforeEach(() => {
    cy.login()
    cy.intercept(
      {
        method: 'GET',
        url: `${apiUrl}/api/skylogs?skylogType=Analytics*`
      },
      {
        fixture: analyticsFixture
      }
    ).as('analyticsLogs')
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

  it('should display the Admin Dashboard', () => {
    cy.visit(`${url}/#/admin`)
    cy.wait('@analyticsLogs')
    cy.wait('@errorLogs')

    cy.get('h1').should('contain', 'Admin Dashboard')
    cy.get('.data-card-loader', { timeout: 20000 })
      .should('not.exist')

    // Analytics for today
    cy.get('[data-cy="views-today"] .data-card-views .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 31, 'Views Today')
    cy.get('[data-cy="users-today"] .data-card-users .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 3, 'Users today')
    cy.get('[data-cy="errors-today"] .data-card-errors .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 1, 'Error Today')

    // Analytics for the past 7 days
    cy.get('[data-cy="views-past-7"] .data-card-views .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 31, 'Views the past 7 days')

    cy.get('[data-cy="users-past-7"] .data-card-users .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 3, 'Users the past 7 days')

    cy.get('[data-cy="errors-past-7"] .data-card-errors .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 1, 'Error the past 7 days')
  })
})
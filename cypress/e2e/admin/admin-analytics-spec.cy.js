const cypressEnv = Cypress.env('CYPRESS_ENV')
const { url, apiUrl } = Cypress.env(cypressEnv)
const analyticsFixture = 'mockAnalyticsLogs.json'

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
  })

  it('should display the Admin Analytics Page', () => {
    cy.visit(`${url}/#/admin/analytics`)
    cy.wait('@analyticsLogs')
    cy.get('h1')
      .should('contain', 'Analytics')
    cy.get('.data-card-loader', { timeout: 20000 })
      .should('not.exist')

    // Data Cards
    cy.get('[data-cy="views-card"] .data-card-views .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 31, '31 views')
    cy.get('[data-cy="users-card"] .data-card-users .data-value')
      .invoke('text')
      .then(parseInt).should('equal', 3, '3 users')

    // Lists - Views by Page
    cy.get('[data-cy="views-by-page-list"] .analytics-list-title')
      .should('have.text', 'Views By Page')
    cy.get('[data-cy="views-by-page-list"] [data-cy="list-header-type"]')
      .should('have.text', 'Page')
    const viewsByPageData = [
      { desc: '/', value: '29' },
      { desc: '/admin/analytics', value: '2' }
    ]
    cy.get('[data-cy="views-by-page-list"] [data-cy="list-item"]')
      .each((item, index) => {
        cy.wrap(item)
          .get('[data-cy="list-item-desc"]')
          .should('contain.text', viewsByPageData[index].desc)
        cy.wrap(item)
          .get('[data-cy="list-item-value"]')
          .should('contain.text', viewsByPageData[index].value)
      })

    // Lists - Views by User
    cy.get('[data-cy="views-by-user-list"] .analytics-list-title')
      .should('have.text', 'Views By User')
    cy.get('[data-cy="views-by-user-list"] [data-cy="list-header-type"]')
      .should('have.text', 'User')

    const viewsByUserData = [
      { desc: 'Not Logged In', value: '16' },
      { desc: 'Operations Automated Testing', value: '14' },
      { desc: 'Neil Hoff', value: '1' }
    ]

    cy.get('[data-cy="views-by-user-list"] [data-cy="list-item"]')
      .each((item, index) => {
        cy.wrap(item)
          .get('[data-cy="list-item-desc"]')
          .should('contain.text', viewsByUserData[index].desc)
        cy.wrap(item)
          .get('[data-cy="list-item-value"]')
          .should('contain.text', viewsByUserData[index].value)
      })



  })
})
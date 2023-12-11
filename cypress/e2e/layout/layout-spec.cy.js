const cypressEnv = Cypress.env('CYPRESS_ENV')
const { url, apiUrl } = Cypress.env(cypressEnv)
const siteTitle = Cypress.env('siteTitle')
const essentialLinks = [
  'Home',
  'Example Page',
  'Example SAP Web Service',
  'Example REST API Call',
  'Dashboard',
  'Analytics',
  'Error Logs'
]

describe('Layout', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display a left drawer menu', () => {
    cy.visit(`${url}/#/`)
    cy.get('[data-cy="profile-pic"]')
      .should('exist')

    // Open Drawer
    cy.get('[data-cy="toggle-left-drawer-btn"]')
      .click()
    cy.get('[data-cy="toggle-left-drawer-btn"]')
      .click()
    cy.get('[data-cy="drawer-site-title"]')
      .should('contain', siteTitle)
    cy.get('[data-cy="essential-link"]')
      .each((item, index) => {
        cy.wrap(item)
          .should('contain.text', essentialLinks[index])
      })

    // Open the profile menu
    const { displayName } = Cypress.env('auth')

    cy.get('[data-cy="profile-details"]')
      .should('contain.text', displayName)

    // Switch to dark mode and back to light mode
    cy.get('[data-cy="dark-mode-toggle"]')
      .click()

    cy.get('body.body--dark')
      .should('have.css', 'background', 'rgb(18, 18, 18) none repeat scroll 0% 0% / auto padding-box border-box')

    cy.get('[data-cy="dark-mode-toggle"]')
      .click()
  })
})
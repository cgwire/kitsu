const visit = () => cy.visit('http://localhost:8080')

describe('Login page', () => {
  beforeEach(visit)

  it('When I open the page then the title is correct', () => {
    cy.title().should('include', 'Log in')
  })

  it('As admin when I fill the login form then I see open productions', () => {
    cy.get('.email')
      .type('admin@example.com')
    cy.get('.password')
      .type('default')
    cy.get('.main-button').click()
    cy.wait(300)
    cy.title().should('include', 'Running Productions')
  })
})

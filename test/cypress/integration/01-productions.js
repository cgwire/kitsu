describe('Testing production page', () => {

  context('Create a new production', () => {
    before(() => {
      Cypress.Cookies.defaults({
        whitelist: ['session_id', 'access_token_cookie', 'refresh_token_cookie']
      })

      cy.visit('http://localhost:8080')

      cy.get('.email').type('admin@example.com')
      cy.get('.password').type('default')
      cy.get('.main-button').click()
      cy.title().should('include', 'Running Productions')

      cy.get('#toggle-menu-button').click()

      cy.get('aside').contains('Productions').click()
    })

    it('click to add production', () => {
      cy.get('div.level-item > .button')
        .contains('Add a production')
        .click()
        .wait(500)
    })

    const productionName = `Agent 327-${Math.floor((Math.random() * 1000) + 1)}`

    it('type production form', () => {
      cy.get('.input').type(productionName)
      cy.get('.is-active > .modal-content > .box > .has-text-right > .is-primary')
        .contains('Confirm')
        .click()
    })

    it('Verify the new production', () => {
      cy.wait(500)
      cy.get('.table-body').contains(productionName)
    })
  })

  after(() => {
    cy.get('ul > :nth-child(2)').contains('Logout').click({force: true})
  })
})

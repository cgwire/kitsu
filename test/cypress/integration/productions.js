describe('Testing production page', function () {
  context('Create a new production', function () {
    before(function () {
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

    it('click to add production', function () {
      cy.log('test')
    })
  })
})

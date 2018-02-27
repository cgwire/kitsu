describe('Testing people page', function () {
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

    cy.get('aside').contains('People').click()
  })

  context('Create user', function () {

    it('creating user', function () {
      cy.fixture('users').then((users) => {
        users.forEach(function (user) {
          cy.log(user)
          cy.log(user.firstName)

          cy.log('Click to add new employee')
          cy.get('a.button.level-item').contains('Add a new employee').click().wait(500)

          cy.log('input form')
          cy.get(':nth-child(1) > .control > .input').type(user.firstName)
          cy.get(':nth-child(2) > .control > .input').type(user.lastName)
          cy.get(':nth-child(3) > .control > .input').type(user.email)
          cy.get(':nth-child(4) > .control > .input').type(user.phone)

          cy.log('select a role')
          cy.get(':nth-child(5) > .control > .select > select').select(user.role)

          cy.log('submit form')
          cy.get('.is-active > .modal-content > .box > .has-text-right > .is-primary').contains('Confirm').click({force: true})

          cy.log('controle new people')
          cy.get('div.people-name').contains(user.lastName)
        })
      })
    })
  })
})

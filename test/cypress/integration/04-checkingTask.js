describe('Checking task with superviseur', function () {
  before(function () {
    Cypress.Cookies.defaults({
      whitelist: ['session_id', 'access_token_cookie', 'refresh_token_cookie']
    })

    cy.visit('http://localhost:8080')
  })

  context('checking assets', function () {
    it('log in with Diane', function () {
      cy.fixture('users').then((users) => {
        cy.get('.email').type(users[1].email)
        cy.get('.password').type('default')
        cy.get('.main-button').click()
        cy.get('.nav-right > .nav-item').contains(`${users[1].firstName} ${users[1].lastName}`)
      })
    })

    it('go to assets page', function () {
      cy.get('#toggle-menu-button').click()
      cy.get('aside').contains('Assets').click()
    })

    it('checking Agent 327', function () {
      cy.get('tbody > tr').contains('Agent 327').parent().parent().children().then(($children) => {
        cy.wrap($children[4]).contains('wfa')
        cy.wrap($children[4]).contains('CP')
      })
    })
  })

  context('edit task in done', function () {
    it('click on WFA button', function () {
      cy.get('tbody > tr').contains('Agent 327').parent().parent().children().then(($children) => {
        cy.wrap($children[4]).contains('wfa').click()
      })
    })

    it('select done status', function () {
      cy.get('.media-content > .control > .select > select').select('Done')
    })

    it('post the status', function () {
      cy.get('.control > .button').contains('Post status').click()
    })

    it('check task in done', function () {
      cy.get('.flexrow > .is-medium').contains('done')
    })
  })

  after(function () {
    cy.get('ul > :nth-child(2)').contains('Logout').click({force: true})
  })
})

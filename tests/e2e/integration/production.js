describe('Production creation', () => {
  beforeEach(() => {
    cy.request('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'mysecretpassword'
    })
      .its('body')
      .as('currentUser')
  })

  it('sets auth cookie when logging in via form submission', function () {
    cy.visit('/open-productions')
    cy.get('#create-production-button').click()
    cy.get('.modal.is-active').should('contain', 'Add')
  })
})

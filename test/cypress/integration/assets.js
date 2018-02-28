describe('Creating assets', function () {
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

    cy.get('aside').contains('Assets').click()
  })

  const types = ['Characters', 'Props']
  const assetsFixtures = [
    {
      type: types[0],
      asset: 'Agent 327'
    }, {
      type: types[0],
      asset: 'Super Evil'
    }, {
      type: types[1],
      asset: 'Gun'
    }
  ]

  assetsFixtures.forEach(function (asset) {
    it('click to add assets ', function () {
      cy.get('.asset-list-header > .level > .level-right > div.level-item').contains('Add an asset').click()
    })

    it('select a type', function () {
      cy.get('.is-active > .modal-content > .box > form > :nth-child(1) > .control > .select > select').select(asset.type)
    })

    it('type asset input', function () {
      cy.get(':nth-child(2) > .control > .input').type(asset.asset)
    })

    it('sending the form', function () {
      cy.get('.box > :nth-child(3) > :nth-child(2)').contains('Confirm').click()
    })
  })
})

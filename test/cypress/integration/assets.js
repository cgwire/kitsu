describe('Testing assets page', function () {
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

  context('Creating assets', function () {
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

  context('Adding tasks', function () {
    const tasksFixtures = ['Modeling', 'Setup']

    tasksFixtures.forEach(function (task) {
      it('click on add task', function () {
        cy.get('thead > tr > .actions > .button').contains('Add tasks').click().wait(500)
      })

      it('click a type of task', function () {
        cy.get('.is-active > .modal-content > .box > form > .field > .control > .select > select').select(task)
      })

      it('click on confirm', function () {
        cy.get('.is-active > .modal-content > .box > .has-text-right > .is-primary').contains('Confirm').click().wait(500)
      })
    })
  })

  context('Assignment to the created artist', function () {
    it('click on modeling', function () {
      cy.get('tbody > tr').contains('Agent 327').parent().parent().children().then(($children) => {
        $children[4].click()
      })
    })

    it('select a user: Diane Pierce', function () {
      cy.get('.combobox-item > .field > .control > .select > select').select('Diane Pierce')
    })

    it('valid the assignment', function () {
      cy.get('.flexrow > :nth-child(3) > .button').contains('Confirm').click()
    })

    it('confirm that Diane Pierce have a assigned', function () {
      cy.get('.avatar-link > span').contains('DP')
    })
  })

  context.only('Change status of 1er assigment in WFA', function(){


  })
})

describe('Testing assets page', () => {
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

    cy.get('aside').contains('Assets').click()
  })

  context('Creating assets', () => {
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
      it('click to add assets ', () => {
        cy.get('.asset-list-header > .level > .level-right > div.level-item')
          .contains('Add an asset')
          .click()
      })

      it('select a type', () => {
        cy.get('.is-active > .modal-content > .box > form > :nth-child(1) > .control > .select > select')
          .select(asset.type)
      })

      it('type asset input', () => {
        cy.get(':nth-child(2) > .control > .input').type(asset.asset)
      })

      it('sending the form', () => {
        cy.get('.box > :nth-child(3) > :nth-child(2)')
          .contains('Confirm')
          .click()
      })
    })
  })

  context('Adding tasks', () => {
    const tasksFixtures = ['Modeling', 'Setup']

    tasksFixtures.forEach(function (task) {
      it('click on add task', () => {
        cy.get('thead > tr > .actions > .button')
          .contains('Add tasks')
          .click()
          .wait(500)
      })

      it('click a type of task', () => {
        cy.get('.is-active > .modal-content > .box > form > .field > .control > .select > select')
          .select(task)
      })

      it('click on confirm', () => {
        cy.get('.is-active > .modal-content > .box > .has-text-right > .is-primary')
          .contains('Confirm')
          .click()
          .wait(500)
      })
    })
  })

  context('Assignment to the created artist', () => {
    it('click on modeling', () => {
      cy.get('tbody > tr')
        .contains('Agent 327')
        .parent()
        .parent()
        .children()
        .then(($children) => {
        $children[4].click()
      })
    })

    it('select a user: Curtis Parker', () => {
      cy.get('.combobox-item > .field > .control > .select > select')
        .select('Curtis Parker')
    })

    it('valid the assignment', () => {
      cy.get('.flexrow > :nth-child(3) > .button').contains('Confirm').click()
    })

    it('confirm that Diane Pierce is assigned', () => {
      cy.get('.avatar-link > span').contains('CP')
    })
  })

  context('Change status of 1er assigment in WFA', () => {
    it('click on todo', () => {
      cy.get('tbody > tr')
        .contains('Agent 327')
        .parent()
        .parent()
        .children()
        .then(($children) => {
        cy.wrap($children[4]).contains('todo').click()
      })
    })

    it('select WFA', () => {
      cy.get('.media-content > .control > .select > select')
        .select('Waiting For Approval')
    })

    it('post the status', () => {
      cy.get('.control > .button').contains('Post status').click()
    })
  })

  after(() => {
    cy.get('ul > :nth-child(2)').contains('Logout').click({force: true})
  })
})

const login = () => {
  cy.visit('http://localhost:8080')
  cy.get('.email')
    .type('admin@example.com')
  cy.get('.password')
    .type('default')
  cy.get('.main-button').click()
  cy.wait(300)
}

const goTaskStatusPage = () => {
  cy.get('.sidebar-button').click()
  cy.get('.task-status-link').click()
}

describe('Task status page', () => {
  beforeEach(login)
  beforeEach(goTaskStatusPage)

  it('When I click on task status in sidebar then I go to task status page', () => {
    cy.title().should('include', 'Task Status')
    cy.get('tr')
      .its('length')
      .should('be', 5)
  })

  it('When I create a task status then it adds it to the list', () => {
    cy.get('.task-status-new').click()
    cy.get('.task-status-name')
      .type('Test Status')
    cy.get('.task-status-short-name')
      .type('tst')
    cy.get('.colors .color:nth-child(6)').click()
    cy.get('.confirm-edit-task-status').click()
    cy.get('tr')
      .its('length')
      .should('be', 6)

    cy.get('table tr:nth-child(3) .name')
      .should('contain', 'Test Status')
  })

  it('When I delete a task status then it removes it from the list', () => {
    cy.get('table tr:nth-child(3) .actions a:nth-child(2)')
      .click()

    cy.get('.delete-modal a:nth-child(1)')
      .click()

    cy.get('tr')
      .its('length')
      .should('be', 5)

    cy.get('table tr:nth-child(3) .name')
      .should('contain', 'Todo')
  })
})

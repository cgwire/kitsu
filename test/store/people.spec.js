import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import peopleApi from '../../src/store/api/people'
import {
  LOAD_PEOPLE_START,
  LOAD_PEOPLE_ERROR,
  LOAD_PEOPLE_END,

  DELETE_PEOPLE_START,
  DELETE_PEOPLE_ERROR,
  DELETE_PEOPLE_END,
  SHOW_DELETE_PEOPLE_MODAL,
  HIDE_DELETE_PEOPLE_MODAL,

  EDIT_PEOPLE_START,
  EDIT_PEOPLE_ERROR,
  EDIT_PEOPLE_END,
  SHOW_EDIT_PEOPLE_MODAL,
  HIDE_EDIT_PEOPLE_MODAL,

  IMPORT_PEOPLE_START,
  IMPORT_PEOPLE_ERROR,
  IMPORT_PEOPLE_END,
  SHOW_IMPORT_PEOPLE_MODAL,
  HIDE_IMPORT_PEOPLE_MODAL,

  PERSON_CSV_FILE_SELECTED,
  UPLOAD_AVATAR_END,
  LOAD_PERSON_TASKS_END,
  LOAD_PERSON_DONE_TASKS_END,
  SET_PERSON_TASKS_SEARCH,

  NEW_PEOPLE_END
} from '../../src/store/mutation-types'

let people = []
let tasks = []
let doneTasks = []

peopleApi.getPeople = (callback) => {
  process.nextTick(() => {
    callback(null, people)
  })
}

peopleApi.newPerson = (data, callback) => {
  const person = {id: 'new-person'}
  Object.assign(person, data)
  process.nextTick(() => {
    callback(null, person)
  })
}

peopleApi.updatePerson = (data, callback) => {
  let person = people.find((person) => person.id == data.id)
  person = Object.assign(person, data)
  process.nextTick(() => {
    callback(null, person)
  })
}

peopleApi.deletePerson = (personId, callback) => {
  process.nextTick(() => {
    callback()
  })
}

peopleApi.postCsv = (data, callback) => {
  process.nextTick(() => {
    callback()
  })
}

peopleApi.getPersonTasks = (data, callback) => {
  process.nextTick(() => {
    callback(null, tasks)
  })
}

peopleApi.getPersonDoneTasks = (data, callback) => {
  process.nextTick(() => {
    callback(null, doneTasks)
  })
}

describe('people', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)
  beforeEach(() => {
    people = [
      {
        id: 'person-1',
        first_name: 'John',
        last_name: 'Doe'
      },
      {
        id: 'person-2',
        first_name: 'Ema',
        last_name: 'Peel'
      },
      {
        id: 'person-3',
        first_name: 'Alan',
        last_name: 'Carter'
      },
      {
        id: 'person-4',
        first_name: 'Chris',
        last_name: 'Peel'
      }
    ]
    tasks = [
      {
        project_name: 'Agent327',
        task_type_name: 'Modeling',
        entity_name: 'Tree',
        entity_type_name: 'Props',
        entity_id: 'asset-1',
        task_status_short_name: 'wip',
        last_comment: {},
        id: 'task-1'
      },
      {
        project_name: 'Agent327',
        task_type_name: 'Setup',
        entity_name: 'Tree',
        entity_type_name: 'Props',
        entity_id: 'asset-1',
        task_status_short_name: 'todo',
        last_comment: {
          text: "last comment",
          person_id: "person-1"
        },
        id: 'task-2'
      }
    ]
    doneTasks = [{
        project_name: 'Agent327',
        task_type_name: 'Concept',
        entity_name: 'Tree',
        entity_type_name: 'Props',
        entity_id: 'asset-1',
        task_status_short_name: 'done',
        last_comment: {},
        id: 'task-1'
    }]
  })

  describe('actions', () => {
    it('loadPeople', (done) => {
      helpers.runAction('loadPeople', (err) => {
        expect(err).to.be.null
        expect(store._vm.isPeopleLoading).to.equal(false)
        expect(store._vm.isPeopleLoadingError).to.equal(false)
        expect(store._vm.people).to.deep.equal(people.sort((a, b) => {
          return a.first_name.localeCompare(b.first_name)
        }))
        done()
      })
      expect(store._vm.isPeopleLoading).to.equal(true)
      expect(store._vm.isPeopleLoadingError).to.equal(false)
    })

    it('editPeople', (done) => {
      store.commit(LOAD_PEOPLE_END, people)
      const personId = 'person-2'
      const data = {last_name: 'Edited'}

      helpers.runAction('showPersonEditModal', personId)
      helpers.runAction('editPeople', {data: data, callback: (err) => {
        expect(store._vm.isEditLoading).to.equal(false)
        expect(store._vm.isEditModalShown).to.equal(false)
        expect(store._vm.personToEdit.last_name).to.equal(undefined)
        expect(
          store._vm.people
            .find((person) => person.id === personId)
            .last_name
        ).to.equal('Edited')
        done()
      }})
      expect(store._vm.isEditLoading).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
    })

    it('newPeople', (done) => {
      store.commit(LOAD_PEOPLE_END, people)
      const data = {first_name: 'New', last_name: 'Person'}

      helpers.runAction('showPersonEditModal')
      helpers.runAction('newPeople', {data: data, callback: (err) => {
        expect(store._vm.isEditLoading).to.equal(false)
        expect(store._vm.isEditModalShown).to.equal(false)
        expect(store._vm.personToEdit.last_name).to.equal(undefined)
        expect(
          store._vm.people
            .find((person) => person.id === 'new-person')
            .last_name
        ).to.equal('Person')
        expect(store._vm.people.length).to.equal(5)
        done()
      }})
      expect(store._vm.isEditLoading).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
    })

    it('deletePeople', (done) => {
      store.commit(LOAD_PEOPLE_END, people)
      const personId = 'person-2'

      helpers.runAction('showPersonDeleteModal', personId)
      helpers.runAction('deletePeople', (err) => {
        expect(store._vm.isDeleteLoading).to.equal(false)
        expect(store._vm.isDeleteModalShown).to.equal(false)
        expect(store._vm.personToDelete).to.equal(undefined)
        expect(
          store._vm.people.find((person) => person.id === 'person-2')
        ).to.equal(undefined)
        done()
      })
      expect(store._vm.isDeleteLoading).to.equal(true)
      expect(store._vm.isDeleteLoadingError).to.equal(false)
    })

    it('uploadPersonFile', (done) => {
      helpers.runAction('uploadPersonFile', (err) => {
        expect(store._vm.isImportPeopleLoading).to.equal(false)
        expect(store._vm.isImportPeopleModalShown).to.equal(false)
        expect(store._vm.isImportPeopleLoadingError).to.equal(false)
        done()
      })
      expect(store._vm.isImportPeopleLoading).to.equal(true)
      expect(store._vm.isImportPeopleLoadingError).to.equal(false)
    })


    it('showPersonImportModal / hidePersonImportModal', () => {
      helpers.runAction('showPersonImportModal')
      expect(store._vm.isImportPeopleModalShown).to.equal(true)
      expect(store._vm.isImportPeopleLoadingError).to.equal(false)
      expect(store._vm.isImportPeopleLoading).to.equal(false)

      helpers.runAction('hidePersonImportModal')
      expect(store._vm.isImportPeopleModalShown).to.equal(false)
    })

    it('showPersonDeleteModal / hidePersonDeleteModal', () => {
      store.commit(LOAD_PEOPLE_END, people)
      const personId = 'person-2'

      helpers.runAction('showPersonDeleteModal', personId)
      expect(store._vm.isDeleteModalShown).to.equal(true)
      expect(store._vm.isDeleteLoadingError).to.equal(false)
      expect(store._vm.isDeleteLoading).to.equal(false)
      expect(store._vm.personToDelete.id).to.equal('person-2')

      helpers.runAction('hidePersonDeleteModal')
      expect(store._vm.isDeleteModalShown).to.equal(false)
      expect(store._vm.personToDelete).to.equal(undefined)
    })

    it('showPersonEditModal / hidePersonEditModal', () => {
      store.commit(LOAD_PEOPLE_END, people)
      const personId = 'person-2'

      helpers.runAction('showPersonEditModal', personId)
      expect(store._vm.isEditModalShown).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.personToEdit.id).to.equal('person-2')

      helpers.runAction('hidePersonEditModal')
      expect(store._vm.isEditModalShown).to.equal(false)
      expect(store._vm.personToEdit.id).to.equal(undefined)
    })

    it('loadPersonTasks', (done) => {
      helpers.runAction('loadPersonTasks', {
        personId: 'person-1',
        callback: (err) => {
          expect(err).to.be.null
          expect(store._vm.displayedPersonTasks).to.deep.equal(tasks)
          expect(
            store._vm.displayedPersonTasks[0].full_entity_name
          ).to.equal('Props / Tree')
            expect(store._vm.displayedPersonDoneTasks).to.deep.equal(doneTasks)
          done()
        }
      })
    })

    it('setPersonTasksSearch', () => {
      store.commit(LOAD_PERSON_TASKS_END, tasks)
      helpers.runAction('setPersonTasksSearch', 'wip')

      expect(store._vm.personTasksSearchText).to.equal('wip')
      expect(store._vm.displayedPersonTasks[0]).to.deep.equal(tasks[0])
      expect(store._vm.displayedPersonTasks.length).to.equal(1)

      helpers.runAction('setPersonTasksSearch', '')
    })
  })

  describe('mutations', () => {
    it('LOAD_PEOPLE_START', () => {
      store.commit(LOAD_PEOPLE_START)
      expect(store._vm.isPeopleLoading).to.equal(true)
      expect(store._vm.isPeopleLoadingError).to.equal(false)
      expect(store._vm.personMap).to.deep.equal({})
    })

    it('LOAD_PEOPLE_ERROR', () => {
      store.commit(LOAD_PEOPLE_ERROR)
      expect(store._vm.isPeopleLoading).to.equal(false)
      expect(store._vm.isPeopleLoadingError).to.equal(true)
      expect(store._vm.people).to.deep.equal([])
    })

    it('LOAD_PEOPLE_END', () => {
      store.commit(LOAD_PEOPLE_END, people)
      expect(store._vm.isPeopleLoading).to.equal(false)
      expect(store._vm.isPeopleLoadingError).to.equal(false)
      expect(store._vm.people).to.deep.equal(people)
      expect(store._vm.people[0].first_name).to.equal('Alan')
      expect(store._vm.people[1].first_name).to.equal('Chris')
      expect(store._vm.people[2].first_name).to.equal('Ema')
      expect(store._vm.people[3].first_name).to.equal('John')
      expect(store._vm.personMap['person-3']).to.equal(people[0])
    })

    it('DELETE_PEOPLE_START', () => {
      store.commit(DELETE_PEOPLE_START)
      expect(store._vm.isDeleteLoading).to.equal(true)
      expect(store._vm.isDeleteLoadingError).to.equal(false)
    })

    it('DELETE_PEOPLE_END', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_DELETE_PEOPLE_MODAL, 'person-3')
      store.commit(DELETE_PEOPLE_END)
      expect(store._vm.isDeleteLoading).to.equal(false)
      expect(store._vm.isDeleteLoadingError).to.equal(false)
      expect(store._vm.personToDelete).to.equal(undefined)
      expect(
        store._vm.people.find((person) => person.id === 'person-3')
      ).to.equal(undefined)
      expect(store._vm.personMap['person-3']).to.equal(undefined)
    })

    it('DELETE_PEOPLE_ERROR', () => {
      store.commit(DELETE_PEOPLE_ERROR)
      expect(store._vm.isDeleteLoading).to.equal(false)
      expect(store._vm.isDeleteLoadingError).to.equal(true)
    })

    it('SHOW_DELETE_PEOPLE MODAL', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_DELETE_PEOPLE_MODAL, 'person-2')
      expect(store._vm.isDeleteModalShown).to.equal(true)
      expect(store._vm.isDeleteLoadingError).to.equal(false)
      expect(store._vm.isDeleteLoading).to.equal(false)
      expect(store._vm.personToDelete.id).to.equal('person-2')
    })

    it('HIDE_DELETE_MODAL', () => {
      store.commit(HIDE_DELETE_PEOPLE_MODAL)
      expect(store._vm.isDeleteModalShown).to.equal(false)
      expect(store._vm.personToDelete).to.equal(undefined)
    })

    it('EDIT_PEOPLE_START', () => {
      store.commit(EDIT_PEOPLE_START, {last_name: "New"})
      expect(store._vm.isEditLoading).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(store._vm.personToEdit.last_name).to.equal("New")
    })

    it('EDIT_PEOPLE_END', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_EDIT_PEOPLE_MODAL, 'person-3')
      store.commit(EDIT_PEOPLE_START, {last_name: "Edited"})
      store.commit(EDIT_PEOPLE_END)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(
        store._vm.people.find((person) => person.id === 'person-3')
      .last_name).to.equal("Edited")
    })

    it('EDIT_PEOPLE_END creation', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_EDIT_PEOPLE_MODAL)
      store.commit(EDIT_PEOPLE_START, {first_name: 'New', last_name: "Person"})
      store.commit(NEW_PEOPLE_END, 'new-person')
      store.commit(EDIT_PEOPLE_END)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(
        store._vm.people.find((person) => person.id === 'new-person')
      .last_name).to.equal("Person")
    })

    it('EDIT_PEOPLE_ERROR', () => {
      store.commit(EDIT_PEOPLE_ERROR)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.isEditLoadingError).to.equal(true)
    })

    it('SHOW_EDIT_PEOPLE MODAL', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_EDIT_PEOPLE_MODAL, 'person-2')
      expect(store._vm.isEditModalShown).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.personToEdit.id).to.equal('person-2')
    })

    it('SHOW_EDIT_PEOPLE MODAL creation', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_EDIT_PEOPLE_MODAL)
      expect(store._vm.isEditModalShown).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.personToEdit.id).to.equal(undefined)
      expect(store._vm.personToEdit.first_name).to.equal('')
      expect(store._vm.personToEdit.last_name).to.equal('')
    })

    it('HIDE_EDIT_MODAL', () => {
      store.commit(HIDE_EDIT_PEOPLE_MODAL)
      expect(store._vm.isEditModalShown).to.equal(false)
      expect(store._vm.personToEdit.last_name).to.be.undefined
    })

    it('NEW_PEOPLE_END', () => {
      store.commit(NEW_PEOPLE_END, 'new-person')
      expect(store._vm.personToEdit.id).to.equal('new-person')
    })

    it('IMPORT_PEOPLE_START', () => {
      store.commit(IMPORT_PEOPLE_START)
      expect(store._vm.isImportPeopleLoading).to.equal(true)
      expect(store._vm.isImportPeopleLoadingError).to.equal(false)
    })

    it('IMPORT_PEOPLE_END', () => {
      store.commit(SHOW_IMPORT_PEOPLE_MODAL)
      store.commit(IMPORT_PEOPLE_END)
      expect(store._vm.isImportPeopleLoading).to.equal(false)
      expect(store._vm.isImportPeopleLoadingError).to.equal(false)
    })

    it('IMPORT_PEOPLE_ERROR', () => {
      store.commit(IMPORT_PEOPLE_ERROR)
      expect(store._vm.isImportPeopleLoading).to.equal(false)
      expect(store._vm.isImportPeopleLoadingError).to.equal(true)
    })

    it('SHOW_IMPORT_PEOPLE MODAL', () => {
      store.commit(SHOW_IMPORT_PEOPLE_MODAL)
      expect(store._vm.isImportPeopleModalShown).to.equal(true)
    })

    it('HIDE_IMPORT_MODAL', () => {
      store.commit(SHOW_IMPORT_PEOPLE_MODAL)
      store.commit(HIDE_IMPORT_PEOPLE_MODAL)
      expect(store._vm.isImportPeopleModalShown).to.equal(false)
    })

    it('PERSON_CSV_FILE_SELECTED', () => {
      const formData = {file: {}}
      store.commit(PERSON_CSV_FILE_SELECTED, formData)
      expect(store._vm.personCsvFormData).to.deep.equal(formData)
    })

    it('UPLOAD_AVATAR_END', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(UPLOAD_AVATAR_END, 'person-1')
      const urlMain = '/api/pictures/thumbnails/persons/person-1.png?unique='
      const avatarPath = store._vm.personMap['person-1'].avatarPath
      expect(avatarPath.slice(0, urlMain.length))
        .to.equal(urlMain)
      expect(store._vm.personMap['person-1'].has_avatar).to.be.ok
    })

    it('LOAD_PERSON_TASKS_END', () => {
      store.commit(LOAD_PERSON_TASKS_END, tasks)
      expect(store._vm.displayedPersonTasks).to.deep.equal(tasks)
      expect(
        store._vm.displayedPersonTasks[0].full_entity_name
      ).to.equal('Props / Tree')
    })

    it('LOAD_PERSON_DONE_TASKS_END', () => {
      store.commit(LOAD_PERSON_DONE_TASKS_END, doneTasks)
      expect(store._vm.displayedPersonDoneTasks).to.deep.equal(doneTasks)
    })

    it('SET_PERSON_TASK_SEARCH', () => {
      store.commit(LOAD_PERSON_TASKS_END, tasks)
      store.commit(SET_PERSON_TASKS_SEARCH, 'wip')

      expect(store._vm.personTasksSearchText).to.equal('wip')
      expect(store._vm.displayedPersonTasks[0]).to.deep.equal(tasks[0])
      expect(store._vm.displayedPersonTasks.length).to.equal(1)
    })

  })
})

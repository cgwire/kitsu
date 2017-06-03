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
  HIDE_EDIT_PEOPLE_MODAL

} from '../../src/store/mutation-types'

let people = []

peopleApi.getPeople = (callback) => {
  process.nextTick(() => {
    callback(null, people)
  })
}

peopleApi.deletePerson = (personId, callback) => {
  process.nextTick(() => {
    callback()
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

    it('deletePeople', (done) => {
      store.commit(LOAD_PEOPLE_END, people)
      const personId = {person_id: 'person-2'}

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

    it('showPersonDeleteModal / hidePersonDeleteModal', () => {
      store.commit(LOAD_PEOPLE_END, people)
      const personId = {person_id: 'person-2'}

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
      const personId = {person_id: 'person-2'}

      helpers.runAction('showPersonEditModal', personId)
      expect(store._vm.isEditModalShown).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.personToEdit.id).to.equal('person-2')

      helpers.runAction('hidePersonEditModal')
      expect(store._vm.isEditModalShown).to.equal(false)
      expect(store._vm.personToEdit.id).to.equal(undefined)
    })

  })

  describe('mutations', () => {
    it('LOAD_PEOPLE_START', () => {
      store.commit(LOAD_PEOPLE_START)
      expect(store._vm.isPeopleLoading).to.equal(true)
      expect(store._vm.isPeopleLoadingError).to.equal(false)
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
    })

    it('DELETE_PEOPLE_START', () => {
      store.commit(DELETE_PEOPLE_START)
      expect(store._vm.isDeleteLoading).to.equal(true)
      expect(store._vm.isDeleteLoadingError).to.equal(false)
    })

    it('DELETE_PEOPLE_END', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_DELETE_PEOPLE_MODAL, {person_id: 'person-3'})
      store.commit(DELETE_PEOPLE_END)
      expect(store._vm.isDeleteLoading).to.equal(false)
      expect(store._vm.isDeleteLoadingError).to.equal(false)
      expect(store._vm.personToDelete).to.equal(undefined)
      expect(
        store._vm.people.find((person) => person.id === 'person-3')
      ).to.equal(undefined)
    })

    it('DELETE_PEOPLE_ERROR', () => {
      store.commit(DELETE_PEOPLE_ERROR)
      expect(store._vm.isDeleteLoading).to.equal(false)
      expect(store._vm.isDeleteLoadingError).to.equal(true)
    })

    it('SHOW_DELETE_PEOPLE MODAL', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_DELETE_PEOPLE_MODAL, {person_id: 'person-2'})
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
      store.commit(SHOW_EDIT_PEOPLE_MODAL, {person_id: 'person-3'})
      store.commit(EDIT_PEOPLE_START, {last_name: "Edited"})
      store.commit(EDIT_PEOPLE_END)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(
        store._vm.people.find((person) => person.id === 'person-3')
      .last_name).to.equal("Edited")
    })

    it('EDIT_PEOPLE_ERROR', () => {
      store.commit(EDIT_PEOPLE_ERROR)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.isEditLoadingError).to.equal(true)
    })

    it('SHOW_EDIT_PEOPLE MODAL', () => {
      store.commit(LOAD_PEOPLE_END, people)
      store.commit(SHOW_EDIT_PEOPLE_MODAL, {person_id: 'person-2'})
      expect(store._vm.isEditModalShown).to.equal(true)
      expect(store._vm.isEditLoadingError).to.equal(false)
      expect(store._vm.isEditLoading).to.equal(false)
      expect(store._vm.personToEdit.id).to.equal('person-2')
    })

    it('HIDE_EDIT_MODAL', () => {
      store.commit(HIDE_EDIT_PEOPLE_MODAL)
      expect(store._vm.isEditModalShown).to.equal(false)
      expect(store._vm.personToEdit.last_name).to.be.undefined
    })
  })

})

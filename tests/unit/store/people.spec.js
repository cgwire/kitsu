import { vi } from 'vitest'

// Importing the people module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import store from '@/store/modules/people'

describe('People store', () => {
  describe('Mutations', () => {
    let state

    beforeEach(() => {
      store.cache.people = [
        { id: 'person-1', name: 'John Doe', email: 'john.doe@example.com' },
        { id: 'person-2', name: 'Jane Roe', email: 'jane.roe@example.com' }
      ]
      store.cache.peopleIndex = {}
      store.cache.personMap = new Map()
      store.cache.guests = []
      state = {
        displayedPeople: [],
        guests: [],
        peopleSearchText: '',
        personMapVersion: 0
      }
    })

    // A filter-only search (e.g. `department=animation`) reduces to zero
    // keywords, so indexSearch returns null. The mutation must fall back to
    // the full list rather than leave displayedPeople null.
    test('DELETE_PEOPLE_END keeps displayedPeople an array with a filter search', () => {
      state.peopleSearchText = 'department=animation'
      store.mutations.DELETE_PEOPLE_END(state)
      expect(Array.isArray(state.displayedPeople)).toBe(true)
      expect(state.displayedPeople).toEqual(store.cache.people)
    })

    test('EDIT_PEOPLE_END keeps displayedPeople an array with a filter search', () => {
      state.peopleSearchText = 'department=animation'
      store.mutations.EDIT_PEOPLE_END(state, {
        id: 'person-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com'
      })
      expect(Array.isArray(state.displayedPeople)).toBe(true)
      expect(state.displayedPeople).toEqual(store.cache.people)
    })
  })
})

import peopleApi from '../api/people'
import {
  LOAD_PEOPLE_START,
  LOAD_PEOPLE_ERROR,
  LOAD_PEOPLE_END,
  RESET_ALL
} from '../mutation-types'

const state = {
  people: [],
  isPeopleLoading: false,
  isPeopleLoadingError: true
}

const getters = {
  people: state => state.people,
  isPeopleLoading: state => state.isPeopleLoading,
  isPeopleLoadingError: state => state.isPeopleLoadingError
}

const actions = {
  loadPeople ({ commit, state }, callback) {
    commit(LOAD_PEOPLE_START)
    peopleApi.getPeople((err, people) => {
      if (err) commit(LOAD_PEOPLE_ERROR)
      else {
        commit(LOAD_PEOPLE_END, people.map((person) => {
          person.departments = person.departments || ''
          return person
        }))
      }
      if (callback) callback(err)
    })
  }
}

const mutations = {
  [LOAD_PEOPLE_START] (state) {
    state.isPeopleLoading = true
    state.isPeopleLoadingError = false
  },
  [LOAD_PEOPLE_ERROR] (state) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = true
  },
  [LOAD_PEOPLE_END] (state, people) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = false
    state.people = people.sort((a, b) => {
      if (a.first_name !== a.last_name) {
        return a.first_name.localeCompare(b.first_name)
      } else {
        return a.last_name.localeCompare(b.last_name)
      }
    })
    state.people.forEach((person) => {
      person.name = `${person.first_name} ${person.last_name}`
    })
  },
  [RESET_ALL] (state, people) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = false
    state.people = []
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

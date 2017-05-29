import departmentsApi from '../api/departments.js'
import {
  LOAD_DEPARTMENTS_START,
  LOAD_DEPARTMENTS_ERROR,
  LOAD_DEPARTMENTS_END,
  RESET_ALL
} from '../mutation-types'

const state = {
  departments: [],
  isDepartmentsLoading: false,
  isDepartmentsLoadingError: true
}

const getters = {
  departments: state => state.departments,
  isDepartmentsLoading: state => state.isDepartmentsLoading,
  isDepartmentsLoadingError: state => state.isDepartmentsLoadingError,
}

const actions = {
  loadDepartments ({ commit, state }, callback) {
    commit(LOAD_DEPARTMENTS_START)
    departmentsApi.getDepartments((err, departments) => {
      if (err) commit(LOAD_DEPARTMENTS_ERROR)
      else commit(LOAD_DEPARTMENTS_END, departments)
      if (callback) callback(err)
    })
  }
}

const mutations = {
  [LOAD_DEPARTMENTS_START] (state) {
    state.isDepartmentsLoading = true
    state.isDepartmentsLoadingError = false
  },
  [LOAD_DEPARTMENTS_ERROR] (state) {
    state.isDepartmentsLoading = false
    state.isDepartmentsLoadingError = true
  },
  [LOAD_DEPARTMENTS_END] (state, departments) {
    state.isDepartmentsLoading = false
    state.isDepartmentsLoadingError = false
    state.departments = departments.sort((a, b) => {
      if (a.first_name !== a.last_name) {
        return a.first_name.localeCompare(b.first_name)
      } else {
        return a.last_name.localeCompare(b.last_name)
      }
    })
    state.departments.forEach((person) => {
      person.name = `${person.first_name} ${person.last_name}`
    })
  },
  [RESET_ALL] (state, departments) {
    state.isDepartmentsLoading = false
    state.isDepartmentsLoadingError = false
    state.departments = []
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

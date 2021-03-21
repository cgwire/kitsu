import departmentsApi from '../api/departments'
import {
  LOAD_DEPARTMENTS_START,
  LOAD_DEPARTMENTS_ERROR,
  LOAD_DEPARTMENTS_END,

  EDIT_DEPARTMENTS_END,
  DELETE_DEPARTMENTS_START,
  DELETE_DEPARTMENTS_END,
  DELETE_DEPARTMENTS_ERROR,

  RESET_ALL,
  EDIT_DEPARTMENTS_START,
  EDIT_DEPARTMENTS_ERROR
} from '../mutation-types'

const initialState = {
  departments: []
}

const state = { ...initialState }

const getters = {
  departments: state => state.departments,

  getDepartments: (state) => (id) => {
    return state.departments.find(
      (department) => department.id === id
    )
  }
}

const actions = {
  loadDepartments ({ commit }, callback) {
    commit(LOAD_DEPARTMENTS_START)
    departmentsApi.getDepartments((err, departments) => {
      if (err) commit(LOAD_DEPARTMENTS_ERROR)
      else commit(LOAD_DEPARTMENTS_END, departments)
      if (callback) callback(err)
    })
  },

  async newDepartement ({ commit }, data) {
    commit(EDIT_DEPARTMENTS_START)
    return departmentsApi.newDepartement(data)
      .then((department) => {
        commit(EDIT_DEPARTMENTS_END, department)
        return Promise.resolve(department)
      }).catch((err) => {
        commit(EDIT_DEPARTMENTS_ERROR)
        return Promise.reject(err)
      })
  },

  async editDepartement ({ commit }, data) {
    commit(EDIT_DEPARTMENTS_START)
    return departmentsApi.editDepartement(data)
      .then((department) => {
        commit(EDIT_DEPARTMENTS_END, department)
        return Promise.resolve(department)
      }).catch((err) => {
        commit(EDIT_DEPARTMENTS_ERROR)
        return Promise.reject(err)
      })
  },

  async deleteDepartment ({ commit }, department) {
    commit(DELETE_DEPARTMENTS_START)
    return departmentsApi.deleteDepartment(department).then(() => {
      commit(DELETE_DEPARTMENTS_END, department)
      return Promise.resolve(department)
    }).catch((err) => {
      commit(DELETE_DEPARTMENTS_ERROR)
      return Promise.reject(err)
    })
  }
}

const mutations = {
  [LOAD_DEPARTMENTS_START] () {},

  [LOAD_DEPARTMENTS_ERROR] () {},

  [LOAD_DEPARTMENTS_END] (state, departments) {
    state.departments = departments
  },

  [EDIT_DEPARTMENTS_START] () {},

  [EDIT_DEPARTMENTS_ERROR] () {},

  [EDIT_DEPARTMENTS_END] (state, newDepartement) {
    const department = getters.getDepartments(state)(newDepartement.id)
    if (department && newDepartement.id) {
      Object.assign(department, newDepartement)
    } else {
      state.departments.push(newDepartement)
    }
  },

  [DELETE_DEPARTMENTS_START] () {},
  [DELETE_DEPARTMENTS_ERROR] () {},

  [DELETE_DEPARTMENTS_END] (state, departmentToDelete) {
    const departmentToDeleteIndex = state.departments.findIndex(
      (department) => department.id === departmentToDelete.id
    )
    if (departmentToDeleteIndex >= 0) {
      state.departments.splice(departmentToDeleteIndex, 1)
    }
  },

  [RESET_ALL] (state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

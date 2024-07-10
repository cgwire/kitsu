import departmentsApi from '@/store/api/departments'
import {
  LOAD_DEPARTMENTS_END,
  EDIT_DEPARTMENTS_END,
  DELETE_DEPARTMENTS_END,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  departments: [],
  departmentMap: new Map()
}

const state = { ...initialState }

const getters = {
  departments: state => state.departments.filter(d => !d.archived),
  archivedDepartments: state => state.departments.filter(d => d.archived),
  departmentMap: state => state.departmentMap,

  getDepartment: state => id => {
    return state.departments.find(department => department.id === id)
  }
}

const actions = {
  async loadDepartments({ commit }) {
    const departments = await departmentsApi.getDepartments()
    commit(LOAD_DEPARTMENTS_END, departments)
    return departments
  },

  async newDepartment({ commit }, data) {
    const department = await departmentsApi.newDepartment(data)
    commit(EDIT_DEPARTMENTS_END, department)
    return department
  },

  async editDepartment({ commit }, data) {
    const department = await departmentsApi.editDepartment(data)
    commit(EDIT_DEPARTMENTS_END, department)
    return department
  },

  async deleteDepartment({ commit }, department) {
    await departmentsApi.deleteDepartment(department)
    commit(DELETE_DEPARTMENTS_END, department)
    return department
  }
}

const mutations = {
  [LOAD_DEPARTMENTS_END](state, departments) {
    state.departments = departments
    departments.forEach(department => {
      state.departmentMap.set(department.id, department)
    })
  },

  [EDIT_DEPARTMENTS_END](state, newDepartment) {
    const department = getters.getDepartment(state)(newDepartment.id)
    if (department && newDepartment.id) {
      Object.assign(department, newDepartment)
    } else {
      state.departments.push(newDepartment)
    }
    state.departmentMap.set(newDepartment.id, newDepartment)
  },

  [DELETE_DEPARTMENTS_END](state, departmentToDelete) {
    const departmentToDeleteIndex = state.departments.findIndex(
      department => department.id === departmentToDelete.id
    )
    if (departmentToDeleteIndex >= 0) {
      state.departments.splice(departmentToDeleteIndex, 1)
    }
    state.departmentMap.delete(departmentToDelete.id)
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

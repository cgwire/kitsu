import tasksApi from '../api/tasks'
import {
  LOAD_TASK_TYPES_START,
  LOAD_TASK_TYPES_END,
  LOAD_TASK_TYPES_ERROR,
  RESET_ALL
} from '../mutation-types'

const state = {
  taskTypes: [],
  isTaskTypesLoading: false,
  isTaskTypesLoadingError: true
}

const getters = {
  taskTypes: state => state.taskTypes,
  isTaskTypesLoading: state => state.isTaskTypesLoading,
  isTaskTypesLoadingError: state => state.isTaskTypesLoadingError
}

const actions = {
  loadTaskTypes ({ commit, state }, callback) {
    commit(LOAD_TASK_TYPES_START)
    tasksApi.getTaskTypes((err, taskTypes) => {
      if (err) commit(LOAD_TASK_TYPES_ERROR)
      else commit(LOAD_TASK_TYPES_END, taskTypes.data)
      if (callback) callback(err)
    })
  }
}

const mutations = {
  [LOAD_TASK_TYPES_START] (state) {
    state.isTaskTypesLoading = true
    state.isTaskTypesLoadingError = false
  },
  [LOAD_TASK_TYPES_ERROR] (state) {
    state.isTaskTypesLoading = false
    state.isTaskTypesLoadingError = true
  },
  [LOAD_TASK_TYPES_END] (state, taskTypes) {
    state.isTaskTypesLoading = false
    state.isTaskTypesLoadingError = false
    state.taskTypes = taskTypes.sort((a, b) => {
      console.log(a)
      console.log(a.department)
      console.log(b)
      console.log(b.department)
      if (a.department.name !== b.department.name) {
        return a.department.name.localeCompare(b.department.name)
      } else {
        return a.name.localeCompare(b.name)
      }
    })
  },
  [RESET_ALL] (state) {
    state.isTaskTypesLoading = false
    state.isTaskTypesLoadingError = false
    state.taskTypes = []
  }

}

export default {
  state,
  getters,
  actions,
  mutations
}

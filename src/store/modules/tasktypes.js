import taskTypesApi from '../api/tasktypes'
import { sortByName, sortTaskTypes } from '../../lib/sorting'

import {
  LOAD_TASK_TYPES_START,
  LOAD_TASK_TYPES_ERROR,
  LOAD_TASK_TYPES_END,

  EDIT_TASK_TYPE_START,
  EDIT_TASK_TYPE_ERROR,
  EDIT_TASK_TYPE_END,

  DELETE_TASK_TYPE_START,
  DELETE_TASK_TYPE_ERROR,
  DELETE_TASK_TYPE_END,

  RESET_ALL
} from '../mutation-types'

const state = {
  taskTypes: [],
  isTaskTypesLoading: false,
  isTaskTypesLoadingError: false,

  editTaskType: {
    isLoading: false,
    isError: false
  },

  deleteTaskType: {
    isLoading: false,
    isError: false
  }
}

const getters = {
  taskTypes: state => state.taskTypes,

  isTaskTypesLoading: state => state.isTaskTypesLoading,
  isTaskTypesLoadingError: state => state.isTaskTypesLoadingError,

  editTaskType: state => state.editTaskType,
  deleteTaskType: state => state.deleteTaskType,

  getTaskType: (state, getters) => (id) => {
    return state.taskTypes.find(
      (taskType) => taskType.id === id
    )
  },

  getTaskTypeOptions: state => state.taskTypes.map(
    (type) => { return { label: type.name, value: type.id } }
  ),
  getAssetTaskTypeOptions: state => state.taskTypes
    .filter((taskType) => !taskType.for_shots)
    .map(
      (type) => { return { label: type.name, value: type.id } }
    ),
  getShotTaskTypeOptions: state => state.taskTypes
    .filter((taskType) => taskType.for_shots)
    .map(
      (type) => { return { label: type.name, value: type.id } }
    )
}

const actions = {

  loadTaskTypes ({ commit, state }, callback) {
    commit(LOAD_TASK_TYPES_START)
    taskTypesApi.getTaskTypes((err, taskTypes) => {
      if (err) commit(LOAD_TASK_TYPES_ERROR)
      else commit(LOAD_TASK_TYPES_END, taskTypes)
      if (callback) callback(err)
    })
  },

  newTaskType ({ commit, state }, payload) {
    commit(EDIT_TASK_TYPE_START, payload.data)
    taskTypesApi.newTaskType(payload.data, (err, taskType) => {
      if (err) {
        commit(EDIT_TASK_TYPE_ERROR)
      } else {
        commit(EDIT_TASK_TYPE_END, taskType)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  editTaskType ({ commit, state }, payload) {
    commit(EDIT_TASK_TYPE_START)
    taskTypesApi.updateTaskType(payload.data, (err, taskType) => {
      if (err) {
        commit(EDIT_TASK_TYPE_ERROR)
      } else {
        commit(EDIT_TASK_TYPE_END, taskType)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  deleteTaskType ({ commit, state }, payload) {
    commit(DELETE_TASK_TYPE_START)
    const taskType = payload.taskType
    taskTypesApi.deleteTaskType(taskType, (err) => {
      if (err) {
        commit(DELETE_TASK_TYPE_ERROR)
      } else {
        commit(DELETE_TASK_TYPE_END, taskType)
      }
      if (payload.callback) payload.callback(err)
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
    state.taskTypes = taskTypes
    state.taskTypes = sortTaskTypes(state.taskTypes)
  },

  [EDIT_TASK_TYPE_START] (state, data) {
    state.editTaskType.isLoading = true
    state.editTaskType.isError = false
  },

  [EDIT_TASK_TYPE_ERROR] (state) {
    state.editTaskType.isLoading = false
    state.editTaskType.isError = true
  },

  [EDIT_TASK_TYPE_END] (state, newTaskType) {
    const taskType = getters.getTaskType(state)(newTaskType.id)

    if (taskType && taskType.id) {
      Object.assign(taskType, newTaskType)
    } else {
      state.taskTypes.push(newTaskType)
      state.taskTypes = sortByName(state.taskTypes)
    }
    state.editTaskType = {
      isLoading: false,
      isError: false
    }
  },

  [DELETE_TASK_TYPE_START] (state) {
    state.deleteTaskType = {
      isLoading: true,
      isError: false
    }
  },
  [DELETE_TASK_TYPE_ERROR] (state) {
    state.deleteTaskType = {
      isLoading: false,
      isError: true
    }
  },
  [DELETE_TASK_TYPE_END] (state, taskTypeToDelete) {
    const taskTypeToDeleteIndex = state.taskTypes.findIndex(
      (taskType) => taskType.id === taskTypeToDelete.id
    )
    state.taskTypes.splice(taskTypeToDeleteIndex, 1)

    state.deleteTaskType = {
      isLoading: false,
      isError: false
    }
  },

  [RESET_ALL] (state) {
    state.taskTypes = []
    state.isTaskTypesLoading = false
    state.isTaskTypesLoadingError = false

    state.editTaskType = {
      isLoading: false,
      isError: false
    }

    state.deleteTaskType = {
      isLoading: false,
      isError: false
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

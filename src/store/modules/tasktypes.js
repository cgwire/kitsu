import Vue from 'vue'
import taskTypesApi from '../api/tasktypes'
import { sortTaskTypes } from '../../lib/sorting'

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

  LOAD_SEQUENCE_SUBSCRIBE_END,
  LOAD_SEQUENCE_SUBSCRIPTION_END,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  taskTypes: [],
  taskTypeMap: {},
  sequenceSubscriptions: {},

  editTaskType: {
    isLoading: false,
    isError: false
  },

  deleteTaskType: {
    isLoading: false,
    isError: false
  }
}

const state = {
  ...initialState
}

const getters = {
  taskTypes: state => state.taskTypes,
  taskTypeMap: state => state.taskTypeMap,
  sequenceSubscriptions: state => state.sequenceSubscriptions,

  editTaskType: state => state.editTaskType,
  deleteTaskType: state => state.deleteTaskType,

  currentTaskType: (state, getters, rootState) => {
    return state.taskTypeMap[rootState.route.params.task_type_id] || {}
  },

  assetTaskTypes: state => state.taskTypes
    .filter((taskType) => !taskType.for_shots),

  shotTaskTypes: state => state.taskTypes
    .filter((taskType) => taskType.for_shots),

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
    ),

  getTaskType: (state, getters) => (id) => {
    return state.taskTypeMap[id]
  }
}

const actions = {

  loadTaskTypes ({ commit, state }) {
    commit(LOAD_TASK_TYPES_START)
    return taskTypesApi.getTaskTypes()
      .then((taskTypes) => {
        commit(LOAD_TASK_TYPES_END, taskTypes)
        Promise.resolve(taskTypes)
      })
      .catch((err) => {
        console.error(err)
        Promise.reject(err)
      })
  },

  loadTaskType ({ commit, state }, taskTypeId) {
    return taskTypesApi.getTaskType(taskTypeId)
      .then((taskType) => {
        commit(EDIT_TASK_TYPE_END, taskType)
        Promise.resolve(taskType)
      })
      .catch((err) => {
        console.error(err)
        Promise.reject(err)
      })
  },

  newTaskType ({ commit, state }, data) {
    commit(EDIT_TASK_TYPE_START, data)
    taskTypesApi.newTaskType(data)
      .then((taskType) => {
        commit(EDIT_TASK_TYPE_END, taskType)
        Promise.resolve(taskType)
      })
      .catch((err) => {
        console.error(err)
        commit(EDIT_TASK_TYPE_ERROR)
      })
  },

  editTaskType ({ commit, state }, data) {
    commit(EDIT_TASK_TYPE_START)
    taskTypesApi.updateTaskType(data)
      .then((taskType) => {
        commit(EDIT_TASK_TYPE_END, taskType)
        Promise.resolve(taskType)
      })
      .catch((err) => {
        console.error(err)
        commit(EDIT_TASK_TYPE_ERROR)
      })
  },

  deleteTaskType ({ commit, state }, taskType) {
    commit(DELETE_TASK_TYPE_START)
    taskTypesApi.deleteTaskType(taskType)
      .then(() => {
        commit(DELETE_TASK_TYPE_END, taskType)
        Promise.resolve()
      })
      .catch((err) => {
        console.error(err)
        commit(DELETE_TASK_TYPE_ERROR)
      })
  },

  initTaskType ({ commit, dispatch, state, rootState, rootGetters }, force) {
    return new Promise((resolve, reject) => {
      if (rootGetters.currentTaskType.for_shots) {
        if (Object.keys(rootGetters.shotMap).length < 2 || force) {
          if (rootGetters.episodes.length === 0 && rootGetters.isTVShow) {
            dispatch('loadEpisodes', (err) => {
              if (err) reject(err)
              else {
                dispatch('loadShots', (err) => {
                  if (err) reject(err)
                  else resolve()
                })
              }
            })
          } else {
            dispatch('loadShots', (err) => {
              if (err) reject(err)
              else resolve()
            })
          }
        } else {
          resolve()
        }
      } else {
        if (Object.keys(rootGetters.assetMap).length < 2 || force) {
          dispatch('loadAssets', (err) => {
            if (err) reject(err)
            else resolve()
          })
        } else {
          resolve()
        }
      }
    })
  }
}

const mutations = {
  [LOAD_TASK_TYPES_START] (state) {
  },

  [LOAD_TASK_TYPES_ERROR] (state) {
    state.taskTypes = []
    state.taskTypeMap = {}
  },

  [LOAD_TASK_TYPES_END] (state, taskTypes) {
    state.taskTypes = sortTaskTypes(taskTypes)
    state.taskTypeMap = {}
    taskTypes.forEach((taskType) => {
      state.taskTypeMap[taskType.id] = taskType
    })
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
      state.taskTypes = sortTaskTypes(state.taskTypes)
    }
    state.taskTypeMap[newTaskType.id] = newTaskType
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
    if (taskTypeToDeleteIndex >= 0) {
      state.taskTypes.splice(taskTypeToDeleteIndex, 1)
    }
    delete state.taskTypeMap[taskTypeToDelete.id]

    state.deleteTaskType = {
      isLoading: false,
      isError: false
    }
  },

  [LOAD_SEQUENCE_SUBSCRIBE_END] (state, { sequenceId, subscribed }) {
    Vue.set(state.sequenceSubscriptions, sequenceId, subscribed)
  },

  [LOAD_SEQUENCE_SUBSCRIPTION_END] (state, sequenceIds) {
    state.sequenceSubscriptions = {}
    sequenceIds.forEach((sequenceId) => {
      state.sequenceSubscriptions[sequenceId] = true
    })
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

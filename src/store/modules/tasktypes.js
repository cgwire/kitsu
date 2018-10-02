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
  isTaskTypesLoading: false,
  isTaskTypesLoadingError: false,
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

  isTaskTypesLoading: state => state.isTaskTypesLoading,
  isTaskTypesLoadingError: state => state.isTaskTypesLoadingError,

  editTaskType: state => state.editTaskType,
  deleteTaskType: state => state.deleteTaskType,

  currentTaskType: (state, getters, rootState) => {
    return state.taskTypeMap[rootState.route.params.task_type_id] || {}
  },

  getTaskType: (state, getters) => (id) => {
    return state.taskTypeMap[id]
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
  },

  initTaskType ({ commit, dispatch, state, rootState, rootGetters }, force) {
    return new Promise((resolve, reject) => {
      if (rootGetters.currentTaskType.for_shots) {
        taskTypesApi.getSequenceSubscriptions(
          rootGetters.currentProduction.id,
          rootGetters.currentTaskType.id,
          (err, sequenceIds) => {
            if (err) reject(err)
            else {
              commit(LOAD_SEQUENCE_SUBSCRIPTION_END, sequenceIds)
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
            }
          }
        )
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
    state.isTaskTypesLoading = true
    state.isTaskTypesLoadingError = false
  },

  [LOAD_TASK_TYPES_ERROR] (state) {
    state.isTaskTypesLoading = false
    state.isTaskTypesLoadingError = true
    state.taskTypes = []
    state.taskTypeMap = {}
  },

  [LOAD_TASK_TYPES_END] (state, taskTypes) {
    state.isTaskTypesLoading = false
    state.isTaskTypesLoadingError = false
    state.taskTypes = taskTypes
    state.taskTypes = sortTaskTypes(state.taskTypes)
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
    state.taskTypes.splice(taskTypeToDeleteIndex, 1)
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
    Object.assign(state, {...initialState})
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

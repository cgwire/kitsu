import taskTypesApi from '@/store/api/tasktypes'
import { getTaskTypePriorityOfProd } from '@/lib/productions'
import { sortTaskTypes } from '@/lib/sorting'

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
} from '@/store/mutation-types'

const initialState = {
  taskTypes: [],
  taskTypeMap: new Map(),
  sequenceSubscriptions: {}
}

const state = {
  ...initialState
}

const getters = {
  taskTypes: state => state.taskTypes,
  taskTypeMap: state => state.taskTypeMap,
  sequenceSubscriptions: state => state.sequenceSubscriptions,

  currentTaskType: (state, getters, rootState) => {
    return state.taskTypeMap.get(rootState.route.params.task_type_id) || {}
  },

  assetTaskTypes: (state, getters, rootState, rootGetters) => {
    return state.taskTypes
      .filter(taskType => taskType.for_entity === 'Asset')
  },

  shotTaskTypes: (state, getters, rootState, rootGetters) => {
    return state.taskTypes
      .filter(taskType => taskType.for_entity === 'Shot')
  },

  editTaskTypes: (state, getters, rootState, rootGetters) => {
    return state.taskTypes
      .filter(taskType => taskType.for_entity === 'Edit')
  },

  sequenceTaskTypes: (state, getters, rootState, rootGetters) => {
    return state.taskTypes
      .filter(taskType => taskType.for_entity === 'Sequence')
  },

  episodeTaskTypes: (state, getters, rootState, rootGetters) => {
    return state.taskTypes
      .filter(taskType => taskType.for_entity === 'Episode')
  },

  getTaskTypeOptions: state => state.taskTypes.map(
    (type) => { return { label: type.name, value: type.id } }
  ),

  getAssetTaskTypeOptions: (state, getters) => getters.assetTaskTypes
    .map(
      (type) => { return { label: type.name, value: type.id } }
    ),

  getShotTaskTypeOptions: (state, getters) => getters.shotTaskTypes
    .map(
      (type) => { return { label: type.name, value: type.id } }
    ),

  getEditTaskTypeOptions: (state, getters) => getters.editTaskTypes
    .map(
      (type) => { return { label: type.name, value: type.id } }
    ),

  getEpisodeTaskTypeOptions: (state, getters) => getters.episodeTaskTypes
    .map(
      (type) => { return { label: type.name, value: type.id } }
    ),

  getTaskType: (state, getters) => (id) => {
    return state.taskTypeMap.get(id)
  },

  getTaskTypePriority: (state, getters, rootState, rootGetters) =>
    (taskTypeId) => {
      const taskType = getters.getTaskType(taskTypeId)
      if (!taskType) {
        return null
      }
      return getTaskTypePriorityOfProd(taskType, rootGetters.currentProduction)
    },

  isTaskTypePriorityHigherById: (state, getters, rootState, rootGetters) => (taskTypeAId, taskTypeBId) => {
    return getTaskTypePriorityOfProd(getters.getTaskType(taskTypeAId), rootGetters.currentProduction) >
        getTaskTypePriorityOfProd(getters.getTaskType(taskTypeBId), rootGetters.currentProduction)
  }
}

const actions = {

  uploadTaskTypeEstimations ({ commit, state, rootGetters }, formData) {
    return taskTypesApi.postTaskTypeEstimations(rootGetters.currentProduction,
      rootGetters.currentEpisode, rootGetters.currentTaskType, formData)
  },

  loadTaskTypes ({ commit, state }) {
    commit(LOAD_TASK_TYPES_START)
    return taskTypesApi.getTaskTypes()
      .then((taskTypes) => {
        commit(LOAD_TASK_TYPES_END, taskTypes)
        Promise.resolve(taskTypes)
      })
      .catch(err => {
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
      .catch(err => {
        console.error(err)
        Promise.reject(err)
      })
  },

  newTaskType ({ commit, state }, data) {
    commit(EDIT_TASK_TYPE_START, data)
    return taskTypesApi.newTaskType(data)
      .then((taskType) => {
        commit(EDIT_TASK_TYPE_END, taskType)
        Promise.resolve(taskType)
      })
  },

  editTaskType ({ commit, state }, data) {
    commit(EDIT_TASK_TYPE_START)
    return taskTypesApi.updateTaskType(data)
      .then(taskType => {
        commit(EDIT_TASK_TYPE_END, taskType)
        Promise.resolve(taskType)
      })
  },

  async editTaskTypeLink ({ commit, state }, data) {
    return await taskTypesApi.updateTaskTypeLink(data)
  },

  deleteTaskType ({ commit, state }, taskType) {
    commit(DELETE_TASK_TYPE_START)
    return taskTypesApi.deleteTaskType(taskType)
      .then(() => {
        commit(DELETE_TASK_TYPE_END, taskType)
        Promise.resolve(taskType)
      })
  },

  initTaskType ({ commit, dispatch, state, rootState, rootGetters }, force) {
    return new Promise((resolve, reject) => {
      if (rootGetters.currentTaskType.for_entity === 'Shot') {
        if (rootGetters.shotMap.size < 2 || force) {
          if (rootGetters.episodes.length === 0 && rootGetters.isTVShow) {
            return dispatch('loadEpisodes')
              .then(() => dispatch('loadShots'))
              .then(resolve)
              .catch(reject)
          } else {
            return dispatch('loadShots')
              .then(resolve)
              .catch(reject)
          }
        } else {
          resolve()
        }
      } else if (rootGetters.currentTaskType.for_entity === 'Asset') {
        if (rootGetters.assetMap.size < 2 || force) {
          if (rootGetters.episodes.length === 0 && rootGetters.isTVShow) {
            return dispatch('loadEpisodes')
              .then(() => dispatch('loadAssets'))
              .then(resolve)
              .catch(reject)
          } else {
            return dispatch('loadAssets')
              .then(resolve)
              .catch(reject)
          }
        } else {
          resolve()
        }
      } else if (rootGetters.currentTaskType.for_entity === 'Edit') {
        if (rootGetters.editMap.size < 2 || force) {
          return dispatch('loadEdits')
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      } else if (rootGetters.currentTaskType.for_entity === 'Episode') {
        if (rootGetters.episodeMap.size < 2 || force) {
          return dispatch('loadEpisodesWithTasks')
            .then(resolve)
            .catch(reject)
        } else {
          resolve()
        }
      } else if (rootGetters.currentTaskType.for_entity === 'Sequence') {
        if (rootGetters.sequenceMap.size < 2 || force) {
          return dispatch('loadSequencesWithTasks')
            .then(resolve)
            .catch(reject)
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
    state.taskTypeMap = new Map()
  },

  [LOAD_TASK_TYPES_END] (state, taskTypes) {
    state.taskTypes = sortTaskTypes(taskTypes)
    state.taskTypeMap = new Map()
    taskTypes.forEach(taskType => {
      state.taskTypeMap.set(taskType.id, taskType)
    })
  },

  [EDIT_TASK_TYPE_START] (state, data) {},
  [EDIT_TASK_TYPE_ERROR] (state) {},
  [EDIT_TASK_TYPE_END] (state, newTaskType) {
    const taskType = state.taskTypeMap.get(newTaskType.id)
    if (taskType && taskType.id) {
      Object.assign(taskType, newTaskType)
    } else {
      state.taskTypes.push(newTaskType)
      state.taskTypeMap.set(newTaskType.id, newTaskType)
    }
    state.taskTypes = sortTaskTypes(state.taskTypes)
  },

  [DELETE_TASK_TYPE_START] (state) {},
  [DELETE_TASK_TYPE_ERROR] (state) {},
  [DELETE_TASK_TYPE_END] (state, taskTypeToDelete) {
    const taskTypeToDeleteIndex = state.taskTypes.findIndex(
      taskType => taskType.id === taskTypeToDelete.id
    )
    if (taskTypeToDeleteIndex >= 0) {
      state.taskTypes.splice(taskTypeToDeleteIndex, 1)
    }
    state.taskTypeMap.delete(taskTypeToDelete.id)
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

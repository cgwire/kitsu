import taskStatusApi from '../api/taskstatus'
import { sortByName } from '../../lib/sorting'

import {
  LOAD_TASK_STATUSES_START,
  LOAD_TASK_STATUSES_ERROR,
  LOAD_TASK_STATUSES_END,

  EDIT_TASK_STATUS_END,
  DELETE_TASK_STATUS_END,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  taskStatus: [],
  taskStatusMap: {}
}

const state = initialState

const getters = {
  taskStatus: state => state.taskStatus,
  taskStatusMap: state => state.taskStatusMap,
  editTaskStatus: state => state.editTaskStatus,
  deleteTaskStatus: state => state.deleteTaskStatus,

  taskStatusForCurrentUser: (state, getters, rootState, rootGetters) => {
    const statuses = rootGetters.productionTaskStatuses
    if (rootGetters.isCurrentUserManager) {
      return statuses
    } else if (rootGetters.isCurrentUserClient) {
      return statuses.filter(taskStatus => {
        return taskStatus.is_client_allowed
      })
    } else {
      return statuses.filter(taskStatus => {
        return taskStatus.is_artist_allowed
      })
    }
  },

  getTaskStatusForCurrentUser:
    (state, getters, rootState, rootGetters) => (projectId) => {
      const statuses = rootGetters.getProductionTaskStatuses(projectId)
      if (rootGetters.isCurrentUserManager) {
        return statuses
      } else if (rootGetters.isCurrentUserClient) {
        return statuses.filter(taskStatus => {
          return taskStatus.is_client_allowed
        })
      } else {
        return statuses.filter(taskStatus => {
          return taskStatus.is_artist_allowed
        })
      }
    }

}

const actions = {

  loadTaskStatuses ({ commit, state }, callback) {
    commit(LOAD_TASK_STATUSES_START)
    taskStatusApi.getTaskStatuses((err, taskStatus) => {
      if (err) commit(LOAD_TASK_STATUSES_ERROR)
      else commit(LOAD_TASK_STATUSES_END, taskStatus)
      if (callback) callback(err)
    })
  },

  loadTaskStatus ({ commit, state }, taskStatusId) {
    taskStatusApi.getTaskStatus(taskStatusId, (err, taskStatus) => {
      if (err) console.error(err)
      else commit(EDIT_TASK_STATUS_END, taskStatus)
    })
  },

  newTaskStatus ({ commit, state }, form) {
    return taskStatusApi.newTaskStatus(form)
      .then((taskStatus) => {
        commit(EDIT_TASK_STATUS_END, taskStatus)
        Promise.resolve(taskStatus)
      })
  },

  saveTaskStatus ({ commit, state }, form) {
    return taskStatusApi.updateTaskStatus(form)
      .then((taskStatus) => {
        commit(EDIT_TASK_STATUS_END, taskStatus)
        Promise.resolve(taskStatus)
      })
  },

  deleteTaskStatus ({ commit, state }, taskStatus) {
    taskStatusApi.deleteTaskStatus(taskStatus)
      .then(() => {
        commit(DELETE_TASK_STATUS_END, taskStatus)
        Promise.resolve(taskStatus)
      })
  }
}

const mutations = {
  [LOAD_TASK_STATUSES_START] (state) {
    state.taskStatus = []
    state.taskStatusMap = {}
  },

  [LOAD_TASK_STATUSES_ERROR] (state) {
    state.taskStatus = []
    state.taskStatusMap = {}
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatus) {
    state.taskStatus = sortByName(taskStatus)
    state.taskStatusMap = {}
    taskStatus.forEach((taskStatus) => {
      if (taskStatus.is_artist_allowed === null) {
        taskStatus.is_artist_allowed = true
      }
      if (taskStatus.is_client_allowed === null) {
        taskStatus.is_client_allowed = false
      }
      state.taskStatusMap[taskStatus.id] = taskStatus
    })
  },

  [EDIT_TASK_STATUS_END] (state, newTaskStatus) {
    const taskStatus = state.taskStatusMap[newTaskStatus.id]

    if (taskStatus && taskStatus.id) {
      Object.assign(taskStatus, newTaskStatus)
    } else {
      state.taskStatus.push(newTaskStatus)
      state.taskStatus = sortByName(state.taskStatus)
    }
    state.taskStatusMap[newTaskStatus.id] = newTaskStatus
  },

  [DELETE_TASK_STATUS_END] (state, taskStatusToDelete) {
    const taskStatusToDeleteIndex = state.taskStatus.findIndex(
      (taskStatus) => taskStatus.id === taskStatusToDelete.id
    )
    if (taskStatusToDeleteIndex >= 0) {
      state.taskStatus.splice(taskStatusToDeleteIndex, 1)
    }
    delete state.taskStatusMap[taskStatusToDelete.id]
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

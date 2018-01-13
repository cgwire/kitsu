import taskStatusApi from '../api/taskstatus'
import { sortByName } from '../../lib/sorting'

import {
  LOAD_TASK_STATUSES_START,
  LOAD_TASK_STATUSES_ERROR,
  LOAD_TASK_STATUSES_END,

  EDIT_TASK_STATUS_START,
  EDIT_TASK_STATUS_ERROR,
  EDIT_TASK_STATUS_END,

  DELETE_TASK_STATUS_START,
  DELETE_TASK_STATUS_ERROR,
  DELETE_TASK_STATUS_END,

  RESET_ALL
} from '../mutation-types'

const state = {
  taskStatus: [],
  taskStatusMap: {}
}

const getters = {
  taskStatus: state => state.taskStatus,
  taskStatusMap: state => state.taskStatusMap,

  editTaskStatus: state => state.editTaskStatus,
  deleteTaskStatus: state => state.deleteTaskStatus
}

const actions = {

  loadTaskStatus ({ commit, state }, callback) {
    commit(LOAD_TASK_STATUSES_START)
    taskStatusApi.getTaskStatus((err, taskStatus) => {
      if (err) commit(LOAD_TASK_STATUSES_ERROR)
      else commit(LOAD_TASK_STATUSES_END, taskStatus)
      if (callback) callback(err)
    })
  },

  newTaskStatus ({ commit, state }, payload) {
    commit(EDIT_TASK_STATUS_START, payload.data)
    taskStatusApi.newTaskStatus(payload.data, (err, taskStatus) => {
      if (err) {
        commit(EDIT_TASK_STATUS_ERROR)
      } else {
        commit(EDIT_TASK_STATUS_END, taskStatus)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  editTaskStatus ({ commit, state }, payload) {
    commit(EDIT_TASK_STATUS_START)
    taskStatusApi.updateTaskStatus(payload.data, (err, taskStatus) => {
      if (err) {
        commit(EDIT_TASK_STATUS_ERROR)
      } else {
        commit(EDIT_TASK_STATUS_END, taskStatus)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  deleteTaskStatus ({ commit, state }, payload) {
    commit(DELETE_TASK_STATUS_START)
    const taskStatus = payload.taskStatus
    taskStatusApi.deleteTaskStatus(taskStatus, (err) => {
      if (err) {
        commit(DELETE_TASK_STATUS_ERROR)
      } else {
        commit(DELETE_TASK_STATUS_END, taskStatus)
      }
      if (payload.callback) payload.callback(err)
    })
  }
}

const mutations = {
  [LOAD_TASK_STATUSES_START] (state) {
  },

  [LOAD_TASK_STATUSES_ERROR] (state) {
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatus) {
    state.taskStatus = sortByName(state.taskStatus)
    state.taskStatusMap = {}
    taskStatus.forEach((taskStatus) => {
      state.taskStatusMap[taskStatus.id] = taskStatus
    })
  },

  [EDIT_TASK_STATUS_START] (state, data) {
  },

  [EDIT_TASK_STATUS_ERROR] (state) {
  },

  [EDIT_TASK_STATUS_END] (state, newTaskStatus) {
    const taskStatus = getters.getTaskStatus(state)(newTaskStatus.id)

    if (taskStatus && taskStatus.id) {
      Object.asign(taskStatus, newTaskStatus)
    } else {
      state.taskStatus.push(newTaskStatus)
      state.taskStatus = sortByName(state.taskStatus)
    }
    state.taskStatusMap[newTaskStatus.id] = newTaskStatus
  },

  [DELETE_TASK_STATUS_START] (state) {
  },
  [DELETE_TASK_STATUS_ERROR] (state) {
  },
  [DELETE_TASK_STATUS_END] (state, taskStatusToDelete) {
    const taskStatusToDeleteIndex = state.taskStatus.findIndex(
      (taskStatus) => taskStatus.id === taskStatusToDelete.id
    )
    state.taskStatus.splice(taskStatusToDeleteIndex, 1)
    delete state.taskStatusMap[taskStatusToDelete.id]
  },

  [RESET_ALL] (state) {
    state.taskStatus = []
    state.taskStatusMap = {}
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

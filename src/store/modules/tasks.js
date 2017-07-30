import tasksApi from '../api/tasks'
import { sortByName } from '../../lib/sorting'
import {
  LOAD_ASSETS_END,
  LOAD_SHOTS_END,

  LOAD_TASK_END,
  LOAD_TASK_STATUSES_END,

  RESET_ALL
} from '../mutation-types'

const state = {
  taskMap: {},
  taskStatuses: []
}

const getters = {
  getTask: (state, getters) => (id) => {
    return state.taskMap[id]
  },

  getTaskStatus: (state, getters) => (id) => {
    return state.taskStatuses.find(
      (taskStatus) => taskStatus.id === id
    )
  },

  taskStatusOptions: state => state.taskStatuses.map((status) => {
    return {
      label: status.name,
      value: status.id,
      color: status.color
    }
  })
}

const actions = {
  loadTask ({ commit, state }, payload) {
    tasksApi.getTask(payload.taskId, (err, task) => {
      if (!err) {
        commit(LOAD_TASK_END, task)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  loadTaskStatuses ({ commit, state }, callback) {
    tasksApi.getTaskStatuses((err, taskStatus) => {
      if (!err) commit(LOAD_TASK_STATUSES_END, taskStatus)
      if (callback) callback(err)
    })
  }
}

const mutations = {
  [LOAD_ASSETS_END] (state, assets) {
    assets.forEach((asset) => {
      asset.tasks.forEach((task) => {
        task.project_name = asset.project_name
        task.entity_name = `${asset.asset_type_name} / ${asset.name}`
        state.taskMap[task.id] = task
      })
    })
  },

  [LOAD_SHOTS_END] (state, shots) {
    shots.forEach((shot) => {
      shot.tasks.forEach((task) => {
        task.project_name = shot.project_name
        task.entity_name = `${shot.sequence_name} / ${shot.name}`
        state.taskMap[task.id] = task
      })
    })
  },

  [LOAD_TASK_END] (state, task) {
    task.project_name = task.project.name
    task.task_status_name = task.task_status.name
    task.task_status_short_name = task.task_status.short_name
    task.task_type_name = task.task_type.name
    task.task_status_color = task.task_status.color
    task.task_type_color = task.task_type.color
    if (task.entity_type.name === 'Shot') {
      task.entity_name = `${task.entity_parent.name} / ${task.entity.name}`
    } else {
      task.entity_name = `${task.entity_type.name} / ${task.entity.name}`
    }
    state.taskMap[task.id] = task
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatuses) {
    state.taskStatuses = sortByName(taskStatuses)
  },

  [RESET_ALL] (state, shots) {
    state.taskMap = {}
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

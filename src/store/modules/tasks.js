import tasksApi from '../api/tasks'
import { sortByName } from '../../lib/sorting'
import {
  LOAD_ASSETS_END,
  LOAD_SHOTS_END,

  LOAD_TASK_END,
  LOAD_TASK_STATUSES_END,
  LOAD_TASK_COMMENTS_END,

  NEW_TASK_COMMENT_END,

  CREATE_TASKS_END,

  RESET_ALL
} from '../mutation-types'

const state = {
  taskMap: {},
  taskStatuses: [],
  taskComments: {}
}

const getters = {
  getTask: (state, getters) => (id) => {
    return state.taskMap[id]
  },

  getTaskComments: (state, getters) => (id) => {
    return state.taskComments[id]
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
  loadTaskStatuses ({ commit, state }, callback) {
    tasksApi.getTaskStatuses((err, taskStatus) => {
      if (!err) commit(LOAD_TASK_STATUSES_END, taskStatus)
      if (callback) callback(err)
    })
  },

  loadTask ({ commit, state }, payload) {
    tasksApi.getTask(payload.taskId, (err, task) => {
      if (!err) {
        commit(LOAD_TASK_END, task)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  loadTaskComments ({ commit, state }, payload) {
    tasksApi.getTaskComments(payload.taskId, (err, comments) => {
      if (!err) {
        commit(LOAD_TASK_COMMENTS_END, {comments, taskId: payload.taskId})
      }
      if (payload.callback) payload.callback(err)
    })
  },

  commentTask ({ commit, state }, payload) {
    tasksApi.commentTask(payload, (err, comment) => {
      if (!err) {
        commit(NEW_TASK_COMMENT_END, {comment, taskId: payload.taskId})
      }
      if (payload.callback) payload.callback(err, comment)
    })
  },

  createTasks ({ commit, state }, payload) {
    const data = {
      task_type_id: payload.task_type_id,
      type: payload.type
    }
    tasksApi.createTasks(data, (err, tasks) => {
      if (!err) {
        commit(CREATE_TASKS_END, tasks)
      }
      if (payload.callback) payload.callback(err, tasks)
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
    Object.assign(task, {
      project_name: task.project.name,
      task_status_name: task.task_status.name,
      task_status_short_name: task.task_status.short_name,
      task_type_name: task.task_type.name,
      task_status_color: task.task_status.color,
      task_type_color: task.task_type.color
    })
    if (task.entity_type.name === 'Shot') {
      task.entity_name = `${task.entity_parent.name} / ${task.entity.name}`
    } else {
      task.entity_name = `${task.entity_type.name} / ${task.entity.name}`
    }
    state.taskMap[task.id] = task
  },

  [LOAD_TASK_COMMENTS_END] (state, {taskId, comments}) {
    state.taskComments[taskId] = comments
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatuses) {
    state.taskStatuses = sortByName(taskStatuses)
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
    if (!state.taskComments[taskId]) state.taskComments[taskId] = []
    state.taskComments[taskId].unshift(comment)

    Object.assign(state.taskMap[taskId], {
      task_status_id: comment.task_status_id,
      task_status_name: comment.task_status.name,
      task_status_short_name: comment.task_status.short_name,
      task_status_color: comment.task_status.color
    })
  },

  [CREATE_TASKS_END] (state, shots) {},

  [RESET_ALL] (state, shots) {
    state.taskMap = {}
    state.taskStatuses = []
    state.taskComments = {}
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

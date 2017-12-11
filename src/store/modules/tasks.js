import async from 'async'

import tasksApi from '../api/tasks'
import { sortByName } from '../../lib/sorting'
import personStore from './people'

import {
  LOAD_ASSETS_END,
  LOAD_SHOTS_END,

  LOAD_TASK_END,
  LOAD_TASK_STATUSES_END,
  LOAD_TASK_COMMENTS_END,

  NEW_TASK_COMMENT_END,

  CREATE_TASKS_END,
  DELETE_TASK_END,

  PREVIEW_FILE_SELECTED,
  ADD_PREVIEW_END,

  ADD_SELECTED_TASK,
  REMOVE_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,
  ASSIGN_TASKS,
  UNASSIGN_TASKS,

  SET_PREVIEW,

  RESET_ALL
} from '../mutation-types'

const state = {
  taskMap: {},
  taskStatuses: [],
  taskComments: {},
  taskPreviews: {},
  selectedTasks: {},
  selectedValidations: {},
  nbSelectedTasks: 0,

  previewFormData: null
}

const getters = {
  getTask: (state, getters) => (id) => {
    return state.taskMap[id]
  },

  getTaskComments: (state, getters) => (id) => {
    return state.taskComments[id]
  },

  getTaskPreviews: (state, getters) => (id) => {
    return state.taskPreviews[id]
  },

  getTaskComment: (state, getters) => (taskId, commentId) => {
    return state.taskComments[taskId].find(
      (comment) => comment.id === commentId
    )
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
  }),

  selectedTasks: state => state.selectedTasks,
  nbSelectedTasks: state => state.nbSelectedTasks
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

  loadComment ({ commit, state }, payload) {
    tasksApi.getTaskComment(payload, (err, comment) => {
      if (!err) {
        commit(NEW_TASK_COMMENT_END, {comment, taskId: comment.object_id})
      }
      if (payload.callback) payload.callback(err, comment)
    })
  },

  createTasks ({ commit, state }, payload) {
    const data = {
      task_type_id: payload.task_type_id,
      type: payload.type,
      project_id: payload.project_id
    }
    tasksApi.createTasks(data, (err, tasks) => {
      if (!err) {
        commit(CREATE_TASKS_END, tasks)
      }
      if (payload.callback) payload.callback(err, tasks)
    })
  },

  createSelectedTasks ({ commit, state }, {type, project_id, callback}) {
    async.eachSeries(Object.keys(state.selectedValidations), (key, next) => {
      const validationInfo = state.selectedValidations[key]
      const data = {
        entity_id: validationInfo.entity.id,
        task_type_id: validationInfo.column.id,
        type: type,
        project_id: project_id
      }
      tasksApi.createTask(data, (err, tasks) => {
        commit(CREATE_TASKS_END, tasks)
        next(err, tasks[0])
      })
    }, callback)
  },

  deleteTask ({ commit, state }, payload) {
    const task = payload.task
    tasksApi.deleteTask(task, (err) => {
      if (!err) {
        commit(DELETE_TASK_END, task)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  addPreview ({ commit, state }, payload) {
    payload.isMovie =
      state.previewFormData.get('file').name.indexOf('.mp4') > 0
    tasksApi.addPreview(payload, (err, preview) => {
      if (err && payload.callback) {
        payload.callback(err)
      } else {
        tasksApi.uploadPreview(preview.id, state.previewFormData, (err) => {
          if (!err) {
            commit(ADD_PREVIEW_END, {
              preview,
              taskId: payload.taskId,
              commentId: payload.commentId
            })
          }
          if (payload.callback) {
            payload.callback(err, preview)
          }
        })
      }
    })
  },

  setPreview ({ commit, state }, {taskId, entityId, previewId, callback}) {
    tasksApi.setPreview(entityId, previewId, (err, entity) => {
      if (err && callback) {
        callback(err)
      } else if (callback) {
        commit(SET_PREVIEW, {taskId, previewId})
        callback(err, entity)
      }
    })
  },

  assignSelectedTasks ({ commit, state }, { personId, callback }) {
    const selectedTaskIds = Object.keys(state.selectedTasks)
    tasksApi.assignTasks(personId, selectedTaskIds, (err) => {
      if (!err) commit(ASSIGN_TASKS, { selectedTaskIds, personId })
      if (callback) callback(err)
    })
  },

  unassignSelectedTasks ({ commit, state }, { personId, callback }) {
    const selectedTaskIds = Object.keys(state.selectedTasks)
    tasksApi.unassignTasks(selectedTaskIds, (err) => {
      if (!err) commit(UNASSIGN_TASKS, selectedTaskIds)
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
        task.entity_type_name = asset.entity_type_name
        task.entity = {
          id: asset.id,
          preview_file_id: asset.preview_file_id
        }
        state.taskMap[task.id] = task
      })
    })
  },

  [LOAD_SHOTS_END] (state, shots) {
    shots.forEach((shot) => {
      shot.tasks.forEach((task) => {
        task.project_name = shot.project_name
        if (shot.episode_name) {
          task.entity_name = `${shot.episode_name} / ${shot.sequence_name} / ${shot.name}`
        } else {
          task.entity_name = `${shot.sequence_name} / ${shot.name}`
        }
        task.entity_type_name = 'Shot'
        task.entity = {
          id: shot.id,
          preview_file_id: shot.preview_file_id
        }
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
      task_type_color: task.task_type.color,
      entity_type_name: task.entity_type.name
    })
    if (task.entity_type.name === 'Shot') {
      if (task.episode) {
        task.entity_name = `${task.episode.name} / ${task.sequence.name} / ${task.entity.name}`
      } else {
        task.entity_name = `${task.sequence.name} / ${task.entity.name}`
      }
    } else {
      task.entity_name = `${task.entity_type.name} / ${task.entity.name}`
    }
    state.taskMap[task.id] = task
  },

  [LOAD_TASK_COMMENTS_END] (state, {taskId, comments}) {
    state.taskComments[taskId] = comments
    state.taskPreviews[taskId] = comments.reduce((previews, comment) => {
      if (comment.preview) {
        if (comment.task_status.short_name === 'retake') {
          comment.preview.feedback = true
        } else {
          comment.preview.feedback = false
        }
        previews.push(comment.preview)
      }
      return previews
    }, [])
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatuses) {
    state.taskStatuses = sortByName(taskStatuses)
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
    if (comment.task_status === undefined) {
      const getTaskStatus = getters.getTaskStatus(state, getters)
      comment.task_status = getTaskStatus(comment.task_status_id)
    }

    if (comment.person === undefined) {
      const getPerson = personStore.getters.getPerson(
        personStore.state, personStore.getters
      )
      comment.person = getPerson(comment.person_id)
    }

    if (!state.taskComments[taskId]) state.taskComments[taskId] = []
    if (!state.taskComments[taskId].find((cmt) => cmt.id === comment.id)) {
      state.taskComments[taskId].unshift(comment)
    }

    Object.assign(state.taskMap[taskId], {
      task_status_id: comment.task_status_id,
      task_status_name: comment.task_status.name,
      task_status_short_name: comment.task_status.short_name,
      task_status_color: comment.task_status.color
    })
  },

  [DELETE_TASK_END] (state, task) {
    state.taskComments[task.id] = undefined
    state.taskPreviews[task.id] = undefined
    state.taskMap[task.id] = undefined
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      state.taskMap[task.id] = task
    })
  },

  [PREVIEW_FILE_SELECTED] (state, formData) {
    state.previewFormData = formData
  },
  [ADD_PREVIEW_END] (state, {preview, taskId, commentId}) {
    const getTaskComment = getters.getTaskComment(state, getters)
    const comment =
      JSON.parse(JSON.stringify(getTaskComment(taskId, commentId)))
    if (!comment.preview) {
      const newPreview = {
        id: preview.id,
        feedback: false,
        revision: preview.revision,
        is_movie: preview.is_movie
      }
      state.taskPreviews[taskId] =
        [newPreview].concat(state.taskPreviews[taskId])
      comment.preview = newPreview
      state.taskComments[taskId].shift()
      state.taskComments[taskId] =
        [comment].concat(state.taskComments[taskId])
    }
  },

  [ADD_SELECTED_TASK] (state, validationInfo) {
    if (validationInfo.task) {
      state.selectedTasks[validationInfo.task.id] = validationInfo.task
      state.nbSelectedTasks = Object.keys(state.selectedTasks).length
    } else {
      console.log(validationInfo)
      const taskTypeId = validationInfo.column.id
      const entityId = validationInfo.entity.id
      const validationKey = `${entityId}-${taskTypeId}`
      state.selectedValidations[validationKey] = validationInfo
    }
  },

  [REMOVE_SELECTED_TASK] (state, validationInfo) {
    if (validationInfo.task) {
      delete state.selectedTasks[validationInfo.task.id]
      state.nbSelectedTasks = Object.keys(state.selectedTasks).length
    } else {
      const taskTypeId = validationInfo.column.id
      const entityId = validationInfo.entity.id
      const validationKey = `${entityId}-${taskTypeId}`
      delete state.selectedValidations[validationKey]
    }
  },

  [CLEAR_SELECTED_TASKS] (state, task) {
    state.selectedTasks = {}
    state.nbSelectedTasks = 0
  },

  [ASSIGN_TASKS] (state, { selectedTaskIds, personId }) {
    selectedTaskIds.forEach((taskId) => {
      const task = state.taskMap[taskId]
      if (!task.assignees.find((assigneeId) => assigneeId === personId)) {
        task.assignees.push(personId)
      }
    })
  },
  [UNASSIGN_TASKS] (state, selectedTaskIds) {
    selectedTaskIds.forEach((taskId) => {
      const task = state.taskMap[taskId]
      task.assignees = []
    })
  },

  [SET_PREVIEW] (state, {taskId, previewId}) {
    state.taskMap[taskId].entity.preview_file_id = previewId
  },

  [RESET_ALL] (state, shots) {
    state.taskMap = {}
    state.taskStatuses = []
    state.taskComments = {}
    state.taskPreviews = {}
    state.selectedTasks = {}
    state.selectedValidations = {}
    state.previewFormData = null
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

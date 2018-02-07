import async from 'async'

import tasksApi from '../api/tasks'
import { sortByName, sortValidationColumns } from '../../lib/sorting'
import personStore from './people'
import taskTypeStore from './tasktypes'

import {
  LOAD_ASSETS_START,
  LOAD_SHOTS_START,
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

  LOAD_PERSON_TASKS_END,
  USER_LOAD_TODOS_END,

  RESET_ALL
} from '../mutation-types'

const state = {
  taskMap: {},
  taskStatusMap: {},
  assetValidationColumns: [],
  shotValidationColumns: [],

  taskStatuses: [],
  taskComments: {},
  taskPreviews: {},
  selectedTasks: {},
  selectedValidations: {},
  nbSelectedTasks: 0,
  nbSelectedValidations: 0,

  previewFormData: null
}

const helpers = {
  getPerson (personId) {
    return personStore.getters.getPerson(
      personStore.state, personStore.getters
    )(personId)
  },

  getTaskType (taskTypeId) {
    return taskTypeStore.state.taskTypeMap[taskTypeId]
  }
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
  nbSelectedTasks: state => state.nbSelectedTasks,
  nbSelectedValidations: state => state.nbSelectedValidations,

  assetValidationColumns: (state) => {
    return sortValidationColumns(Object.values(state.assetValidationColumns))
  },

  shotValidationColumns: (state) => {
    return sortValidationColumns(Object.values(state.shotValidationColumns))
  }
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

  commentTask ({ commit, state }, {taskId, taskStatusId, comment, callback}) {
    tasksApi.commentTask({taskId, taskStatusId, comment}, (err, comment) => {
      if (!err) {
        commit(NEW_TASK_COMMENT_END, {comment, taskId})
      }
      if (callback) callback(err, comment)
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
      if (payload.callback) payload.callback(err, tasks)
    })
  },

  createSelectedTasks ({ commit, state }, {type, projectId, callback}) {
    async.eachSeries(Object.keys(state.selectedValidations), (key, next) => {
      const validationInfo = state.selectedValidations[key]
      const data = {
        entity_id: validationInfo.entity.id,
        task_type_id: validationInfo.column.id,
        type: type,
        project_id: projectId
      }
      tasksApi.createTask(data, (err, tasks) => {
        commit(CREATE_TASKS_END, tasks)
        tasks.forEach((task) => {
          commit(REMOVE_SELECTED_TASK, validationInfo)
          task.assigneesInfo = []
          validationInfo.task = task
          commit(ADD_SELECTED_TASK, validationInfo)
        })
        next(err, tasks[0])
      })
    }, callback)
  },

  changeSelectedTaskStatus ({ commit, state }, {taskStatusId, callback}) {
    async.eachSeries(Object.keys(state.selectedTasks), (taskId, next) => {
      const task = state.taskMap[taskId]

      if (task && task.task_status_id !== taskStatusId) {
        actions.commentTask({ commit, state }, {
          taskId: taskId,
          taskStatusId: taskStatusId,
          comment: '',
          callback: (err) => {
            next(err)
          }
        })
      } else {
        next()
      }
    }, (err) => {
      commit(CLEAR_SELECTED_TASKS)
      callback(err)
    })
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
    const fileName = state.previewFormData.get('file').name
    const extension = fileName.slice(fileName.length - 4)
    payload.isMovie = ['.mp4', '.mov'].includes(extension)

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
        commit(SET_PREVIEW, {taskId, entityId, previewId})
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
  },

  clearSelectedTasks ({ commit, state }) {
    commit(CLEAR_SELECTED_TASKS)
  }
}

const mutations = {
  [LOAD_ASSETS_START] (state, assets) {
    state.assetValidationColumns = {}
    state.taskMap = {}
  },

  [LOAD_ASSETS_END] (state, assets) {
    const validationColumns = {}
    assets.forEach((asset) => {
      asset.validations = {}
      asset.tasks.forEach((task) => {
        const taskStatus = state.taskStatusMap[task.task_status_id]
        const taskType = helpers.getTaskType(task.task_type_id)

        Object.assign(task, {
          task_status_name: taskStatus.name,
          task_status_short_name: taskStatus.short_name,
          task_status_color: taskStatus.color,

          task_type_name: taskType.name,
          task_type_color: taskType.color,
          task_type_priority: taskType.priority,

          project_name: asset.project_name,

          entity_name: `${asset.asset_type_name} / ${asset.name}`,
          entity_type_name: asset.entity_type_name,
          entity: {
            id: asset.id,
            preview_file_id: asset.preview_file_id
          },

          assigneesInfo: task.assignees.map(helpers.getPerson)
        })

        if (!validationColumns[task.task_type_name]) {
          validationColumns[task.task_type_name] = {
            id: task.task_type_id,
            name: task.task_type_name,
            color: task.task_type_color,
            priority: task.task_type_priority
          }
        }

        asset.validations[task.task_type_name] = task
        state.taskMap[task.id] = task
      })
    })
    state.assetValidationColumns = validationColumns
  },

  [LOAD_SHOTS_START] (state, assets) {
    state.shotValidationColumns = {}
    state.taskMap = {}
  },

  [LOAD_SHOTS_END] (state, shots) {
    const validationColumns = {}
    shots.forEach((shot) => {
      shot.validations = {}
      shot.tasks.forEach((task) => {
        const taskStatus = state.taskStatusMap[task.task_status_id]
        const taskType = helpers.getTaskType(task.task_type_id)

        Object.assign(task, {
          task_status_name: taskStatus.name,
          task_status_short_name: taskStatus.short_name,
          task_status_color: taskStatus.color,

          task_type_name: taskType.name,
          task_type_color: taskType.color,
          task_type_priority: taskType.priority,

          project_name: shot.project_name,

          entity_type_name: shot.entity_type_name,
          entity: {
            id: shot.id,
            preview_file_id: shot.preview_file_id
          },

          assigneesInfo: task.assignees.map(helpers.getPerson)
        })

        if (shot.episode_name) {
          task.entity_name = `${shot.episode_name} / ${shot.sequence_name} / ${shot.name}`
        } else {
          task.entity_name = `${shot.sequence_name} / ${shot.name}`
        }

        if (!validationColumns[task.task_type_name]) {
          validationColumns[task.task_type_name] = {
            id: task.task_type_id,
            name: task.task_type_name,
            color: task.task_type_color,
            priority: task.task_type_priority
          }
        }

        shot.validations[task.task_type_name] = task
        state.taskMap[task.id] = task
      })
    })
    state.shotValidationColumns = validationColumns
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
    comments.forEach((comment) => {
      comment.person = personStore.helpers.addAdditionalInformation(
        comment.person
      )
    })
    state.taskComments[taskId] = comments
    state.taskPreviews[taskId] = comments.reduce((previews, comment) => {
      if (comment.preview) {
        previews.push(comment.preview)
      }
      return previews
    }, [])
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatuses) {
    state.taskStatuses = sortByName(taskStatuses)
    state.taskStatuses.forEach((taskStatus) => {
      state.taskStatusMap[taskStatus.id] = taskStatus
    })
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
    const task = state.taskMap[taskId]
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

    comment.person = personStore.helpers.addAdditionalInformation(
      comment.person
    )

    if (!state.taskComments[taskId]) state.taskComments[taskId] = []
    if (!state.taskComments[taskId].find((cmt) => cmt.id === comment.id)) {
      state.taskComments[taskId].unshift(comment)
    }

    Object.assign(task, {
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
      const taskTypeId = validationInfo.column.id
      const entityId = validationInfo.entity.id
      const validationKey = `${entityId}-${taskTypeId}`
      state.selectedValidations[validationKey] = validationInfo
      state.nbSelectedValidations = Object.keys(state.selectedValidations).length
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
      state.nbSelectedValidations = Object.keys(state.selectedValidations).length
    }
  },

  [CLEAR_SELECTED_TASKS] (state, task) {
    state.selectedTasks = {}
    state.nbSelectedTasks = 0
    state.selectedValidations = {}
    state.nbSelectedValidations = 0
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      state.taskMap[task.id] = task
    })
  },

  [ASSIGN_TASKS] (state, { selectedTaskIds, personId }) {
    selectedTaskIds.forEach((taskId) => {
      const task = state.taskMap[taskId]
      if (task &&
          !task.assignees.find((assigneeId) => assigneeId === personId)) {
        task.assignees.push(personId)
      }
    })
  },
  [UNASSIGN_TASKS] (state, selectedTaskIds) {
    selectedTaskIds.forEach((taskId) => {
      const task = state.taskMap[taskId]
      task.assignees = []
      task.assigneesInfo = []
    })
  },

  [SET_PREVIEW] (state, {taskId, previewId}) {
    state.taskMap[taskId].entity.preview_file_id = previewId
  },

  [LOAD_PERSON_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }

      state.taskMap[task.id] = task
    })
  },

  [USER_LOAD_TODOS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }

      state.taskMap[task.id] = task
    })
  },

  [RESET_ALL] (state, shots) {
    state.taskMap = {}
    state.taskStatusMap = {}

    state.taskStatuses = []
    state.taskComments = {}

    state.taskPreviews = {}
    state.selectedTasks = {}
    state.selectedValidations = {}
    state.nbSelectedTasks = 0
    state.nbSelectedValidations = 0
    state.previewFormData = null
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

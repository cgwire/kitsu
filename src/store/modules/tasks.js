import async from 'async'

import tasksApi from '../api/tasks'
import playlistsApi from '../api/playlists'
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
  LOAD_TASK_ENTITY_PREVIEW_FILES_END,
  LOAD_TASK_SUBSCRIBE_END,
  LOAD_SEQUENCE_SUBSCRIBE_END,

  NEW_TASK_COMMENT_END,
  NEW_TASK_END,
  EDIT_TASK_END,

  CREATE_TASKS_END,
  DELETE_TASK_END,
  EDIT_COMMENT_END,
  DELETE_COMMENT_END,

  PREVIEW_FILE_SELECTED,
  ADD_PREVIEW_END,
  CHANGE_PREVIEW_END,
  UPDATE_PREVIEW_ANNOTATION,

  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  REMOVE_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,
  ASSIGN_TASKS,
  UNASSIGN_TASKS,

  SET_PREVIEW,
  SET_IS_SHOW_ASSIGNATIONS,
  DELETE_PREVIEW_END,

  LOAD_PERSON_TASKS_END,
  USER_LOAD_TODOS_END,

  SET_CURRENT_PRODUCTION,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  taskMap: {},
  taskStatusMap: {},
  assetValidationColumns: [],
  shotValidationColumns: [],

  taskStatuses: [],
  taskComments: {},
  taskPreviews: {},
  taskEntityPreviews: {},
  selectedTasks: {},
  selectedValidations: {},

  nbSelectedTasks: 0,
  nbSelectedValidations: 0,
  isShowAssignations: true,

  previewFormData: null
}

const state = {
  ...initialState
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
  taskMap: (state) => state.taskMap,
  getTaskComments: (state, getters) => (id) => state.taskComments[id],
  getTaskPreviews: (state, getters) => (id) => state.taskPreviews[id],

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
      color: status.color,
      isArtistAllowed: status.is_artist_allowed
    }
  }),

  selectedTasks: state => state.selectedTasks,
  nbSelectedTasks: state => state.nbSelectedTasks,
  nbSelectedValidations: state => state.nbSelectedValidations,
  isShowAssignations: state => state.isShowAssignations,
  taskEntityPreviews: state => state.taskEntityPreviews,
  previewFormData: state => state.previewFormData,

  assetValidationColumns: (state, getters) => {
    return sortValidationColumns(
      Object.values(state.assetValidationColumns), getters.taskTypeMap
    )
  },

  shotValidationColumns: (state, getters) => {
    return sortValidationColumns(
      Object.values(state.shotValidationColumns), getters.taskTypeMap
    )
  }
}

const actions = {
  loadTaskStatuses ({ commit, state }, callback) {
    tasksApi.getTaskStatuses((err, taskStatus) => {
      if (!err) commit(LOAD_TASK_STATUSES_END, taskStatus)
      if (callback) callback(err)
    })
  },

  loadTask ({ commit, state }, { taskId, callback }) {
    tasksApi.getTask(taskId, (err, task) => {
      if (!err) {
        commit(LOAD_TASK_END, task)
      }
      if (callback) callback(err, task)
    })
  },

  loadTaskSubscribed ({ commit, state }, { taskId, callback }) {
    tasksApi.getTaskSubscribed(taskId, (err, subscribed) => {
      if (!err) {
        commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed })
      }
      if (callback) callback(err, subscribed)
    })
  },

  subscribeToTask ({ commit, state }, taskId) {
    return new Promise((resolve, reject) => {
      tasksApi.subscribeToTask(taskId, (err) => {
        if (err) {
          reject(err)
        } else {
          commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed: true })
          resolve()
        }
      })
    })
  },

  subscribeToSequence ({ commit, state }, { sequenceId, taskTypeId }) {
    return new Promise((resolve, reject) => {
      tasksApi.subscribeToSequence(sequenceId, taskTypeId, (err) => {
        if (err) {
          reject(err)
        } else {
          commit(LOAD_SEQUENCE_SUBSCRIBE_END, {
            sequenceId,
            taskTypeId,
            subscribed: true
          })
          resolve()
        }
      })
    })
  },

  unsubscribeFromTask ({ commit, state }, taskId) {
    return new Promise((resolve, reject) => {
      tasksApi.unsubscribeFromTask(taskId, (err) => {
        if (err) {
          reject(err)
        } else {
          commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed: false })
          resolve()
        }
      })
    })
  },

  unsubscribeFromSequence ({ commit, state }, { sequenceId, taskTypeId }) {
    return new Promise((resolve, reject) => {
      tasksApi.unsubscribeFromSequence(sequenceId, taskTypeId, (err) => {
        if (err) {
          reject(err)
        } else {
          commit(LOAD_SEQUENCE_SUBSCRIBE_END, {
            sequenceId,
            taskTypeId,
            subscribed: false
          })
          resolve()
        }
      })
    })
  },

  loadTaskComments (
    { commit, state, dispatch },
    { taskId, entityId, callback }
  ) {
    tasksApi.getTaskComments(taskId, (err, comments) => {
      if (err) {
        callback(err)
      } else {
        commit(LOAD_TASK_COMMENTS_END, {comments, taskId})
        dispatch('loadTaskEntityPreviewFiles', { callback, entityId })
      }
    })
  },

  loadTaskEntityPreviewFiles ({ commit, state }, { callback, entityId }) {
    const entity = {id: entityId}
    playlistsApi.getEntityPreviewFiles(entity, (err, previewFiles) => {
      commit(LOAD_TASK_ENTITY_PREVIEW_FILES_END, previewFiles)
      if (callback) callback(err)
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

  loadComment ({ commit, state }, {commentId, callback}) {
    tasksApi.getTaskComment({id: commentId}, (err, comment) => {
      if (!err) {
        commit(NEW_TASK_COMMENT_END, {comment, taskId: comment.object_id})
      }
      if (callback) callback(err, comment)
    })
  },

  createTasks (
    { commit, state },
    payload
  ) {
    const data = {
      task_type_id: payload.task_type_id,
      type: payload.type,
      project_id: payload.project_id
    }
    tasksApi.createTasks(data, (err, tasks) => {
      if (payload.callback) payload.callback(err, tasks)
    })
  },

  createSelectedTasks (
    { commit, state },
    { type, projectId, callback }
  ) {
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

  deleteSelectedTasks ({ commit, state }) {
    return new Promise((resolve, reject) => {
      const selectedTaskIds = Object.keys(state.selectedTasks)
      async.eachSeries(selectedTaskIds, (taskId, next) => {
        const task = state.taskMap[taskId]
        tasksApi.deleteTask(task, (err) => {
          if (!err) commit(DELETE_TASK_END, task)
          next(err)
        })
      }, (err) => {
        if (err) reject(err)
        else {
          resolve()
        }
      })
    })
  },

  deleteAllTasks ({ commit, state }, { projectId, taskTypeId }) {
    return new Promise((resolve, reject) => {
      tasksApi.deleteAllTasks(projectId, taskTypeId, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  },

  createTask (
    { commit, state, rootGetters },
    { entityId, projectId, taskTypeId, type }
  ) {
    return new Promise((resolve, reject) => {
      const data = {
        entity_id: entityId,
        task_type_id: taskTypeId,
        type: type,
        project_id: projectId
      }
      tasksApi.createTask(data, (err, tasks) => {
        if (err) {
          reject(err)
        } else {
          commit(NEW_TASK_END, tasks[0])
          resolve()
        }
      })
    })
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

  changeSelectedPriorities (
    { commit, state, rootGetters },
    { priority, callback }
  ) {
    async.eachSeries(Object.keys(state.selectedTasks), (taskId, next) => {
      const task = state.taskMap[taskId]
      const taskType = rootGetters.taskTypeMap[task.task_type_id]

      if (task && task.priority !== priority) {
        tasksApi.updateTask(taskId, { priority }, (err, task) => {
          if (!err) {
            commit(EDIT_TASK_END, { task, taskType })
          }
          next(err)
        })
      } else {
        next()
      }
    }, (err) => {
      callback(err)
    })
  },

  getTask ({ commit, rootGetters }, { taskId, callback }) {
    tasksApi.getTask(taskId, (err, task) => {
      if (!err) {
        const taskType = rootGetters.taskTypeMap[task.task_type_id]
        commit(EDIT_TASK_END, { task, taskType })
      }
      if (callback) callback(err)
    })
  },

  deleteTask ({ commit }, { task, callback }) {
    tasksApi.deleteTask(task, (err) => {
      if (!err) {
        commit(DELETE_TASK_END, task)
      }
      if (callback) callback(err)
    })
  },

  editTaskComment ({ commit }, { taskId, comment, callback }) {
    tasksApi.editTaskComment(comment, (err, comment) => {
      if (!err) {
        commit(EDIT_COMMENT_END, { taskId, comment })
      }
      if (callback) callback(err)
    })
  },

  deleteTaskComment ({ commit, rootState }, { taskId, commentId, callback }) {
    const todoStatus = rootState.taskStatus.taskStatus.find((taskStatus) => {
      return taskStatus.short_name === 'todo'
    })
    tasksApi.deleteTaskComment(taskId, commentId, (err) => {
      if (!err) {
        commit(DELETE_COMMENT_END, {
          commentId,
          taskId,
          taskStatusMap: rootState.taskStatus.taskStatusMap,
          todoStatus
        })
      }
      if (callback) callback(err)
    })
  },

  addCommentPreview (
    { commit, getters, state },
    { taskId, commentId, callback }
  ) {
    const fileName = state.previewFormData.get('file').name
    const previewData = {
      taskId,
      commentId
    }

    tasksApi.addPreview(previewData, (err, preview) => {
      if (err && callback) {
        callback(err)
      } else {
        tasksApi.uploadPreview(preview.id, state.previewFormData, (err) => {
          if (!err) {
            const comment = getters.getTaskComment(taskId, commentId)
            const extension = fileName.slice(fileName.length - 3)
            if (extension.startsWith('.')) {
              preview.extension = extension.substring(1)
            } else {
              preview.extension = extension
            }
            commit(ADD_PREVIEW_END, {
              preview,
              taskId,
              commentId,
              comment
            })
          }
          if (callback) callback(err, preview)
        })
      }
    })
  },

  addCommentExtraPreview (
    { commit, getters, state },
    { taskId, commentId, previewId, callback }
  ) {
    tasksApi.addExtraPreview(previewId, taskId, commentId, (err, preview) => {
      if (err && callback) {
        callback(err)
      } else {
        tasksApi.uploadPreview(preview.id, state.previewFormData, (err) => {
          if (!err) {
            const comment = getters.getTaskComment(taskId, commentId)
            preview.extension = 'png'
            commit(ADD_PREVIEW_END, {
              preview,
              taskId,
              commentId,
              comment
            })
          }
          if (callback) callback(err, preview)
        })
      }
    })
  },

  deleteTaskPreview ({ commit, state }, { taskId, commentId, previewId }) {
    return new Promise((resolve, reject) => {
      tasksApi.deletePreview(taskId, commentId, previewId)
        .then(() => {
          commit(DELETE_PREVIEW_END, { taskId, previewId })
          resolve()
        })
        .catch(reject)
    })
  },

  changeCommentPreview ({ commit, state }, {
    comment, preview, taskId, callback
  }) {
    const fileName = state.previewFormData.get('file').name
    const extension = fileName.slice(fileName.length - 4)
    preview.extension = extension

    tasksApi.uploadPreview(preview.id, state.previewFormData, (err) => {
      if (!err) {
        commit(CHANGE_PREVIEW_END, { comment, preview })
      }
      if (callback) callback(err, extension)
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

  updatePreviewAnnotation ({ commit, state }, {
    taskId, preview, annotations
  }) {
    return new Promise((resolve, reject) => {
      tasksApi.updatePreviewAnnotation(preview, annotations)
        .then((updatedPreview) => {
          commit(UPDATE_PREVIEW_ANNOTATION, {
            taskId,
            preview,
            annotations
          })
          resolve()
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
    })
  },

  refreshPreview ({ commit, state }, { taskId, previewId }) {
    return new Promise((resolve, reject) => {
      tasksApi.getPreviewFile(previewId)
        .then((preview) => {
          commit(UPDATE_PREVIEW_ANNOTATION, {
            taskId,
            preview,
            annotations: preview.annotations
          })
          resolve()
        })
        .catch(reject)
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

  showAssignations ({ commit, state }) {
    commit(SET_IS_SHOW_ASSIGNATIONS, true)
  },

  hideAssignations ({ commit, state }) {
    commit(SET_IS_SHOW_ASSIGNATIONS, false)
  },

  clearSelectedTasks ({ commit, state }) {
    commit(CLEAR_SELECTED_TASKS)
  },

  loadPreviewFileFormData ({ commit }, previewFormData) {
    commit('PREVIEW_FILE_SELECTED', previewFormData)
  }
}

const mutations = {
  [LOAD_ASSETS_START] (state, assets) {
    state.assetValidationColumns = []
  },

  [LOAD_ASSETS_END] (state, { assets, personMap }) {
    const validationColumns = {}
    assets.forEach((asset) => {
      asset.validations = {}
      asset.tasks.forEach((task) => {
        const taskType = helpers.getTaskType(task.task_type_id)
        if (!validationColumns[taskType.name]) {
          validationColumns[taskType.name] = task.task_type_id
        }

        if (task.assignees.length > 1) {
          task.assignees = task.assignees.sort((a, b) => {
            return personMap[a].name.localeCompare(personMap[b].name)
          })
        }

        asset.validations[task.task_type_id] = task.id
        task.episode_id = asset.source_id
        state.taskMap[task.id] = task
      })
      asset.tasks = asset.tasks.map((task) => {
        return task.id
      })
    })
    state.assetValidationColumns = validationColumns
  },

  [LOAD_SHOTS_START] (state, assets) {
    state.shotValidationColumns = {}
  },

  [LOAD_SHOTS_END] (state, { shots, personMap }) {
    const validationColumns = {}
    shots.forEach((shot) => {
      shot.validations = {}
      shot.tasks.forEach((task) => {
        const taskType = helpers.getTaskType(task.task_type_id)
        if (!validationColumns[taskType.name]) {
          validationColumns[taskType.name] = task.task_type_id
        }

        if (task.assignees.length > 1) {
          task.assignees = task.assignees.sort((a, b) => {
            return personMap[a].name.localeCompare(personMap[b])
          })
        }

        shot.validations[task.task_type_id] = task.id
        task.episode_id = shot.episode_id
        state.taskMap[task.id] = task
      })
      shot.tasks = shot.tasks.map((task) => {
        return task.id
      })
    })
    state.shotValidationColumns = validationColumns
  },

  [LOAD_TASK_END] (state, task) {
    Object.assign(task, {
      project_name: task.project.name,
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

  [LOAD_TASK_ENTITY_PREVIEW_FILES_END] (state, previewFiles) {
    state.taskEntityPreviews = previewFiles
  },

  [LOAD_TASK_COMMENTS_END] (state, {taskId, comments}) {
    comments.forEach((comment) => {
      comment.person = personStore.helpers.addAdditionalInformation(
        comment.person
      )
    })
    state.taskComments[taskId] = comments
    state.taskPreviews[taskId] = comments.reduce((previews, comment) => {
      if (comment.previews && comment.previews.length > 0) {
        const preview = comment.previews[0]
        preview.previews = comment.previews.map((p) => {
          return {
            id: p.id,
            annotations: p.annotations
          }
        })

        previews.push(preview)
        return previews
      } else {
        return previews
      }
    }, [])
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatuses) {
    state.taskStatuses = sortByName(taskStatuses)
    state.taskStatuses.forEach((taskStatus) => {
      state.taskStatusMap[taskStatus.id] = taskStatus
    })
  },

  [LOAD_TASK_SUBSCRIBE_END] (state, { taskId, subscribed }) {},

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

    if (task) {
      Object.assign(task, {
        task_status_id: comment.task_status_id,
        last_comment: comment
      })
    }
  },

  [DELETE_TASK_END] (state, task) {
    state.taskComments[task.id] = undefined
    state.taskPreviews[task.id] = undefined
    state.taskMap[task.id] = undefined
  },

  [DELETE_COMMENT_END] (state, {
    taskId,
    commentId,
    taskStatusMap,
    todoStatus
  }) {
    const task = state.taskMap[taskId]
    let newStatus = todoStatus
    state.taskComments[taskId] = [...state.taskComments[taskId]].splice(1)
    state.taskPreviews[taskId] = [...state.taskPreviews[taskId]].splice(1)

    if (state.taskComments[taskId].length > 0) {
      const newStatusId = state.taskComments[taskId][0].task_status_id
      newStatus = taskStatusMap[newStatusId]
    }

    Object.assign(task, {
      task_status_id: newStatus.id,
      task_status_priority: newStatus.priority
    })
  },

  [EDIT_COMMENT_END] (state, { taskId, comment }) {
    state.taskComments[taskId][0].text = comment.text
  },

  [PREVIEW_FILE_SELECTED] (state, formData) {
    state.previewFormData = formData
  },

  [ADD_PREVIEW_END] (state, { preview, taskId, commentId, comment }) {
    const newPreview = {
      id: preview.id,
      feedback: false,
      revision: preview.revision,
      extension: preview.extension
    }

    const existingPreview = state.taskPreviews[taskId].find(
      (p) => p.revision === preview.revision
    )

    if (existingPreview) {
      const existingSubPreview =
        existingPreview.previews.find((p) => p.id === newPreview.id)
      if (!existingSubPreview) {
        existingPreview.previews.push(newPreview)
      }
    } else {
      newPreview.previews = [{...newPreview}]
      state.taskPreviews[taskId] =
        [newPreview].concat(state.taskPreviews[taskId])

      comment.preview = newPreview
      comment.previews = [newPreview]
    }
  },

  [DELETE_PREVIEW_END] (state, { taskId, previewId }) {
    state.taskPreviews[taskId].forEach((p) => {
      const index =
        p.previews.findIndex((subPreview) => subPreview.id === previewId)
      if (index >= 0) {
        p.previews.splice(index, 1)
      }
    })
  },

  [UPDATE_PREVIEW_ANNOTATION] (state, { taskId, preview, annotations }) {
    let oldPreview = null
    state.taskPreviews[taskId].forEach((p) => {
      p.previews.forEach((subPreview) => {
        if (subPreview.id === preview.id) {
          oldPreview = subPreview
        }
      })

      if (p.id === preview.id) {
        preview.annotations = annotations
      }
    })

    if (oldPreview) {
      oldPreview.annotations = annotations
    }
  },

  [CHANGE_PREVIEW_END] (state, { preview, comment }) {
    const taskId = comment.object_id

    const newPreview = {
      id: preview.id,
      feedback: false,
      revision: preview.revision,
      extension: preview.extension
    }
    state.taskPreviews[taskId].shift()
    state.taskPreviews[taskId] =
      [newPreview].concat(state.taskPreviews[taskId])
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
      state.nbSelectedValidations =
        Object.keys(state.selectedValidations).length
    }
  },

  [ADD_SELECTED_TASKS] (state, selection) {
    const tmpSelectedTasks = JSON.parse(JSON.stringify(state.selectedTasks))
    const tmpSelectedValidations =
      JSON.parse(JSON.stringify(state.selectedValidations))
    let isValidationChanged = false
    selection.forEach((validationInfo) => {
      if (validationInfo.task) {
        tmpSelectedTasks[validationInfo.task.id] = validationInfo.task
      } else {
        const taskTypeId = validationInfo.column.id
        const entityId = validationInfo.entity.id
        const validationKey = `${entityId}-${taskTypeId}`
        tmpSelectedValidations[validationKey] = validationInfo
        isValidationChanged = true
      }
    })
    state.selectedTasks = tmpSelectedTasks
    state.nbSelectedTasks = Object.keys(state.selectedTasks).length
    if (isValidationChanged) {
      state.selectedValidations = tmpSelectedValidations
      state.nbSelectedValidations =
        Object.keys(state.selectedValidations).length
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

  [CLEAR_SELECTED_TASKS] (state) {
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

  [NEW_TASK_END] (state, task) {
    state.taskMap[task.id] = task
  },

  [EDIT_TASK_END] (state, { task }) {
    const currentTask = state.taskMap[task.id]
    if (currentTask) {
      state.taskMap[task.id].priority = task.priority
    }
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
    if (state.taskMap[taskId]) {
      state.taskMap[taskId].entity.preview_file_id = previewId
    }
  },

  [SET_IS_SHOW_ASSIGNATIONS] (state, isShowAssignations) {
    state.isShowAssignations = isShowAssignations
  },

  [LOAD_PERSON_TASKS_END] (state, { tasks }) {
    tasks.forEach((task) => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }
      state.taskMap[task.id] = task
    })
  },

  [USER_LOAD_TODOS_END] (state, { tasks }) {
    tasks.forEach((task) => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }

      state.taskMap[task.id] = task
    })
  },

  [SET_CURRENT_PRODUCTION] (state) {
    state.taskMap = {}
  },

  [RESET_ALL] (state, shots) {
    Object.assign(state, {...initialState})
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

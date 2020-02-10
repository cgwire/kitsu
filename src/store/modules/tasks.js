import async from 'async'

import tasksApi from '../api/tasks'
import peopleApi from '../api/people'
import playlistsApi from '../api/playlists'
import {
  sortComments,
  sortByName
} from '../../lib/sorting'
import personStore from './people'
import taskTypeStore from './tasktypes'

import {
  LOAD_ASSETS_END,
  LOAD_SHOTS_END,
  CLEAR_SHOTS,
  CLEAR_ASSETS,

  LOAD_TASK_END,
  LOAD_TASK_STATUSES_END,
  LOAD_TASK_COMMENTS_END,
  LOAD_TASK_ENTITY_PREVIEW_FILES_END,
  LOAD_TASK_SUBSCRIBE_END,
  LOAD_SEQUENCE_SUBSCRIBE_END,

  NEW_TASK_COMMENT_END,
  NEW_TASK_END,
  EDIT_TASK_END,
  EDIT_TASK_DATES,

  CREATE_TASKS_END,
  DELETE_TASK_END,
  EDIT_COMMENT_END,
  DELETE_COMMENT_END,
  PIN_COMMENT,

  PREVIEW_FILE_SELECTED,
  ADD_PREVIEW_START,
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
  SET_IS_SHOW_INFOS,
  DELETE_PREVIEW_END,

  LOAD_PERSON_TASKS_END,
  USER_LOAD_TODOS_END,

  SAVE_TASK_SEARCH_END,
  REMOVE_TASK_SEARCH_END,

  UPDATE_COMMENT_CHECKLIST,
  SET_LAST_COMMENT_DRAFT,

  REMOVE_FIRST_PREVIEW_FILE_TO_UPLOAD,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  taskMap: {},
  taskStatusMap: {},

  taskStatuses: [],
  taskComments: {},
  taskPreviews: {},
  taskEntityPreviews: {},
  selectedTasks: {},
  selectedValidations: {},
  taskSearchQueries: [],

  nbSelectedTasks: 0,
  nbSelectedValidations: 0,
  isShowAssignations: true,
  isShowInfos: true,

  isSavingCommentPreview: false,
  previewForms: [],

  lastCommentDraft: ''
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
    if (state.taskComments[taskId]) {
      return state.taskComments[taskId].find(
        (comment) => comment.id === commentId
      )
    } else {
      return []
    }
  },

  getTaskStatus: (state, getters) => (id) => {
    return state.taskStatuses.find(
      (taskStatus) => taskStatus.id === id
    )
  },

  taskStatusOptions: state => state.taskStatuses.map((status) => {
    return {
      label: status.short_name,
      value: status.id,
      color: status.color,
      isArtistAllowed: status.is_artist_allowed
    }
  }),

  selectedTasks: state => state.selectedTasks,
  nbSelectedTasks: state => state.nbSelectedTasks,
  nbSelectedValidations: state => state.nbSelectedValidations,
  taskSearchQueries: state => state.taskSearchQueries,
  isShowAssignations: state => state.isShowAssignations,
  isShowInfos: state => state.isShowInfos,
  taskEntityPreviews: state => state.taskEntityPreviews,
  previewForms: state => state.previewForms,
  isSavingCommentPreview: state => state.isSavingCommentPreview,
  lastCommentDraft: state => state.lastCommentDraft
}

const actions = {
  loadTask ({ commit, state }, { taskId, callback }) {
    tasksApi.getTask(taskId, (err, task) => {
      if (!err) {
        commit(LOAD_TASK_END, task)
      } else {
        console.error(err)
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
        commit(LOAD_TASK_COMMENTS_END, { comments, taskId })
        dispatch('loadTaskEntityPreviewFiles', { callback, entityId })
      }
    })
  },

  loadTaskEntityPreviewFiles ({ commit, state }, { callback, entityId }) {
    const entity = { id: entityId }
    playlistsApi.getEntityPreviewFiles(entity, (err, previewFiles) => {
      commit(LOAD_TASK_ENTITY_PREVIEW_FILES_END, previewFiles)
      if (callback) callback(err)
    })
  },

  commentTask ({ commit, state }, { taskId, taskStatusId, comment }) {
    return tasksApi.commentTask({ taskId, taskStatusId, comment })
      .then((comment) => {
        commit(NEW_TASK_COMMENT_END, { comment, taskId })
      })
  },

  loadComment ({ commit, state }, { commentId, callback }) {
    tasksApi.getTaskComment({ id: commentId }, (err, comment) => {
      if (!err) {
        commit(NEW_TASK_COMMENT_END, { comment, taskId: comment.object_id })
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

  changeSelectedTaskStatus ({ commit, state }, {
    taskStatusId,
    comment,
    callback
  }) {
    async.eachSeries(Object.keys(state.selectedTasks), (taskId, next) => {
      const task = state.taskMap[taskId]
      if (task && task.task_status_id !== taskStatusId) {
        actions.commentTask({ commit, state }, {
          taskId: taskId,
          taskStatusId: taskStatusId,
          comment: comment || ''
        })
          .then(next)
          .catch((err) => next(err))
      } else {
        next()
      }
    }, (err) => {
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

  updateTask ({ commit }, { taskId, data }) {
    return tasksApi.updateTask(taskId, data, () => {
      commit(EDIT_TASK_DATES, { taskId, data })
    })
  },

  changeSelectedEstimations ({ commit, state, rootGetters }, estimation) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Object.keys(state.selectedTasks), (taskId, next) => {
        const task = state.taskMap[taskId]
        const taskType = rootGetters.taskTypeMap[task.task_type_id]
        if (task && task.estimation !== estimation) {
          tasksApi.updateTask(taskId, { estimation }, (err, task) => {
            if (!err) commit(EDIT_TASK_END, { task, taskType })
            next(err)
          })
        } else {
          next()
        }
      }, (err) => {
        if (err) reject(err)
        else resolve()
      })
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

  editTaskComment ({ commit }, { taskId, comment, checklist, callback }) {
    if (checklist) {
      commit(UPDATE_COMMENT_CHECKLIST, { taskId, comment, checklist })
    }
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

  commentTaskWithPreview (
    { commit, getters, state, dispatch },
    { taskId, commentText, taskStatusId, form }
  ) {
    const data = { taskId, taskStatusId, comment: commentText }
    commit(ADD_PREVIEW_START)
    let newComment
    return tasksApi.commentTask(data)
      .then((comment) => {
        newComment = comment
        const previewData = {
          taskId,
          commentId: newComment.id
        }
        return tasksApi.addPreview(previewData)
      }).then((preview) => {
        if (!form) form = state.previewForms[0]
        return tasksApi.uploadPreview(preview.id, form)
      }).then((preview) => {
        commit(NEW_TASK_COMMENT_END, { comment: newComment, taskId })
        commit(ADD_PREVIEW_END, {
          preview,
          taskId,
          commentId: newComment.id,
          comment: newComment
        })
        if (state.previewForms.length > 1) {
          commit(REMOVE_FIRST_PREVIEW_FILE_TO_UPLOAD)
          dispatch('addCommentExtraPreview', {
            taskId,
            commentId: newComment.id,
            previewId: preview.id
          })
        }
        return Promise.resolve({ newComment, preview })
      })
  },

  addCommentExtraPreview (
    { commit, getters, state },
    { taskId, commentId, previewId }
  ) {
    const addPreview = (form) => {
      return tasksApi
        .addExtraPreview(previewId, taskId, commentId)
        .then((preview) => {
          return tasksApi.uploadPreview(preview.id, form)
        })
        .then((preview) => {
          const comment = getters.getTaskComment(taskId, commentId)
          preview.extension = 'png'
          commit(ADD_PREVIEW_END, {
            preview,
            taskId,
            commentId,
            comment
          })
        })
    }
    state.previewForms.reduce((accumulatorPromise, form) => {
      return accumulatorPromise.then(() => {
        return addPreview(form)
      })
    }, Promise.resolve())
  },

  deleteTaskPreview ({ commit, state }, { taskId, commentId, previewId }) {
    return tasksApi.deletePreview(taskId, commentId, previewId)
      .then(() => {
        commit(DELETE_PREVIEW_END, { taskId, previewId })
        Promise.resolve(previewId)
      })
  },

  setPreview ({ commit, state }, { taskId, entityId, previewId }) {
    const taskMap = state.taskMap
    return tasksApi
      .setPreview(entityId, previewId)
      .then((entity) => {
        commit(SET_PREVIEW, { taskId, entityId, previewId, taskMap })
        Promise.resolve()
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
          console.error(err)
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

  showInfos ({ commit, state }) {
    commit(SET_IS_SHOW_INFOS, true)
  },

  hideInfos ({ commit, state }) {
    commit(SET_IS_SHOW_INFOS, false)
  },

  loadPreviewFileFormData ({ commit }, previewForms) {
    commit('PREVIEW_FILE_SELECTED', previewForms)
  },

  addSelectedTask ({ commit }, task) {
    commit(ADD_SELECTED_TASK, task)
  },

  addSelectedTasks ({ commit }, selection) {
    commit(ADD_SELECTED_TASKS, selection)
  },

  clearSelectedTasks ({ commit }, selection) {
    commit(CLEAR_SELECTED_TASKS, selection)
  },

  removeSelectedTask ({ commit }, task) {
    commit(REMOVE_SELECTED_TASK, task)
  },

  saveTaskSearch ({ commit, rootGetters }, { searchQuery, entityType }) {
    return new Promise((resolve, reject) => {
      const query = state.taskSearchQueries.find(
        (query) => query.name === searchQuery
      )
      const production = rootGetters.currentProduction

      if (!query) {
        peopleApi.createFilter(
          'task',
          searchQuery,
          searchQuery,
          production.id,
          entityType,
          (err, searchQuery) => {
            commit(SAVE_TASK_SEARCH_END, { searchQuery, production })
            if (err) {
              reject(err)
            } else {
              resolve(searchQuery)
            }
          }
        )
      } else {
        resolve()
      }
    })
  },

  removeTaskSearch ({ commit, rootGetters }, searchQuery) {
    return new Promise((resolve, reject) => {
      const production = rootGetters.currentProduction
      peopleApi.removeFilter(searchQuery, (err) => {
        commit(REMOVE_TASK_SEARCH_END, { searchQuery, production })
        if (err) reject(err)
        else resolve()
      })
    })
  },

  pinComment ({ commit }, comment) {
    commit(PIN_COMMENT, comment)
    tasksApi.pinComment(comment)
  }
}

const mutations = {

  [LOAD_ASSETS_END] (state, { production, userFilters }) {
    if (userFilters.task && userFilters.task[production.id]) {
      state.taskSearchQueries = userFilters.task[production.id]
    } else {
      state.taskSearchQueries = []
    }
  },

  [LOAD_SHOTS_END] (state, { production, userFilters }) {
    if (userFilters.task && userFilters.task[production.id]) {
      state.taskSearchQueries = userFilters.task[production.id]
    } else {
      state.taskSearchQueries = []
    }
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

  [LOAD_TASK_COMMENTS_END] (state, { taskId, comments }) {
    comments.forEach((comment) => {
      comment.person = personStore.helpers.addAdditionalInformation(
        comment.person
      )
    })
    state.taskComments[taskId] = sortComments(comments)
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

  [NEW_TASK_COMMENT_END] (state, { comment, taskId }) {
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
    state.taskComments[taskId] = sortComments(state.taskComments[taskId])
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
    let comments = state.taskComments[taskId]
    const oldCommentIndex = comments.findIndex(c => c.id === commentId)
    const oldComment = comments.find(c => c.id === commentId)
    const pinnedCount = comments.filter(c => c.pinned).length

    comments = comments.filter(
      c => c.id !== commentId
    )
    state.taskComments[taskId] = comments
    state.taskPreviews[taskId] = [...state.taskPreviews[taskId]].filter(
      p => !(
        oldComment.previews.length > 0 &&
        oldComment.previews[0].id === p.id
      )
    )

    if (oldCommentIndex === pinnedCount) {
      let newStatus = todoStatus
      if (comments.length > 0) {
        let newStatusId = comments[0].task_status_id
        if (pinnedCount < comments.length) {
          newStatusId = comments[pinnedCount].task_status_id
        }
        newStatus = taskStatusMap[newStatusId]
      }

      if (task) {
        Object.assign(task, {
          task_status_id: newStatus.id,
          task_status_priority: newStatus.priority
        })
      }
    }
  },

  [EDIT_COMMENT_END] (state, { taskId, comment }) {
    const oldComment = state.taskComments[taskId].find(
      c => c.id === comment.id
    )
    oldComment.text = comment.text
  },

  [PREVIEW_FILE_SELECTED] (state, forms) {
    state.previewForms = forms
  },

  [ADD_PREVIEW_START] (state) {
    state.isSavingCommentPreview = true
  },

  [ADD_PREVIEW_END] (state, { preview, taskId, commentId, comment }) {
    state.isSavingCommentPreview = false
    const newPreview = {
      id: preview.id,
      feedback: false,
      revision: preview.revision,
      extension: preview.extension
    }

    if (state.taskPreviews[taskId]) {
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
        newPreview.previews = [{ ...newPreview }]
        state.taskPreviews[taskId] =
          [newPreview].concat(state.taskPreviews[taskId])

        comment.preview = newPreview
        comment.previews = [newPreview]
      }
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
        p.annotations = annotations
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
      Object.assign(state.taskMap[task.id], {
        task_status_id: task.task_status_id,
        task_status_short_name:
          state.taskStatusMap[task.task_status_id].short_name,
        priority: task.priority,
        estimation: task.estimation,
        duration: task.duration,
        real_start_date: task.real_start_date,
        end_date: task.end_date,
        due_date: task.due_date,
        real_end_date: task.end_date,
        last_comment_date: task.last_comment_date,
        retake_count: task.retake_count
      })
    }
  },

  [EDIT_TASK_DATES] (state, { taskId, data }) {
    const task = state.taskMap[taskId]
    Object.assign(task, data)
  },

  [ASSIGN_TASKS] (state, { selectedTaskIds, personId }) {
    selectedTaskIds.forEach((taskId) => {
      const task = state.taskMap[taskId]
      if (task &&
          !task.assignees.find((assigneeId) => assigneeId === personId)) {
        task.assignees.push(personId)
        task.assignees = [...task.assignees]
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

  [SET_PREVIEW] (state, { taskId, previewId }) {
    if (state.taskMap[taskId]) {
      state.taskMap[taskId].entity.preview_file_id = previewId
    }
  },

  [SET_IS_SHOW_ASSIGNATIONS] (state, isShowAssignations) {
    state.isShowAssignations = isShowAssignations
  },

  [SET_IS_SHOW_INFOS] (state, isShowInfos) {
    state.isShowInfos = isShowInfos
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

  [SAVE_TASK_SEARCH_END] (state, { searchQuery }) {
    if (!state.taskSearchQueries.includes(searchQuery)) {
      state.taskSearchQueries.push(searchQuery)
      state.taskSearchQueries = sortByName(state.taskSearchQueries)
    }
  },

  [REMOVE_TASK_SEARCH_END] (state, { searchQuery }) {
    const queryIndex = state.taskSearchQueries.findIndex(
      (query) => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.taskSearchQueries.splice(queryIndex, 1)
    }
  },

  [PIN_COMMENT] (state, comment) {
    comment.pinned = !comment.pinned
    state.taskComments[comment.object_id] =
      sortComments(state.taskComments[comment.object_id])
  },

  [UPDATE_COMMENT_CHECKLIST] (state, { comment, checklist }) {
    comment.checklist = checklist
  },

  [CLEAR_ASSETS] (state) {
    state.taskMap = {}
  },

  [CLEAR_SHOTS] (state) {
    state.taskMap = {}
  },

  [SET_LAST_COMMENT_DRAFT] (state, lastCommentDraft) {
    state.lastCommentDraft = lastCommentDraft
  },

  [REMOVE_FIRST_PREVIEW_FILE_TO_UPLOAD] (state) {
    state.previewForms = state.previewForms.splice(1)
  },

  [RESET_ALL] (state, shots) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

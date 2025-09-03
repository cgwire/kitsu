import async from 'async'

import tasksApi from '@/store/api/tasks'
import peopleApi from '@/store/api/people'
import playlistsApi from '@/store/api/playlists'
import {
  sortComments,
  sortRevisionPreviewFiles,
  sortByName
} from '@/lib/sorting'
import { arrayMove, removeModelFromList } from '@/lib/models'
import func from '@/lib/func'

import assetStore from '@/store/modules/assets'
import editStore from '@/store/modules/edits'
import episodeStore from '@/store/modules/episodes'
import personStore from '@/store/modules/people'
import sequenceStore from '@/store/modules/sequences'
import shotStore from '@/store/modules/shots'
import taskTypeStore from '@/store/modules/tasktypes'
import taskStatusStore from '@/store/modules/taskstatus'

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
  NEW_TASK_COMMENT_END,
  NEW_TASK_END,
  EDIT_TASK_END,
  EDIT_TASK_DATES,
  UPDATE_TASK,
  CREATE_TASKS_END,
  DELETE_TASK_END,
  EDIT_COMMENT_END,
  DELETE_COMMENT_END,
  PIN_COMMENT,
  ACK_COMMENT,
  REMOVE_TASK_COMMENT,
  ADD_REPLY_TO_COMMENT,
  REMOVE_REPLY_FROM_COMMENT,
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
  UNASSIGN_TASK,
  UNASSIGN_TASKS,
  SET_PREVIEW,
  SET_IS_SHOW_ASSIGNATIONS,
  SET_IS_SHOW_INFOS,
  SET_IS_SHOW_INFOS_BREAKDOWN,
  SET_IS_BIG_THUMBNAILS,
  DELETE_PREVIEW_END,
  LOAD_PERSON_TASKS_END,
  REGISTER_USER_TASKS,
  SAVE_TASK_SEARCH_END,
  REMOVE_TASK_SEARCH_END,
  UPDATE_COMMENT_CHECKLIST,
  UPDATE_COMMENT_REPLIES,
  SET_UPLOAD_PROGRESS,
  CLEAR_UPLOAD_PROGRESS,
  ADD_ATTACHMENT_TO_COMMENT,
  REMOVE_ATTACHMENT_FROM_COMMENT,
  UPDATE_REVISION_PREVIEW_POSITION,
  ADD_ANNOTATION,
  UPDATE_ANNOTATION,
  SET_TASK_EXTRA_DATA,
  RESET_ALL
} from '@/store/mutation-types'

const locks = {}

const cache = {}

const initialState = {
  taskMap: new Map(),
  taskComments: {},
  taskPreviews: {},
  taskEntityPreviews: {},
  selectedTasks: new Map(),
  selectedValidations: new Map(),
  taskSearchQueries: [],

  nbSelectedTasks: 0,
  nbSelectedValidations: 0,
  isBigThumbnails: false,
  isShowAssignations: true,
  isShowInfos: true,

  isSavingCommentPreview: false,
  previewForms: [],

  uploadProgress: {}
}

const state = {
  ...initialState
}

const helpers = {
  getPerson(personId) {
    return personStore.getters.getPerson(personStore.state)(personId)
  },

  getTaskType(taskTypeId) {
    return taskTypeStore.cache.taskTypeMap.get(taskTypeId)
  },

  getTaskStatus(taskStatusId) {
    return taskStatusStore.cache.taskStatusMap.get(taskStatusId)
  }
}

const getters = {
  taskMap: state => state.taskMap,
  taskComments: state => state.taskComments,
  getTaskComments: state => id => state.taskComments[id] ?? [],
  getTaskPreviews: state => id => state.taskPreviews[id] ?? [],

  getTaskComment: state => (taskId, commentId) => {
    return state.taskComments[taskId]?.find(comment => comment.id === commentId)
  },

  selectedTasks: state => state.selectedTasks,
  nbSelectedTasks: state => state.nbSelectedTasks,
  nbSelectedValidations: state => state.nbSelectedValidations,
  taskSearchQueries: state => state.taskSearchQueries,
  isBigThumbnails: state => state.isBigThumbnails,
  isShowAssignations: state => state.isShowAssignations,
  isShowInfos: state => state.isShowInfos,
  taskEntityPreviews: state => state.taskEntityPreviews,
  previewForms: state => state.previewForms,
  isSavingCommentPreview: state => state.isSavingCommentPreview,
  uploadProgress: state => state.uploadProgress
}

const actions = {
  loadTask({ commit, state }, { taskId }) {
    return tasksApi.getTask(taskId).then(task => {
      const currentTask = state.taskMap.get(taskId)
      if (currentTask && task.updated_at < currentTask.updated_at) {
        delete task.start_date
        delete task.due_date
      }
      commit(LOAD_TASK_END, task)
      return task
    })
  },

  loadTasks({}, filters) {
    return tasksApi.getTasks(filters)
  },

  loadOpenTasks({}, filters) {
    return tasksApi.getOpenTasks(filters)
  },

  subscribeToTask({ commit }, taskId) {
    return tasksApi.subscribeToTask(taskId).then(() => {
      commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed: true })
      return true
    })
  },

  unsubscribeFromTask({ commit }, taskId) {
    return tasksApi.unsubscribeFromTask(taskId).then(() => {
      commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed: false })
      return false
    })
  },

  loadTaskComments({ commit, dispatch }, { taskId, entityId }) {
    return tasksApi.getTaskComments(taskId).then(comments => {
      commit(LOAD_TASK_COMMENTS_END, { comments, taskId })
      return dispatch('loadTaskEntityPreviewFiles', entityId)
    })
  },

  loadTaskEntityPreviewFiles({ commit }, entityId) {
    const entity = { id: entityId }
    return playlistsApi.getEntityPreviewFiles(entity).then(previewFiles => {
      commit(LOAD_TASK_ENTITY_PREVIEW_FILES_END, previewFiles)
      return previewFiles
    })
  },

  loadComment({ commit }, { commentId }) {
    return tasksApi.getTaskComment({ id: commentId }).then(comment => {
      // The API returns a list of preview IDs instead of objects.
      comment.previews = comment.previews.map(id => ({ id }))
      commit(NEW_TASK_COMMENT_END, { comment })
      return comment
    })
  },

  addAttachmentToComment({ commit }, { comment, files }) {
    if (files.length === 0) return Promise.resolve(comment)
    return tasksApi
      .addAttachmentToComment(comment, files)
      .then(attachmentFiles => {
        commit(ADD_ATTACHMENT_TO_COMMENT, { comment, attachmentFiles })
        return comment
      })
  },

  deleteAttachment({ commit }, { comment, attachment }) {
    return tasksApi.deleteAttachment(comment, attachment).then(() => {
      commit(REMOVE_ATTACHMENT_FROM_COMMENT, { comment, attachment })
      return comment
    })
  },

  createTasks({ commit, rootGetters }, payload) {
    const production = rootGetters.currentProduction
    const taskStatusMap = taskStatusStore.cache.taskStatusMap
    const taskTypeMap = taskTypeStore.cache.taskTypeMap
    let entityIds = payload.entityIds || []
    if (payload.selectionOnly) {
      if (payload.type === 'shots') {
        entityIds = shotStore.cache.result.map(shot => shot.id)
      } else if (payload.type === 'assets') {
        entityIds = assetStore.cache.result.map(asset => asset.id)
      } else if (payload.type === 'edits') {
        entityIds = editStore.cache.result.map(edit => edit.id)
      } else if (payload.type === 'episodes') {
        entityIds = episodeStore.cache.result.map(episode => episode.id)
      } else if (payload.type === 'sequences') {
        entityIds = sequenceStore.cache.result.map(sequence => sequence.id)
      }
    }
    const data = {
      task_type_id: payload.task_type_id,
      type: payload.type,
      project_id: payload.project_id,
      entityIds
    }
    return tasksApi
      .createTasks(data)
      .then(tasks => {
        commit(CREATE_TASKS_END, {
          tasks,
          production,
          taskStatusMap,
          taskTypeMap
        })
        return tasks
      })
      .catch(err => {
        console.error(err)
        return []
      })
  },

  createSelectedTasks({ commit, state, rootGetters }, { type, projectId }) {
    const production = rootGetters.currentProduction
    const taskTypeMap = taskTypeStore.cache.taskTypeMap
    const taskStatusMap = taskStatusStore.cache.taskStatusMap
    const selectedTaskIds = Array.from(state.selectedValidations.keys())
    const entityIdsByTaskType = {}
    selectedTaskIds.forEach(taskId => {
      const validationInfo = state.selectedValidations.get(taskId)
      const entityId = validationInfo.entity.id
      const taskTypeId = validationInfo.column.id
      if (!entityIdsByTaskType[taskTypeId]) {
        entityIdsByTaskType[taskTypeId] = []
      }
      entityIdsByTaskType[taskTypeId].push(entityId)
    })
    return func.runPromiseAsSeries(
      Object.keys(entityIdsByTaskType).map(taskTypeId => {
        const data = {
          task_type_id: taskTypeId,
          type,
          project_id: projectId,
          entityIds: entityIdsByTaskType[taskTypeId]
        }
        return tasksApi
          .createTasks(data)
          .then(tasks => {
            commit(CREATE_TASKS_END, {
              tasks,
              production,
              taskStatusMap,
              taskTypeMap
            })
            tasks.forEach(task => {
              const validationInfo = {
                column: { id: task.task_type_id },
                entity: { id: task.entity_id }
              }
              commit(REMOVE_SELECTED_TASK, validationInfo)
              validationInfo.task = task
              commit(ADD_SELECTED_TASK, validationInfo)
            })
            return tasks
          })
          .catch(err => {
            console.error(err)
            return []
          })
      })
    )
  },

  deleteSelectedTasks({ commit, state }) {
    return new Promise((resolve, reject) => {
      const selectedTaskIds = Array.from(state.selectedTasks.keys())
      async.eachSeries(
        selectedTaskIds,
        (taskId, next) => {
          const task = state.taskMap.get(taskId)
          if (task) {
            tasksApi
              .deleteTask(task)
              .then(() => {
                commit(DELETE_TASK_END, task)
                next()
              })
              .catch(next)
          } else {
            next()
          }
        },
        err => {
          if (err) reject(err)
          else {
            resolve()
          }
        }
      )
    })
  },

  deleteAllTasks({}, { projectId, taskTypeId, taskIds }) {
    return tasksApi.deleteAllTasks(projectId, taskTypeId, taskIds)
  },

  createTask(
    { commit, rootGetters },
    { entityId, projectId, taskTypeId, type }
  ) {
    const production = rootGetters.currentProduction
    const taskTypeMap = taskTypeStore.cache.taskTypeMap
    const taskStatusMap = taskStatusStore.cache.taskStatusMap
    const data = {
      entity_id: entityId,
      task_type_id: taskTypeId,
      type,
      project_id: projectId
    }
    return tasksApi.createTask(data).then(tasks => {
      commit(NEW_TASK_END, {
        task: tasks[0],
        production,
        taskTypeMap,
        taskStatusMap
      })
      return tasks[0]
    })
  },

  changeSelectedTaskStatus(
    { commit, state, rootGetters },
    { taskStatusId, comment }
  ) {
    const tasksToChange = []
    const production = rootGetters.currentProduction
    Array.from(state.selectedTasks.keys()).forEach(taskId => {
      const task = state.taskMap.get(taskId)
      const isChanged =
        task &&
        (task.task_status_id !== taskStatusId ||
          (comment && comment.length > 0))
      if (isChanged) {
        tasksToChange.push({
          object_id: taskId,
          task_status_id: taskStatusId,
          comment: comment || '',
          checklist: []
        })
      }
    })
    return tasksApi
      .commentTasks(production.id, tasksToChange)
      .then(comments => {
        comments.forEach(comment => {
          commit(NEW_TASK_COMMENT_END, { comment, taskId: comment.object_id })
        })
        return comments
      })
  },

  changeSelectedPriorities(
    { commit, state, rootGetters },
    { priority, callback }
  ) {
    const selectedTaskIds = Array.from(state.selectedTasks.keys())
    async.eachSeries(
      selectedTaskIds,
      (taskId, next) => {
        const task = state.taskMap.get(taskId)
        const taskType = rootGetters.taskTypeMap.get(task.task_type_id)

        if (task && task.priority !== priority) {
          tasksApi
            .updateTask(taskId, { priority })
            .then(task => {
              commit(EDIT_TASK_END, { task, taskType })
              next()
            })
            .catch(next)
        } else {
          next()
        }
      },
      err => {
        callback(err)
      }
    )
  },

  updateTask({ commit }, { taskId, data }) {
    commit(EDIT_TASK_DATES, { taskId, data })
    return tasksApi.updateTask(taskId, data)
  },

  editTaskComment({ commit }, { taskId, comment }) {
    return tasksApi.editTaskComment(comment).then(comment => {
      commit(EDIT_COMMENT_END, { taskId, comment })
      return comment
    })
  },

  deleteTaskComment({ commit, rootState }, { taskId, commentId }) {
    return tasksApi.deleteTaskComment(taskId, commentId).then(() => {
      const taskStatusMap = taskStatusStore.cache.taskStatusMap
      const todoStatus = rootState.taskStatus.taskStatuses.find(
        taskStatus => taskStatus.is_default
      )
      commit(DELETE_COMMENT_END, {
        commentId,
        taskId,
        taskStatusMap,
        todoStatus
      })
    })
  },

  commentTask(
    { commit },
    { taskId, taskStatusId, comment, attachment, checklist }
  ) {
    const data = { taskId, taskStatusId, comment, attachment, checklist }
    return tasksApi.commentTask(data).then(comment => {
      commit(NEW_TASK_COMMENT_END, { comment, taskId })
      return comment
    })
  },

  commentTaskWithPreview(
    { commit, state },
    {
      taskId,
      taskStatusId,
      attachment,
      checklist,
      comment,
      form,
      revision,
      links
    }
  ) {
    const data = { taskId, taskStatusId, comment, attachment, checklist, links }
    const previewForms = [...state.previewForms]
    commit(ADD_PREVIEW_START)
    let newComment
    locks[taskId] = true
    return (
      tasksApi
        .commentTask(data)
        // Create the comment entry.
        .then(comment => {
          newComment = comment
          const previewData = {
            taskId,
            commentId: newComment.id,
            revision
          }
          return tasksApi.addPreview(previewData)
        })
        // Create the main preview entry.
        .then(preview => {
          if (!form) form = previewForms[0]
          const { request, promise } = tasksApi.uploadPreview(preview.id, form)
          request.on('progress', e => {
            commit(SET_UPLOAD_PROGRESS, {
              previewId: preview.id,
              percent: e.percent,
              name: form.get('file').name
            })
          })
          return promise
        })
        .then(preview => {
          commit(ADD_PREVIEW_END, {
            preview,
            taskId,
            commentId: newComment.id,
            comment: newComment
          })
          // Create the remaining previews if there are some.
          if (previewForms.length > 1) {
            const addPreview = form => {
              return tasksApi
                .addExtraPreview(preview.id, taskId, newComment.id)
                .then(extraPreview => {
                  const { request, promise } = tasksApi.uploadPreview(
                    extraPreview.id,
                    form
                  )
                  request.on('progress', e => {
                    commit(SET_UPLOAD_PROGRESS, {
                      previewId: extraPreview.id,
                      percent: e.percent,
                      name: form.get('file').name
                    })
                  })
                  return promise
                })
                .then(preview => {
                  commit(ADD_PREVIEW_END, {
                    preview,
                    taskId,
                    commentId: newComment.id,
                    comment: newComment
                  })
                  return preview
                })
            }
            const remainingPreviews = previewForms.slice(1)
            // run promises in sequence
            return remainingPreviews.reduce(
              (accumulatorPromise, form) =>
                accumulatorPromise.then(() => addPreview(form)),
              Promise.resolve()
            )
          } else {
            return preview
          }
        })
        .then(preview => {
          commit(NEW_TASK_COMMENT_END, { comment: newComment, taskId })
          commit(CLEAR_UPLOAD_PROGRESS)
          return { newComment, preview }
        })
        .finally(() => {
          locks[taskId] = false
        })
    )
  },

  addCommentExtraPreview(
    { commit, getters, state },
    { taskId, commentId, previewId }
  ) {
    const addPreview = form => {
      return tasksApi
        .addExtraPreview(previewId, taskId, commentId)
        .then(preview => {
          const { request, promise } = tasksApi.uploadPreview(preview.id, form)
          request.on('progress', e => {
            commit(SET_UPLOAD_PROGRESS, {
              previewId: preview.id,
              percent: e.percent,
              name: form.get('file').name
            })
          })
          return promise
        })
        .then(preview => {
          const comment = getters.getTaskComment(taskId, commentId)
          commit(ADD_PREVIEW_END, {
            preview,
            taskId,
            commentId,
            comment
          })
          return preview
        })
    }
    // run promises in sequence
    return state.previewForms.reduce(
      (accumulatorPromise, form) =>
        accumulatorPromise.then(() => addPreview(form)),
      Promise.resolve()
    )
  },

  deleteTaskPreview({ commit }, { taskId, commentId, previewId }) {
    return tasksApi.deletePreview(taskId, commentId, previewId).then(() => {
      commit(DELETE_PREVIEW_END, { taskId, previewId })
      return previewId
    })
  },

  setPreview({ commit, state }, { taskId, entityId, previewId, frame }) {
    const taskMap = state.taskMap
    return tasksApi.setPreview(entityId, previewId, frame).then(entity => {
      const task = taskMap.get(taskId)
      if (task && task.entity_preview_file_id === previewId) {
        commit(SET_PREVIEW, { taskId, entityId, previewId, taskMap })
      } else {
        // Trick needed to trigger reactivity when only the preview frame is
        // modified and not the preview itself.
        commit(SET_PREVIEW, { taskId, entityId, previewId: '', taskMap })
        setTimeout(() => {
          commit(SET_PREVIEW, { taskId, entityId, previewId, taskMap })
          return Promise.resolve()
        }, 0)
      }
    })
  },

  setLastTaskPreview({ commit, state }, taskId) {
    const taskMap = state.taskMap
    return tasksApi.setLastTaskPreviewAsEntityThumbnail(taskId).then(entity => {
      commit(SET_PREVIEW, {
        taskId,
        entityId: entity.id,
        previewId: entity.preview_file_id,
        taskMap
      })
    })
  },

  updatePreviewAnnotation(
    { commit },
    { taskId, preview, additions, deletions, updates }
  ) {
    return tasksApi
      .updatePreviewAnnotation(preview, additions, updates, deletions)
      .then(updatedPreview => {
        commit(UPDATE_PREVIEW_ANNOTATION, {
          taskId,
          preview,
          annotations: updatedPreview.annotations
        })
        return preview
      })
      .catch(err => {
        console.error(err)
        alert(
          'An error occurred while saving your annotation, please wait 3s for another try.'
        )
      })
  },

  refreshPreview({ commit }, { taskId, previewId }) {
    return tasksApi.getPreviewFile(previewId).then(preview => {
      commit(UPDATE_PREVIEW_ANNOTATION, {
        taskId,
        preview,
        annotations: preview.annotations
      })
      return preview
    })
  },

  assignSelectedTasks({ commit, state }, { personId, taskIds }) {
    const selectedTaskIds = taskIds || Array.from(state.selectedTasks.keys())
    return tasksApi.assignTasks(personId, selectedTaskIds).then(() => {
      commit(ASSIGN_TASKS, { selectedTaskIds, personId })
    })
  },

  unassignSelectedTasks({ commit, state }, { taskIds } = {}) {
    const selectedTaskIds = taskIds || Array.from(state.selectedTasks.keys())
    return tasksApi.unassignTasks(selectedTaskIds).then(() => {
      commit(UNASSIGN_TASKS, selectedTaskIds)
    })
  },

  unassignPersonFromTask({ commit }, { task, person }) {
    return tasksApi
      .unassignPersonFromTask(task.id, person.id)
      .then(() => {
        commit(UNASSIGN_TASK, { task, person })
      })
      .catch(console.error)
  },

  showAssignations({ commit }) {
    commit(SET_IS_SHOW_ASSIGNATIONS, true)
  },

  hideAssignations({ commit }) {
    commit(SET_IS_SHOW_ASSIGNATIONS, false)
  },

  showInfos({ commit }) {
    commit(SET_IS_SHOW_INFOS, true)
  },

  hideInfos({ commit }) {
    commit(SET_IS_SHOW_INFOS, false)
  },

  showInfosBreakdown({ commit }) {
    commit(SET_IS_SHOW_INFOS_BREAKDOWN, true)
  },

  hideInfosBreakdown({ commit }) {
    commit(SET_IS_SHOW_INFOS_BREAKDOWN, false)
  },

  setBigThumbnails({ commit }) {
    commit(SET_IS_BIG_THUMBNAILS, true)
  },

  setSmallThumbnails({ commit }) {
    commit(SET_IS_BIG_THUMBNAILS, false)
  },

  loadPreviewFileFormData({ commit }, previewForms) {
    commit(PREVIEW_FILE_SELECTED, previewForms)
  },

  addSelectedTask({ commit }, task) {
    commit(ADD_SELECTED_TASK, task)
  },

  addSelectedTasks({ commit }, selection) {
    commit(ADD_SELECTED_TASKS, selection)
  },

  clearSelectedTasks({ commit }, selection) {
    commit(CLEAR_SELECTED_TASKS, selection)
  },

  removeSelectedTask({ commit }, task) {
    commit(REMOVE_SELECTED_TASK, task)
  },

  saveTaskSearch({ commit, rootGetters }, { searchQuery, entityType }) {
    if (state.taskSearchQueries.some(query => query.name === searchQuery)) {
      return
    }
    const production = rootGetters.currentProduction
    return peopleApi
      .createFilter('task', searchQuery, searchQuery, production.id, entityType)
      .then(searchQuery => {
        commit(SAVE_TASK_SEARCH_END, { searchQuery, production })
        return searchQuery
      })
  },

  removeTaskSearch({ commit, rootGetters }, searchQuery) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilter(searchQuery).then(() => {
      commit(REMOVE_TASK_SEARCH_END, { searchQuery, production })
    })
  },

  ackComment({ commit, rootGetters }, comment) {
    const user = rootGetters.user
    commit(ACK_COMMENT, { comment, user })
    return tasksApi.ackComment(comment)
  },

  async replyToComment({ commit }, { comment, text, attachments }) {
    const reply = await tasksApi.replyToComment(comment, text, attachments)
    commit(ADD_REPLY_TO_COMMENT, { comment, reply })
    return reply
  },

  deleteReply({ commit }, { comment, reply }) {
    commit(REMOVE_REPLY_FROM_COMMENT, { comment, reply })
    return tasksApi.deleteReply(comment, reply).then(() => {
      return reply
    })
  },

  pinComment({ commit }, comment) {
    commit(PIN_COMMENT, comment)
    return tasksApi.pinComment(comment)
  },

  refreshComment({ commit }, { commentId }) {
    return tasksApi.getTaskComment({ id: commentId }).then(comment => {
      commit(UPDATE_COMMENT_REPLIES, comment)
      return comment
    })
  },

  updateRevisionPreviewPosition({ commit }, payload) {
    if (payload.newIndex < payload.previousIndex) payload.newIndex++
    commit(UPDATE_REVISION_PREVIEW_POSITION, payload)
    return tasksApi.updateRevisionPreviewPosition(
      payload.previewId,
      payload.newIndex
    )
  },

  getPersonsTasksDates() {
    return tasksApi.getPersonsTasksDates()
  }
}

const mutations = {
  [LOAD_ASSETS_END](state, { production, userFilters }) {
    if (userFilters.task && userFilters.task[production.id]) {
      state.taskSearchQueries = userFilters.task[production.id]
    } else {
      state.taskSearchQueries = []
    }
    state.tasks = Array.from(state.taskMap.values())
  },

  [LOAD_SHOTS_END](state, { production, userFilters }) {
    if (userFilters.task && userFilters.task[production.id]) {
      state.taskSearchQueries = userFilters.task[production.id]
    } else {
      state.taskSearchQueries = []
    }
  },

  [LOAD_TASK_END](state, task) {
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
    } else if (task.entity_type.name === 'Episode') {
      task.entity_name = `${task.entity.name}`
    } else if (['Sequence', 'Edit'].includes(task.entity_type_name)) {
      if (task.episode) {
        task.entity_name = `${task.episode.name} / ${task.entity.name}`
      } else {
        task.entity_name = `${task.entity.name}`
      }
    } else {
      task.entity_name = `${task.entity_type.name} / ${task.entity.name}`
    }
    if (!state.taskMap.get(task.id)) {
      state.taskMap.set(task.id, task)
    } else {
      Object.assign(state.taskMap.get(task.id), task)
    }
  },

  [LOAD_TASK_ENTITY_PREVIEW_FILES_END](state, previewFiles) {
    state.taskEntityPreviews = previewFiles
  },

  [LOAD_TASK_COMMENTS_END](state, { taskId, comments }) {
    comments.forEach(comment => {
      comment.person = personStore.cache.personMap.get(comment.person_id)
    })
    state.taskComments[taskId] = sortComments([...comments])
    state.taskPreviews[taskId] = comments.reduce((previews, comment) => {
      if (comment.previews && comment.previews.length > 0) {
        const preview = comment.previews[0]
        preview.previews = sortRevisionPreviewFiles(
          comment.previews.map(p => {
            const prev = {
              id: p.id,
              annotations: p.annotations,
              extension: p.extension,
              width: p.width,
              height: p.height,
              task_id: p.task_id,
              status: p.status,
              revision: p.revision,
              position: p.position,
              duration: p.duration,
              original_name: p.original_name
            }
            return prev
          })
        )
        previews.push(preview)
        return previews
      } else {
        return previews
      }
    }, [])
  },

  [LOAD_TASK_STATUSES_END](state, taskStatuses) {
    state.taskStatuses = sortByName(taskStatuses)
  },

  [LOAD_TASK_SUBSCRIBE_END](state, { taskId, subscribed }) {
    const task = state.taskMap.get(taskId)
    task.is_subscribed = subscribed
  },

  [NEW_TASK_COMMENT_END](state, { comment, taskId = undefined }) {
    const task = state.taskMap.get(taskId)
    if (comment.task_status === undefined) {
      comment.task_status = helpers.getTaskStatus(comment.task_status_id)
    }

    if (comment.person === undefined) {
      const getPerson = personStore.getters.getPerson(personStore.state)
      comment.person = getPerson(comment.person_id)
    }

    comment.person = personStore.helpers.addAdditionalInformation(
      comment.person
    )

    if (!taskId) {
      taskId = comment.object_id
    }
    if (!state.taskComments[taskId]) state.taskComments[taskId] = []
    const commentIndex = state.taskComments[taskId].findIndex(
      ({ id }) => id === comment.id
    )
    if (commentIndex < 0) {
      state.taskComments[taskId].unshift(comment)
    } else {
      state.taskComments[taskId].splice(commentIndex, 1, comment)
    }
    state.taskComments[taskId] = sortComments(state.taskComments[taskId])

    if (task) {
      Object.assign(task, {
        task_status_id: comment.task_status_id,
        last_comment: comment
      })
    }
  },

  [DELETE_TASK_END](state, task) {
    state.taskComments[task.id] = undefined
    state.taskPreviews[task.id] = undefined
    state.taskMap.delete(task.id)
    const validationKey = `${task.entity_id}-${task.task_type_id}`
    state.selectedValidations.set(validationKey, {
      entity: { id: task.entity_id },
      column: { id: task.task_type_id }
    })
    state.selectedTasks.delete(task.id)
  },

  [DELETE_COMMENT_END](
    state,
    { taskId, commentId, taskStatusMap, todoStatus }
  ) {
    const task = state.taskMap.get(taskId)
    let comments = state.taskComments[taskId]
    const oldCommentIndex = comments.findIndex(c => c.id === commentId)
    const oldComment = comments.find(c => c.id === commentId)
    const pinnedCount = comments.filter(c => c.pinned).length

    comments = comments.filter(c => c.id !== commentId)
    state.taskComments[taskId] = comments
    if (oldComment) {
      state.taskPreviews[taskId] = [...state.taskPreviews[taskId]].filter(
        p =>
          !(
            oldComment.previews.length > 0 && oldComment.previews[0].id === p.id
          )
      )
    }

    if (oldCommentIndex === pinnedCount) {
      let newStatus = todoStatus
      if (comments.length > 0) {
        let newStatusId = comments[0].task_status_id
        if (pinnedCount < comments.length) {
          newStatusId = comments[pinnedCount].task_status_id
        }
        newStatus = taskStatusMap.get(newStatusId)
      }

      if (task) {
        Object.assign(task, {
          task_status_id: newStatus.id,
          task_status_priority: newStatus.priority
        })
      }
    }
  },

  [EDIT_COMMENT_END](state, { taskId, comment }) {
    const oldComment = state.taskComments[taskId].find(c => c.id === comment.id)
    Object.assign(oldComment, {
      text: comment.text,
      task_status_id: comment.task_status_id,
      task_status: taskStatusStore.cache.taskStatusMap.get(
        comment.task_status_id
      ),
      checklist: comment.checklist || []
    })
  },

  [PREVIEW_FILE_SELECTED](state, forms) {
    state.previewForms = forms
  },

  [ADD_PREVIEW_START](state) {
    state.isSavingCommentPreview = true
  },

  [ADD_PREVIEW_END](state, { preview, taskId, commentId, comment }) {
    state.isSavingCommentPreview = false
    const newPreview = {
      id: preview.id,
      feedback: false,
      revision: preview.revision,
      status: preview.status,
      position: preview.position,
      original_name: preview.original_name,
      extension: preview.extension,
      duration: preview.duration,
      task_id: taskId
    }

    if (state.taskPreviews[taskId]) {
      const existingPreview = state.taskPreviews[taskId].find(
        p => p.revision === preview.revision
      )

      if (existingPreview) {
        const existingSubPreview = existingPreview.previews.find(
          p => p.id === newPreview.id
        )
        if (!existingSubPreview) {
          existingPreview.previews.push(newPreview)
        }
      } else {
        newPreview.previews = [{ ...newPreview }]
        state.taskPreviews[taskId] = [newPreview].concat(
          state.taskPreviews[taskId]
        )

        comment.preview = newPreview
        comment.previews = [newPreview]
      }
    }
  },

  [DELETE_PREVIEW_END](state, { taskId, previewId }) {
    state.taskPreviews[taskId].forEach(p => {
      const index = p.previews.findIndex(
        subPreview => subPreview.id === previewId
      )
      if (index >= 0) {
        p.previews.splice(index, 1)
      }
    })
  },

  [UPDATE_PREVIEW_ANNOTATION](state, { taskId, preview, annotations }) {
    if (annotations) {
      preview.annotations = annotations
    }
    if (state.taskPreviews[taskId]) {
      state.taskPreviews[taskId].forEach(p => {
        p.previews.forEach(subPreview => {
          if (subPreview.id === preview.id) {
            if (annotations) {
              subPreview.annotations = annotations
            }
            subPreview.status = preview.status
          }
        })
        if (p.id === preview.id) {
          p.annotations = annotations
          p.status = preview.status
        }
      })
    }
  },

  [CHANGE_PREVIEW_END](state, { preview, comment }) {
    const taskId = comment.object_id

    const newPreview = {
      id: preview.id,
      feedback: false,
      revision: preview.revision,
      position: preview.position,
      original_name: preview.original_name,
      extension: preview.extension,
      duration: preview.duration
    }
    state.taskPreviews[taskId].shift()
    state.taskPreviews[taskId] = [newPreview].concat(state.taskPreviews[taskId])
  },

  [ADD_SELECTED_TASK](state, validationInfo) {
    if (validationInfo.id) {
      const task = validationInfo
      state.selectedTasks.set(task.id, task)
      state.nbSelectedTasks = state.selectedTasks.size
    } else if (validationInfo.task) {
      state.selectedTasks.set(validationInfo.task.id, validationInfo.task)
      state.nbSelectedTasks = state.selectedTasks.size
    } else {
      const taskTypeId = validationInfo.column.id
      const entityId = validationInfo.entity.id
      const validationKey = `${entityId}-${taskTypeId}`
      state.selectedValidations.set(validationKey, validationInfo)
      state.nbSelectedValidations = state.selectedValidations.size
    }
  },

  [ADD_SELECTED_TASKS](state, selection) {
    const tmpSelectedTasks = new Map(state.selectedTasks)
    const tmpSelectedValidations = new Map(state.selectedValidations)
    let isValidationChanged = false
    selection.forEach(validationInfo => {
      if (validationInfo.task) {
        tmpSelectedTasks.set(validationInfo.task.id, validationInfo.task)
      } else {
        const taskTypeId = validationInfo.column.id
        const entityId = validationInfo.entity.id
        const validationKey = `${entityId}-${taskTypeId}`
        tmpSelectedValidations.set(validationKey, validationInfo)
        isValidationChanged = true
      }
    })
    state.selectedTasks = tmpSelectedTasks
    state.nbSelectedTasks = state.selectedTasks.size
    if (isValidationChanged) {
      state.selectedValidations = tmpSelectedValidations
      state.nbSelectedValidations = state.selectedValidations.size
    }
  },

  [REMOVE_SELECTED_TASK](state, validationInfo) {
    if (validationInfo.task) {
      state.selectedTasks.delete(validationInfo.task.id)
      state.nbSelectedTasks = state.selectedTasks.size
    } else {
      const taskTypeId = validationInfo.column.id
      const entityId = validationInfo.entity.id
      const validationKey = `${entityId}-${taskTypeId}`
      state.selectedValidations.delete(validationKey)
      state.nbSelectedValidations = state.selectedValidations.size
    }
  },

  [CLEAR_SELECTED_TASKS](state) {
    if (state.nbSelectedTasks > 0) {
      state.selectedTasks = new Map()
      state.nbSelectedTasks = 0
    }
    if (state.nbSelectedValidations > 0) {
      state.selectedValidations = new Map()
      state.nbSelectedValidations = 0
    }
  },

  [CREATE_TASKS_END](state, { tasks }) {
    tasks.forEach(task => {
      state.taskMap.set(task.id, task)
    })
  },

  [NEW_TASK_END](state, { task }) {
    state.taskMap.set(task.id, task)
  },

  [EDIT_TASK_END](state, { task }) {
    const currentTask = state.taskMap.get(task.id)
    if (currentTask) {
      Object.assign(state.taskMap.get(task.id), {
        task_status_id: task.task_status_id,
        task_status_short_name: taskStatusStore.cache.taskStatusMap.get(
          task.task_status_id
        ).short_name,
        priority: task.priority,
        estimation: task.estimation,
        difficulty: task.difficulty,
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

  [UPDATE_TASK](state, { task, nbAssetsReady, updatedAt, taskStatusId }) {
    if (nbAssetsReady) task.nb_assets_ready = nbAssetsReady
    if (updatedAt) task.updated_at = updatedAt
    if (taskStatusId) task.task_status_id = taskStatusId
  },

  [EDIT_TASK_DATES](state, { taskId, data }) {
    const task = state.taskMap.get(taskId)
    if (task) {
      Object.assign(task, data)
    }
  },

  [ASSIGN_TASKS](state, { selectedTaskIds, personId }) {
    selectedTaskIds.forEach(taskId => {
      const task = state.taskMap.get(taskId)
      if (task && !task.assignees.find(assigneeId => assigneeId === personId)) {
        task.assignees.push(personId)
        task.assignees = [...task.assignees]
      }
    })
  },

  [UNASSIGN_TASKS](state, selectedTaskIds) {
    selectedTaskIds.forEach(taskId => {
      const task = state.taskMap.get(taskId)
      if (task) {
        task.assignees = []
      }
    })
  },

  [UNASSIGN_TASK](state, { person, task }) {
    if (task) {
      task.assignees = task.assignees.filter(pId => pId !== person.id)
    }
  },

  [SET_PREVIEW](state, { taskId, previewId }) {
    if (state.taskMap.get(taskId)?.entity) {
      state.taskMap.get(taskId).entity.preview_file_id = previewId
    }
  },

  [SET_IS_BIG_THUMBNAILS](state, isBigThumbnails) {
    state.isBigThumbnails = isBigThumbnails
  },

  [SET_IS_SHOW_ASSIGNATIONS](state, isShowAssignations) {
    state.isShowAssignations = isShowAssignations
  },

  [SET_IS_SHOW_INFOS](state, isShowInfos) {
    state.isShowInfos = isShowInfos
  },

  [LOAD_PERSON_TASKS_END](state, { tasks }) {
    tasks.forEach(task => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }
      state.taskMap.set(task.id, task)
    })
  },

  [REGISTER_USER_TASKS](state, { tasks }) {
    tasks.forEach(task => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }
      state.taskMap.set(task.id, task)
    })
  },

  [SAVE_TASK_SEARCH_END](state, { searchQuery }) {
    if (!state.taskSearchQueries.includes(searchQuery)) {
      state.taskSearchQueries.push(searchQuery)
      state.taskSearchQueries = sortByName(state.taskSearchQueries)
    }
  },

  [REMOVE_TASK_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.taskSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.taskSearchQueries.splice(queryIndex, 1)
    }
  },

  [PIN_COMMENT](state, comment) {
    comment.pinned = !comment.pinned
    state.taskComments[comment.object_id] = sortComments(
      state.taskComments[comment.object_id]
    )
  },

  [ACK_COMMENT](state, { comment, user }) {
    if (comment.acknowledgements.includes(user.id)) {
      comment.acknowledgements = comment.acknowledgements.filter(
        personId => personId !== user.id
      )
    } else {
      comment.acknowledgements.push(user.id)
    }
    state.taskComments[comment.object_id] = sortComments(
      state.taskComments[comment.object_id]
    )
  },

  [ADD_REPLY_TO_COMMENT](state, { comment, reply }) {
    if (!comment.replies) comment.replies = []
    if (!comment.replies.find(r => r.id === reply.id)) {
      comment.replies.push(reply)
      comment.attachment_files = [
        ...(comment.attachment_files || []),
        ...(reply.attachment_files || [])
      ]
    }
  },

  [REMOVE_REPLY_FROM_COMMENT](state, { comment, reply }) {
    if (!comment.replies) comment.replies = []
    comment.replies = comment.replies.filter(r => r.id !== reply.id)
  },

  [REMOVE_TASK_COMMENT](state, { task, comment }) {
    state.taskComments[task.id] = state.taskComments[task.id].filter(
      c => c.id !== comment.id
    )
  },

  [UPDATE_COMMENT_CHECKLIST](state, { comment, checklist }) {
    if (state.taskComments[comment.object_id]) {
      const localComment = state.taskComments[comment.object_id].find(
        c => c.id === comment.id
      )
      localComment.checklist = [...checklist]
    }
  },

  [UPDATE_COMMENT_REPLIES](state, comment) {
    if (state.taskComments[comment.object_id]) {
      const localComment = state.taskComments[comment.object_id].find(
        c => c.id === comment.id
      )
      localComment.replies = comment.replies
    }
  },

  [ADD_ATTACHMENT_TO_COMMENT](state, { comment, attachmentFiles }) {
    const oldComment = state.taskComments[comment.object_id].find(
      c => c.id === comment.id
    )
    if (!comment.attachment_files) {
      comment.attachment_files = []
    }
    oldComment.attachment_files =
      oldComment.attachment_files.concat(attachmentFiles)
  },

  [REMOVE_ATTACHMENT_FROM_COMMENT](state, { comment, attachment }) {
    const oldComment = state.taskComments[comment.object_id].find(
      c => c.id === comment.id
    )
    oldComment.attachment_files = removeModelFromList(
      oldComment.attachment_files,
      attachment
    )
  },

  [CLEAR_ASSETS](state) {
    state.taskMap = new Map()
  },

  [CLEAR_SHOTS](state) {
    state.taskMap = new Map()
  },

  [UPDATE_REVISION_PREVIEW_POSITION](
    state,
    { previousIndex, newIndex, revision, taskId }
  ) {
    const preview = state.taskPreviews[taskId].find(
      p => p.revision === revision
    )
    preview.previews = arrayMove(preview.previews, previousIndex, newIndex)
    preview.previews.forEach((preview, index) => {
      preview.position = index + 1
    })
  },

  [SET_UPLOAD_PROGRESS](state, { name, percent }) {
    if (!state.uploadProgress.name) {
      state.uploadProgress.name = percent
    }
    state.uploadProgress[name] = percent
  },

  [CLEAR_UPLOAD_PROGRESS](state) {
    state.uploadProgress = {}
  },

  [ADD_ANNOTATION](state, { annotations, annotation }) {
    annotations.push(annotation)
    annotations.sort((a, b) => {
      return a.time < b.time
    })
  },

  [UPDATE_ANNOTATION](state, { annotation, data }) {
    Object.assign(annotation, data)
  },

  [SET_TASK_EXTRA_DATA](state, { task, data }) {
    task.data = data
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}

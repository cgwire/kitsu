import moment from 'moment'
import peopleApi from '@/store/api/people'
import editsApi from '@/store/api/edits'
import tasksStore from '@/store/modules/tasks'
import peopleStore from '@/store/modules/people'
import productionsStore from '@/store/modules/productions'
import taskTypesStore from '@/store/modules/tasktypes'
import taskStatusStore from '@/store/modules/taskstatus'

import func from '@/lib/func'
import { PAGE_SIZE } from '@/lib/pagination'
import { getTaskTypePriorityOfProd } from '@/lib/productions'
import {
  sortByName,
  sortEditResult,
  sortEdits,
  sortTasks,
  sortValidationColumns
} from '@/lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'
import { getFilledColumns, removeModelFromList } from '@/lib/models'
import { minutesToDays } from '@/lib/time'
import { buildEditIndex, indexSearch } from '@/lib/indexing'
import { applyFilters, getFilters, getKeyWords } from '@/lib/filtering'

import {
  LOAD_EDITS_START,
  LOAD_EDITS_ERROR,
  LOAD_EDITS_END,
  SORT_VALIDATION_COLUMNS,
  LOAD_EDIT_END,
  EDIT_CSV_FILE_SELECTED,
  IMPORT_EDITS_END,
  LOAD_OPEN_PRODUCTIONS_END,
  NEW_EDIT_END,
  EDIT_EDIT_END,
  ADD_EDIT,
  UPDATE_EDIT,
  REMOVE_EDIT,
  CANCEL_EDIT,
  RESTORE_EDIT_END,
  NEW_TASK_COMMENT_END,
  NEW_TASK_END,
  CREATE_TASKS_END,
  SET_EDIT_SEARCH,
  SET_CURRENT_PRODUCTION,
  DISPLAY_MORE_EDITS,
  SET_EDIT_LIST_SCROLL_POSITION,
  REMOVE_SELECTED_TASK,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  DELETE_TASK_END,
  CLEAR_SELECTED_TASKS,
  SET_PREVIEW,
  SAVE_EDIT_SEARCH_END,
  REMOVE_EDIT_SEARCH_END,
  UPDATE_METADATA_DESCRIPTOR_END,
  LOCK_EDIT,
  UNLOCK_EDIT,
  RESET_ALL,
  CLEAR_SELECTED_EDITS,
  SET_EDIT_SELECTION,
  CHANGE_EDIT_SORT
} from '@/store/mutation-types'
import async from 'async'

const cache = {
  edits: [],
  editIndex: [],
  editMap: new Map()
}

const helpers = {
  getCurrentProduction() {
    return productionsStore.getters.currentProduction(productionsStore.state)
  },
  getTask(taskId) {
    return tasksStore.state.taskMap.get(taskId)
  },
  getTaskStatus(taskStatusId) {
    return taskStatusStore.cache.taskStatusMap.get(taskStatusId)
  },
  getTaskType(taskTypeId) {
    return taskTypesStore.cache.taskTypeMap.get(taskTypeId)
  },
  getPerson(personId) {
    return peopleStore.cache.personMap.get(personId)
  },

  getEditName(edit) {
    return `${edit.name}`
  },

  dateDigit(date) {
    return date.toString().padStart(2, '0')
  },

  populateTask(task, edit) {
    task.name = getTaskTypePriorityOfProd(
      helpers.getTaskType(task.task_type_id),
      helpers.getCurrentProduction()
    ).toString()
    task.task_status_short_name = helpers.getTaskStatus(
      task.task_status_id
    ).short_name

    const editName = helpers.getEditName(edit)
    Object.assign(task, {
      project_id: edit.production_id,
      episode_id: edit.parent_id,
      entity_name: editName,
      entity_type_name: 'Edit',
      entity: {
        id: edit.id,
        preview_file_id: edit.preview_file_id
      }
    })

    return task
  },

  setListStats(state, edits) {
    let timeSpent = 0
    let estimation = 0
    edits
      .filter(e => !e.canceled)
      .forEach(edit => {
        timeSpent += edit.timeSpent
        estimation += edit.estimation
      })
    Object.assign(state, {
      displayedEditsCount: edits.length,
      displayedEditsLength: edits.filter(e => !e.canceled).length,
      displayedEditsTimeSpent: timeSpent,
      displayedEditsEstimation: estimation
    })
  },

  sortValidationColumns(validationColumns, editFilledColumns, taskTypeMap) {
    const columns = [...validationColumns]
    return sortValidationColumns(
      columns,
      taskTypeMap,
      helpers.getCurrentProduction()
    )
  },

  getPeriod(task, detailLevel) {
    const endDateString = helpers.getTaskEndDate(task, detailLevel)
    let period
    if (detailLevel === 'day') {
      period = moment(endDateString, 'YYYY-MM').format('YYYY-MM')
    } else if (detailLevel === 'month') {
      period = moment(endDateString, 'YYYY').format('YYYY')
    } else if (detailLevel === 'week') {
      period = moment(endDateString, 'YYYY-MM-DD').format('GGGG')
    }
    return period
  },

  getDateFromParameters({ detailLevel, year, week, month, day }) {
    if (detailLevel === 'day') {
      return `${year}-${helpers.dateDigit(month)}-${helpers.dateDigit(day)}`
    } else if (detailLevel === 'month') {
      return `${year}-${helpers.dateDigit(month)}`
    } else if (detailLevel === 'week') {
      return `${year}-${week}`
    } else {
      return `${year}`
    }
  },

  getTaskEndDate(task, detailLevel) {
    let endDateString
    if (detailLevel === 'day') {
      endDateString = moment(task.end_date, 'YYYY-MM-DD').format('YYYY-MM-DD')
    } else if (detailLevel === 'month') {
      endDateString = moment(task.end_date, 'YYYY-MM').format('YYYY-MM')
    } else if (detailLevel === 'week') {
      endDateString = moment(task.end_date, 'YYYY-MM-DD').format('GGGG-W')
    }
    return endDateString
  },

  buildResult(
    state,
    {
      editSearch,
      production,
      sorting,
      taskStatusMap,
      taskTypeMap,
      persons,
      taskMap
    }
  ) {
    const taskTypes = Array.from(taskTypeMap.values())
    const taskStatuses = Array.from(taskStatusMap.values())
    const query = editSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters({
      entryIndex: cache.editIndex,
      taskTypes,
      taskStatuses,
      descriptors: production?.descriptors || [],
      persons,
      query
    })
    let result = indexSearch(cache.editIndex, keywords) || cache.edits
    result = applyFilters(result, filters, taskMap)
    result = sortEditResult(result, sorting, taskTypeMap, taskMap)
    cache.result = result

    const limit =
      state.displayedEdits.length > PAGE_SIZE
        ? state.displayedEdits.length
        : PAGE_SIZE
    const displayedEdits = result.slice(0, limit)
    const maxX = displayedEdits.length
    const maxY = state.nbValidationColumns

    state.displayedEdits = displayedEdits
    state.editFilledColumns = getFilledColumns(displayedEdits)
    helpers.setListStats(state, result)
    state.editSearchText = editSearch
    state.editSelectionGrid = buildSelectionGrid(maxX, maxY)
  },

  sortStatColumns(stats, taskTypeMap) {
    const validationColumnsMap = {}
    if (stats.all) {
      Object.keys(stats.all).forEach(entryId => {
        if (entryId !== 'all' && !stats.all[entryId].name) {
          validationColumnsMap[entryId] = true
        }
      })
    }
    const validationColumns = Object.keys(validationColumnsMap)
    return sortValidationColumns(
      validationColumns,
      taskTypeMap,
      helpers.getCurrentProduction()
    )
  }
}

const initialState = {
  editSearchText: '',
  editSearchQueries: [],
  editSorting: [],

  currentEpisode: null,

  isEditDescription: false,
  isEditEstimation: false,
  isEditTime: false,
  isEditResolution: false,

  displayedEdits: [],
  displayedEditsCount: 0,
  displayedEditsLength: 0,
  displayedEditsTimeSpent: 0,
  displayedEditsEstimation: 0,
  editFilledColumns: {},

  editCreated: '',
  editSelectionGrid: {},

  isEditsLoading: false,
  isEditsLoadingError: false,
  editsCsvFormData: null,

  editListScrollPosition: 0,

  editValidationColumns: [],

  selectedEdits: new Map()
}

const state = {
  ...initialState
}

const getters = {
  edits: state => cache.edits,
  editValidationColumns: state => state.editValidationColumns,

  editSearchQueries: state => state.editSearchQueries,
  editMap: state => cache.editMap,
  editSorting: state => state.editSorting,

  isEditDescription: state => state.isEditDescription,
  isEditEstimation: state => state.isEditEstimation,
  isEditTime: state => state.isEditTime,
  isEditResolution: state => state.isEditResolution,

  editSearchText: state => state.editSearchText,
  editSelectionGrid: state => state.editSelectionGrid,

  displayedEdits: state => state.displayedEdits,
  displayedEditsCount: state => state.displayedEditsCount,
  displayedEditsLength: state => state.displayedEditsLength,
  displayedEditsTimeSpent: state => state.displayedEditsTimeSpent,
  displayedEditsEstimation: state => state.displayedEditsEstimation,
  editFilledColumns: state => state.editFilledColumns,

  isEditsLoading: state => state.isEditsLoading,
  isEditsLoadingError: state => state.isEditsLoadingError,
  editCreated: state => state.editCreated,

  isLongEditList: state => cache.editMap.size > 500,
  editsCsvFormData: state => state.editsCsvFormData,
  editListScrollPosition: state => state.editListScrollPosition,

  selectedEdits: state => state.selectedEdits
}

const actions = {
  loadEdits({ commit, dispatch, state, rootGetters }) {
    const production = rootGetters.currentProduction
    const userFilters = rootGetters.userFilters
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const personMap = rootGetters.personMap
    const isTVShow = rootGetters.isTVShow
    let episode = isTVShow ? rootGetters.currentEpisode : null

    if (isTVShow) {
      if (!episode) {
        if (rootGetters.episodes.length > 0) {
          episode =
            rootGetters.episodes.length > 0 ? rootGetters.episodes[0] : null
        } else {
          return Promise.resolve([])
        }
      } else if (['all'].includes(episode.id)) {
        episode = null
      }
    }

    if (!isTVShow && episode) {
      episode = null
    }

    if (state.isEditsLoading) {
      return Promise.resolve([])
    }

    commit(LOAD_EDITS_START)
    return editsApi
      .getEdits(production, episode)
      .then(edits => {
        commit(LOAD_EDITS_END, {
          production,
          edits,
          userFilters,
          personMap,
          taskMap,
          taskTypeMap
        })
        return Promise.resolve(edits)
      })
      .catch(err => {
        console.error('an error occurred while loading edits', err)
        commit(LOAD_EDITS_ERROR)
        return Promise.resolve([])
      })
  },

  /*
   * Function useds mainly to reload edit data after an update or creation
   * event. If the edit was updated a few times ago, it is not reloaded.
   */
  loadEdit({ commit, state, rootGetters }, editId) {
    const edit = rootGetters.editMap.get(editId)
    if (edit?.lock) return

    const personMap = rootGetters.personMap
    const production = rootGetters.currentProduction
    const taskMap = rootGetters.taskMap
    const taskTypeMap = rootGetters.taskTypeMap
    return editsApi
      .getEdit(editId)
      .then(edit => {
        if (cache.editMap.get(edit.id)) {
          commit(UPDATE_EDIT, edit)
        } else {
          commit(ADD_EDIT, {
            edit,
            taskTypeMap,
            taskMap,
            personMap,
            production
          })
        }
      })
      .catch(err => console.error(err))
  },

  newEdit({ commit, dispatch, rootGetters }, edit) {
    const isTVShow = rootGetters.isTVShow
    if (
      cache.edits.find(
        ed =>
          ed.name === edit.name &&
          (!isTVShow || ed.parent_id === edit.parent_id)
      )
    ) {
      return Promise.reject(new Error('Edit already exists'))
    }
    return editsApi.newEdit(edit).then(edit => {
      commit(NEW_EDIT_END, edit)
      const taskTypeIds = rootGetters.productionEditTaskTypeIds
      const createTaskPromises = taskTypeIds.map(taskTypeId =>
        dispatch('createTask', {
          entityId: edit.id,
          projectId: edit.project_id,
          taskTypeId: taskTypeId,
          type: 'edits'
        })
      )
      return func
        .runPromiseAsSeries(createTaskPromises)
        .then(() => Promise.resolve(edit))
        .catch(console.error)
    })
  },

  editEdit({ commit, state }, data) {
    commit(LOCK_EDIT, data)
    commit(EDIT_EDIT_END, data)
    return editsApi.updateEdit(data).finally(() => {
      setTimeout(() => {
        commit(UNLOCK_EDIT, data)
      }, 2000)
    })
  },

  deleteEdit({ commit, state }, edit) {
    return editsApi.deleteEdit(edit).then(() => {
      const previousEdit = cache.editMap.get(edit.id)
      if (
        previousEdit &&
        previousEdit.tasks.length > 0 &&
        !previousEdit.canceled
      ) {
        commit(CANCEL_EDIT, previousEdit)
      } else {
        commit(REMOVE_EDIT, edit)
      }
      return Promise.resolve()
    })
  },

  restoreEdit({ commit, state }, edit) {
    return editsApi.restoreEdit(edit).then(edit => {
      commit(RESTORE_EDIT_END, edit)
      return Promise.resolve(edit)
    })
  },

  uploadEditFile({ commit, state, rootGetters }, toUpdate) {
    const production = rootGetters.currentProduction
    return editsApi
      .postCsv(production, state.editsCsvFormData, toUpdate)
      .then(() => {
        commit(IMPORT_EDITS_END)
        return Promise.resolve()
      })
  },

  displayMoreEdits({ commit, rootGetters }) {
    commit(DISPLAY_MORE_EDITS, {
      taskTypeMap: rootGetters.taskTypeMap,
      taskStatusMap: rootGetters.taskStatusMap,
      taskMap: rootGetters.taskMap,
      production: rootGetters.currentProduction
    })
  },

  initEdits({ dispatch }) {
    dispatch('setLastProductionScreen', 'production-edits')
    return dispatch('loadEdits')
  },

  setEditSearch({ commit, rootGetters }, editSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    commit(SET_EDIT_SEARCH, {
      editSearch,
      persons,
      taskStatusMap,
      taskMap,
      taskTypeMap,
      production
    })
  },

  saveEditSearch({ commit, rootGetters }, searchQuery) {
    if (state.editSearchQueries.some(query => query.name === searchQuery)) {
      return
    }
    const production = rootGetters.currentProduction
    return peopleApi
      .createFilter('edit', searchQuery, searchQuery, production.id, null)
      .then(searchQuery => {
        commit(SAVE_EDIT_SEARCH_END, { searchQuery, production })
        return searchQuery
      })
  },

  removeEditSearch({ commit, rootGetters }, searchQuery) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilter(searchQuery).then(() => {
      commit(REMOVE_EDIT_SEARCH_END, { searchQuery, production })
    })
  },

  getEditsCsvLines({ state, rootGetters }) {
    const production = rootGetters.currentProduction
    const isTVShow = rootGetters.isTVShow
    const organisation = rootGetters.organisation
    const personMap = rootGetters.personMap
    let edits = cache.edits
    if (cache.result && cache.result.length > 0) {
      edits = cache.result
    }
    const lines = edits.map(edit => {
      let editLine = []
      if (isTVShow) editLine.push(edit.episode_name)
      editLine = editLine.concat([edit.name, edit.description || ''])
      sortByName([...production.descriptors])
        .filter(d => d.entity_type === 'Edit')
        .forEach(descriptor => {
          if (descriptor.data_type === 'boolean') {
            editLine.push(
              edit.data[descriptor.field_name]?.toLowerCase() === 'true'
            )
          } else {
            editLine.push(edit.data[descriptor.field_name])
          }
        })
      if (state.isEditTime) {
        editLine.push(minutesToDays(organisation, edit.timeSpent).toFixed(2))
      }
      if (state.isEditEstimation) {
        editLine.push(minutesToDays(organisation, edit.estimation).toFixed(2))
      }
      state.editValidationColumns.forEach(validationColumn => {
        const task = rootGetters.taskMap.get(
          edit.validations.get(validationColumn)
        )
        if (task) {
          editLine.push(task.task_status_short_name)
          editLine.push(
            task.assignees.map(id => personMap.get(id).full_name).join(',')
          )
        } else {
          editLine.push('') // Status
          editLine.push('') // Assignations
        }
      })
      return editLine
    })
    return lines
  },

  loadEditHistory({ commit, state }, editId) {
    return editsApi.loadEditHistory(editId)
  },

  getPersonEdits(
    { commit, state, rootGetters },
    { taskTypeId, detailLevel, personId, year, month, week, day }
  ) {
    const taskStatusMap = rootGetters.taskStatusMap
    const dateString = helpers.getDateFromParameters({
      detailLevel,
      year,
      month,
      week,
      day
    })

    const edits = cache.edits
      .filter(edit => {
        const task = rootGetters.taskMap.get(edit.validations.get(taskTypeId))
        if (task) {
          const taskStatus = taskStatusMap.get(task.task_status_id)
          const endDateString = helpers.getTaskEndDate(task, detailLevel)
          return (
            task &&
            taskStatus.is_done &&
            task.assignees.includes(personId) &&
            endDateString === dateString
          )
        } else {
          return false
        }
      })
      .map(edit => ({
        ...edit,
        full_name: helpers.getEditName(edit)
      }))
    return Promise.resolve(edits)
  },

  changeEditSort({ commit, rootGetters }, sortInfo) {
    const taskStatusMap = rootGetters.taskStatus
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const persons = rootGetters.people
    const production = rootGetters.currentProduction
    const sorting = sortInfo ? [sortInfo] : []
    commit(CHANGE_EDIT_SORT, {
      taskStatusMap,
      taskTypeMap,
      taskMap,
      persons,
      production,
      sorting
    })
  },

  deleteAllEditTasks(
    { commit, dispatch, state },
    { projectId, taskTypeId, selectionOnly }
  ) {
    let taskIds = []
    if (selectionOnly) {
      taskIds = cache.result
        .filter(a => a.validations.get(taskTypeId))
        .map(a => a.validations.get(taskTypeId))
    }
    return dispatch('deleteAllTasks', { projectId, taskTypeId, taskIds })
  },

  setEditSelection({ commit }, { edit, selected }) {
    commit(SET_EDIT_SELECTION, { edit, selected })
  },

  clearSelectedEdits({ commit }) {
    commit(CLEAR_SELECTED_EDITS)
  },

  deleteSelectedEdits({ state, dispatch }) {
    return new Promise((resolve, reject) => {
      let selectedEditIds = [...state.selectedEdits.values()]
        .filter(edit => !edit.canceled)
        .map(edit => edit.id)
      if (selectedEditIds.length === 0) {
        selectedEditIds = [...state.selectedEdits.keys()]
      }
      async.eachSeries(
        selectedEditIds,
        (editId, next) => {
          const edit = cache.editMap.get(editId)
          if (edit) {
            dispatch('deleteEdit', edit)
          }
          next()
        },
        err => {
          if (err) reject(err)
          else {
            resolve()
          }
        }
      )
    })
  }
}

const mutations = {
  [LOAD_EDITS_START](state) {
    cache.edits = []
    cache.result = []
    cache.editIndex = {}
    cache.editMap = new Map()
    state.editValidationColumns = []

    state.isEditsLoading = true
    state.isEditsLoadingError = false

    state.displayedEdits = []
    state.displayedEditsCount = 0
    state.displayedEditsLength = 0
    state.displayedEstimation = 0
    state.editSearchQueries = []

    state.selectedEdits = new Map()
  },

  [LOAD_EDITS_ERROR](state) {
    state.isEditsLoading = false
    state.isEditsLoadingError = true
  },

  [LOAD_EDITS_END](
    state,
    { production, edits, userFilters, taskMap, taskTypeMap, personMap }
  ) {
    const validationColumns = {}
    let isDescription = false
    let isTime = false
    let isEstimation = false
    let isResolution = false
    cache.editMap = new Map()
    edits.forEach(edit => {
      const taskIds = []
      const validations = new Map()
      let timeSpent = 0
      let estimation = 0
      edit.project_name = production.name
      edit.production_id = production.id
      edit.full_name = helpers.getEditName(edit)
      edit.tasks.forEach(task => {
        helpers.populateTask(task, edit, production)
        timeSpent += task.duration
        estimation += task.estimation

        taskMap.set(task.id, task)
        validations.set(task.task_type_id, task.id)
        taskIds.push(task.id)

        const taskType = taskTypeMap.get(task.task_type_id)
        if (!validationColumns[taskType.name]) {
          validationColumns[taskType.name] = taskType.id
        }
        if (task.assignees.length > 1) {
          task.assignees = task.assignees.sort((a, b) => {
            return personMap.get(a).name.localeCompare(personMap.get(b))
          })
        }
      })
      edit.tasks = taskIds
      edit.validations = validations
      edit.timeSpent = timeSpent
      edit.estimation = estimation

      if (!isTime && edit.timeSpent > 0) isTime = true
      if (!isEstimation && edit.estimation > 0) isEstimation = true
      if (!isDescription && edit.description) isDescription = true
      if (!isResolution && edit.resolution) isResolution = true

      cache.editMap.set(edit.id, edit)
    })
    edits = sortEdits(edits)
    cache.edits = edits
    cache.result = edits
    cache.editIndex = buildEditIndex(edits)

    const displayedEdits = edits.slice(0, PAGE_SIZE)
    const filledColumns = getFilledColumns(displayedEdits)

    state.editValidationColumns = helpers.sortValidationColumns(
      Object.values(validationColumns),
      filledColumns,
      taskTypeMap
    )

    state.nbValidationColumns = state.editValidationColumns.length
    state.isEditTime = isTime
    state.isEditEstimation = isEstimation
    state.isEditDescription = isDescription
    state.isEditResolution = isResolution

    state.isEditsLoading = false
    state.isEditsLoadingError = false

    state.displayedEdits = displayedEdits
    state.editFilledColumns = filledColumns

    const maxX = state.displayedEdits.length
    const maxY = state.nbValidationColumns
    state.editSelectionGrid = buildSelectionGrid(maxX, maxY)
    helpers.setListStats(state, edits)

    if (userFilters.edit && userFilters.edit[production.id]) {
      state.editSearchQueries = userFilters.edit[production.id]
    } else {
      state.editSearchQueries = []
    }
  },

  [SAVE_EDIT_SEARCH_END](state, { searchQuery }) {
    state.editSearchQueries.push(searchQuery)
    state.editSearchQueries = sortByName(state.editSearchQueries)
  },

  [REMOVE_EDIT_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.editSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.editSearchQueries.splice(queryIndex, 1)
    }
  },

  [LOAD_EDIT_END](state, { edit, taskTypeMap }) {
    edit.tasks.forEach(task => {
      helpers.populateTask(task, edit)
    })
    edit.tasks = sortTasks(edit.tasks, taskTypeMap)
    cache.editMap.set(edit.id, edit)
  },

  [EDIT_CSV_FILE_SELECTED](state, formData) {
    state.editsCsvFormData = formData
  },
  [IMPORT_EDITS_END](state) {
    state.editsCsvFormData = null
  },

  [LOAD_OPEN_PRODUCTIONS_END](state, projects) {
    state.openProductions = projects
  },

  [EDIT_EDIT_END](state, newEdit) {
    const edit = cache.editMap.get(newEdit.id)

    if (edit) {
      const copyNewEdit = { ...newEdit }
      copyNewEdit.data = { ...edit.data, ...newEdit.data }
      Object.assign(edit, copyNewEdit)
      state.displayedEdits = state.displayedEdits.map(stateEdit => {
        if (stateEdit.id === newEdit.id) {
          return { ...edit }
        }
        return stateEdit
      })
    } else {
      cache.edits.push(newEdit)
      cache.edits = sortEdits(cache.edits)
      cache.editMap.set(newEdit.id, newEdit)

      const maxX = state.displayedEdits.length
      const maxY = state.nbValidationColumns
      state.editSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
    state.editEdit = {
      isLoading: false,
      isError: false
    }
    cache.editIndex = buildEditIndex(cache.edits)
    state.editCreated = newEdit.name

    if (state.editSearchText) {
      helpers.setListStats(state, cache.result)
    } else {
      helpers.setListStats(state, cache.edits)
    }

    if (!newEdit.data) newEdit.data = {}
    if (edit.description && !state.isEditDescription) {
      state.isEditDescription = true
    }
    if (edit.resolution && !state.isEditResolution) {
      state.isEditResolution = true
    }
  },

  [RESTORE_EDIT_END](state, editToRestore) {
    const edit = cache.editMap.get(editToRestore.id)
    edit.canceled = false
    cache.editIndex = buildEditIndex(cache.edits)
  },

  [NEW_TASK_COMMENT_END](state, { comment, taskId }) {},

  [SET_EDIT_SEARCH](state, payload) {
    const sorting = state.editSorting
    payload.sorting = sorting
    helpers.buildResult(state, payload)
  },

  [NEW_EDIT_END](state, edit) {
    edit.production_id = edit.project_id
    edit.preview_file_id = ''

    edit.tasks = []
    edit.validations = new Map()
    edit.data = {}

    cache.edits.push(edit)
    cache.edits = sortEdits(cache.edits)
    state.displayedEdits = cache.edits.slice(0, PAGE_SIZE)
    helpers.setListStats(state, cache.edits)
    state.editFilledColumns = getFilledColumns(state.displayedEdits)
    cache.editMap.set(edit.id, edit)
    cache.editIndex = buildEditIndex(cache.edits)

    const maxX = state.displayedEdits.length
    const maxY = state.nbValidationColumns
    state.editSelectionGrid = buildSelectionGrid(maxX, maxY)
  },

  [CREATE_TASKS_END](state, { tasks }) {
    tasks.forEach(task => {
      if (task) {
        const edit = cache.editMap.get(task.entity_id)
        if (edit) {
          helpers.populateTask(task, edit)
          edit.validations.set(task.task_type_id, task.id)
          edit.tasks.push(task.id)
          const displayedEdit = state.displayedEdits.find(
            displayedEdit => displayedEdit.id === edit.id
          )
          if (displayedEdit) {
            displayedEdit.validations = new Map(edit.validations)
          }
        }
      }
    })
  },

  [DISPLAY_MORE_EDITS](
    state,
    { taskTypeMap, taskStatusMap, taskMap, production }
  ) {
    const edits = cache.result
    const newLength = state.displayedEdits.length + PAGE_SIZE
    if (newLength < edits.length + PAGE_SIZE) {
      state.displayedEdits = edits.slice(
        0,
        state.displayedEdits.length + PAGE_SIZE
      )
      state.editFilledColumns = getFilledColumns(state.displayedEdits)
      const previousX = Object.keys(state.editSelectionGrid).length
      const maxX = state.displayedEdits.length
      const maxY = state.nbValidationColumns
      if (previousX >= 0) {
        state.editSelectionGrid = appendSelectionGrid(
          state.editSelectionGrid,
          previousX,
          maxX,
          maxY
        )
      }
    }
  },

  [SET_CURRENT_PRODUCTION](state, production) {
    state.editSearchText = ''
  },

  [SET_PREVIEW](state, { entityId, taskId, previewId, taskMap }) {
    const edit = state.displayedEdits.find(edit => edit.id === entityId)
    if (edit) {
      edit.preview_file_id = previewId
      edit.tasks.forEach(taskId => {
        const task = taskMap.get(taskId)
        if (task) task.entity.preview_file_id = previewId
      })
    }
  },

  [SET_EDIT_LIST_SCROLL_POSITION](state, scrollPosition) {
    state.editListScrollPosition = scrollPosition
  },

  [REMOVE_SELECTED_TASK](state, validationInfo) {
    if (
      !validationInfo.x &&
      validationInfo.task?.column &&
      cache.editMap.get(validationInfo.task.entity.id)
    ) {
      const entity = validationInfo.task.entity
      const taskType = validationInfo.task.column
      const list = state.displayedEdits.flat()
      validationInfo.x = list.findIndex(e => e.id === entity.id)
      validationInfo.y = state.editValidationColumns.indexOf(taskType.id)
    }
    if (
      state.editSelectionGrid[0] &&
      state.editSelectionGrid[validationInfo.x]
    ) {
      state.editSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [ADD_SELECTED_TASK](state, validationInfo) {
    if (
      state.editSelectionGrid[0] &&
      state.editSelectionGrid[validationInfo.x]
    ) {
      state.editSelectionGrid[validationInfo.x][validationInfo.y] = true
      state.selectedEdits = new Map() // unselect all previously selected lines
    }
  },

  [CLEAR_SELECTED_TASKS](state, validationInfo) {
    if (
      tasksStore.state.nbSelectedValidations > 0 ||
      tasksStore.state.nbSelectedTasks > 0
    ) {
      const tmpGrid = JSON.parse(JSON.stringify(state.editSelectionGrid))
      state.editSelectionGrid = clearSelectionGrid(tmpGrid)
    }
  },

  [NEW_TASK_END](state, { task }) {
    const edit = cache.editMap.get(task.entity_id)
    if (edit && task) {
      task = helpers.populateTask(task, edit)
      // Add Column if it is missing
      if (!state.editValidationColumns.includes(task.task_type_id)) {
        state.editValidationColumns.push(task.task_type_id)
        state.editFilledColumns[task.task_type_id] = true
      }
      // Push task and readds the whole map to activate the realtime display.
      edit.tasks.push(task)
      if (!edit.validations) edit.validations = new Map()
      edit.validations.set(task.task_type_id, task.id)
      const displayedEdit = state.displayedEdits.find(
        displayedEdit => displayedEdit.id === edit.id
      )
      if (displayedEdit) {
        displayedEdit.validations = new Map(edit.validations)
      }
    }
  },

  [DELETE_TASK_END](state, task) {
    const edit = state.displayedEdits.find(edit => edit.id === task.entity_id)
    if (edit) {
      const validations = new Map(edit.validations)
      validations.delete(task.task_type_id)
      delete edit.validations
      edit.validations = validations

      const taskIndex = edit.tasks.findIndex(
        editTaskId => editTaskId === task.id
      )
      edit.tasks.splice(taskIndex, 1)
    }
  },

  [ADD_SELECTED_TASKS](state, selection) {
    let tmpGrid = JSON.parse(JSON.stringify(state.editSelectionGrid))
    selection.forEach(validationInfo => {
      if (!tmpGrid[validationInfo.x]) {
        tmpGrid = appendSelectionGrid(
          tmpGrid,
          Object.keys(tmpGrid).length,
          validationInfo.x + 1,
          state.nbValidationColumns
        )
      }
      if (tmpGrid[validationInfo.x]) {
        tmpGrid[validationInfo.x][validationInfo.y] = true
      }
    })
    state.selectedEdits = new Map() // unselect all previously selected lines
    state.editSelectionGrid = tmpGrid
  },

  [ADD_EDIT](state, { taskTypeMap, taskMap, personMap, production, edit }) {
    const taskIds = []
    const validations = new Map()
    let timeSpent = 0
    let estimation = 0
    edit.project_name = production.name
    edit.production_id = production.id
    edit.tasks.forEach(task => {
      helpers.populateTask(task, edit, production)
      timeSpent += task.duration
      estimation += task.estimation

      taskMap.set(task.id, task)
      validations.set(task.task_type_id, task.id)
      taskIds.push(task.id)

      if (task.assignees.length > 1) {
        task.assignees = task.assignees.sort((a, b) => {
          return personMap.get(a).name.localeCompare(personMap.get(b))
        })
      }
    })
    edit.tasks = taskIds
    edit.validations = validations
    edit.timeSpent = timeSpent
    edit.estimation = estimation

    cache.edits.push(edit)
    cache.edits = sortEdits(cache.edits)
    cache.editMap.set(edit.id, edit)

    state.displayedEdits.push(edit)
    state.displayedEdits = sortEdits(state.displayedEdits)
    state.displayedEditsCount = cache.edits.length
    state.displayedEditsLength = cache.edits.filter(e => !e.canceled).length
    state.editFilledColumns = getFilledColumns(state.displayedEdits)

    const maxX = state.displayedEdits.length
    const maxY = state.nbValidationColumns
    state.editSelectionGrid = buildSelectionGrid(maxX, maxY)
    cache.editMap.set(edit.id, edit)
  },

  [UPDATE_EDIT](state, edit) {
    Object.assign(cache.editMap.get(edit.id), edit)
    cache.editIndex = buildEditIndex(cache.edits)
  },

  [REMOVE_EDIT](state, editToDelete) {
    cache.editMap.delete(editToDelete.id)
    cache.edits = removeModelFromList(cache.edits, editToDelete)
    cache.result = removeModelFromList(cache.result, editToDelete)
    cache.editIndex = buildEditIndex(cache.edits)
    state.displayedEdits = removeModelFromList(
      state.displayedEdits,
      editToDelete
    )
    if (editToDelete.timeSpent && !editToDelete.canceled) {
      state.displayedEditsTimeSpent -= editToDelete.timeSpent
    }
    if (editToDelete.estimation && !editToDelete.canceled) {
      state.displayedEditsEstimation -= editToDelete.estimation
    }
  },

  [CANCEL_EDIT](state, edit) {
    edit.canceled = true
  },

  [CHANGE_EDIT_SORT](
    state,
    { taskStatusMap, taskTypeMap, taskMap, production, sorting, persons }
  ) {
    const editSearch = state.editSearchText
    state.editSorting = sorting
    helpers.buildResult(state, {
      editSearch,
      persons,
      production,
      sorting,
      taskStatusMap,
      taskTypeMap,
      taskMap
    })
  },

  [UPDATE_METADATA_DESCRIPTOR_END](
    state,
    { descriptor, previousDescriptorFieldName }
  ) {
    if (
      descriptor.entity_type === 'Edit' &&
      previousDescriptorFieldName &&
      previousDescriptorFieldName !== descriptor.field_name
    ) {
      cache.edits.forEach(edit => {
        const data = { ...edit.data }
        data[descriptor.field_name] = data[previousDescriptorFieldName]
        delete data[previousDescriptorFieldName]
        edit.data = data
      })
    }
  },

  [LOCK_EDIT](state, edit) {
    edit = cache.editMap.get(edit.id)
    if (edit) {
      edit.lock = !edit.lock ? 1 : edit.lock + 1
    }
  },

  [UNLOCK_EDIT](state, edit) {
    edit = cache.editMap.get(edit.id)
    if (edit) {
      edit.lock = !edit.lock ? 0 : edit.lock - 1
    }
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })

    cache.edits = []
    cache.result = []
    cache.editIndex = {}
  },

  [SET_EDIT_SELECTION](state, { edit, selected }) {
    if (!selected && state.selectedEdits.has(edit.id)) {
      state.selectedEdits.delete(edit.id)
    }
    if (selected) {
      state.selectedEdits.set(edit.id, edit)
      const maxX = state.displayedEdits.length
      const maxY = state.nbValidationColumns
      // unselect previously selected tasks
      state.editSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
  },

  [SORT_VALIDATION_COLUMNS](state, taskTypeMap) {
    const columns = [...state.editValidationColumns]
    state.editValidationColumns = []
    state.editValidationColumns = helpers.sortValidationColumns(
      columns,
      state.editFilledColumns,
      taskTypeMap
    )
  },

  [CLEAR_SELECTED_EDITS](state) {
    state.selectedEdits = new Map()
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}

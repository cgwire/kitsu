import moment from 'moment'
import peopleApi from '@/store/api/people'
import shotsApi from '@/store/api/shots'

import episodeStore from '@/store/modules/episodes'
import peopleStore from '@/store/modules/people'
import productionsStore from '@/store/modules/productions'
import sequenceStore from '@/store/modules/sequences'
import tasksStore from '@/store/modules/tasks'
import taskStatusStore from '@/store/modules/taskstatus'
import taskTypesStore from '@/store/modules/tasktypes'

import func from '@/lib/func'
import { PAGE_SIZE } from '@/lib/pagination'
import { getTaskTypePriorityOfProd } from '@/lib/productions'
import {
  sortByName,
  sortShotResult,
  sortShots,
  sortTasks,
  sortValidationColumns
} from '@/lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'
import {
  getFilledColumns,
  groupEntitiesByParents,
  removeModelFromList
} from '@/lib/models'
import { minutesToDays } from '@/lib/time'
import { buildShotIndex, indexSearch } from '@/lib/indexing'
import { applyFilters, getFilters, getKeyWords } from '@/lib/filtering'

import {
  CLEAR_SHOTS,
  LOAD_SHOTS_START,
  LOAD_SHOTS_ERROR,
  LOAD_SHOTS_END,
  SORT_VALIDATION_COLUMNS,
  SET_CURRENT_EPISODE,
  LOAD_SHOT_END,
  SHOT_CSV_FILE_SELECTED,
  IMPORT_SHOTS_END,
  LOAD_OPEN_PRODUCTIONS_END,
  NEW_SHOT_END,
  EDIT_SHOT_END,
  ADD_SHOT,
  UPDATE_SHOT,
  REMOVE_SHOT,
  CANCEL_SHOT,
  RESTORE_SHOT_END,
  NEW_TASK_END,
  CREATE_TASKS_END,
  SET_SHOT_SEARCH,
  SET_CURRENT_PRODUCTION,
  DISPLAY_MORE_SHOTS,
  SET_SHOT_LIST_SCROLL_POSITION,
  REMOVE_SELECTED_TASK,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  DELETE_TASK_END,
  CLEAR_SELECTED_TASKS,
  SET_PREVIEW,
  SAVE_SHOT_SEARCH_END,
  SAVE_SHOT_SEARCH_FILTER_GROUP_END,
  REMOVE_SHOT_SEARCH_END,
  REMOVE_SHOT_SEARCH_FILTER_GROUP_END,
  CHANGE_SHOT_SORT,
  UPDATE_METADATA_DESCRIPTOR_END,
  LOCK_SHOT,
  UNLOCK_SHOT,
  RESET_ALL,
  CLEAR_SELECTED_SHOTS,
  SET_SHOT_SELECTION
} from '@/store/mutation-types'
import async from 'async'

const cache = {
  shots: [],
  shotMap: new Map(),
  shotIndex: []
}

const helpers = {
  getCurrentProduction() {
    return productionsStore.getters.currentProduction(productionsStore.state)
  },
  getTask(taskId) {
    return tasksStore.cache.taskMap.get(taskId)
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

  getShotName(shot) {
    let shotName = `${shot.sequence_name} / ${shot.name}`
    if (shot.episode_name) {
      shotName = `${shot.episode_name} / ${shotName}`
    }
    return shotName
  },

  dateDigit(date) {
    return date.toString().padStart(2, '0')
  },

  populateTask(task, shot) {
    task.name = getTaskTypePriorityOfProd(
      helpers.getTaskType(task.task_type_id),
      helpers.getCurrentProduction()
    ).toString()
    task.task_status_short_name = helpers.getTaskStatus(
      task.task_status_id
    ).short_name

    const shotName = helpers.getShotName(shot)
    Object.assign(task, {
      project_id: shot.production_id,
      entity_name: shotName,
      entity_type_name: 'Shot',
      sequence_name: shot.sequence_name,
      entity: {
        id: shot.id,
        preview_file_id: shot.preview_file_id
      }
    })

    return task
  },

  setListStats(state, shots) {
    let timeSpent = 0
    let estimation = 0
    let nbFrames = 0
    let nbDrawings = 0
    shots
      .filter(s => !s.canceled)
      .forEach(shot => {
        timeSpent += shot.timeSpent
        estimation += shot.estimation
        nbFrames += shot.nb_frames
        nbDrawings += shot.nb_drawings || 0
      })
    Object.assign(state, {
      displayedShotsCount: shots.length,
      displayedShotsLength: shots.filter(s => !s.canceled).length,
      displayedShotsTimeSpent: timeSpent,
      displayedShotsEstimation: estimation,
      displayedShotsFrames: nbFrames,
      displayedShotsDrawings: nbDrawings
    })
  },

  sortValidationColumns(validationColumns, shotFilledColumns, taskTypeMap) {
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
      shotSearch,
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

    const query = shotSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters({
      entryIndex: cache.shotIndex,
      assetTypes: [],
      taskTypes,
      taskStatuses,
      descriptors: production?.descriptors || [],
      persons,
      query
    })
    let result = indexSearch(cache.shotIndex, keywords) || cache.shots
    result = applyFilters(result, filters, taskMap)
    result = sortShotResult(result, sorting, taskTypeMap, taskMap)
    cache.result = result

    const limit =
      state.displayedShots.length > PAGE_SIZE
        ? state.displayedShots.length
        : PAGE_SIZE
    const displayedShots = result.slice(0, limit)
    const maxX = displayedShots.length
    const maxY = state.nbValidationColumns

    helpers.setListStats(state, result)
    Object.assign(state, {
      displayedShots: displayedShots,
      shotFilledColumns: getFilledColumns(displayedShots),
      shotSearchText: shotSearch,
      shotSelectionGrid: buildSelectionGrid(maxX, maxY)
    })
  }
}

const initialState = {
  shotSearchText: '',
  shotSearchQueries: [],
  shotSearchFilterGroups: [],
  shotSorting: [],

  isFps: false,
  isFrames: false,
  isFrameIn: false,
  isFrameOut: false,
  isMaxRetakes: false,
  isResolution: false,
  isShotDescription: false,
  isShotEstimation: false,
  isShotTime: false,

  displayedShots: [],
  displayedShotsCount: 0,
  displayedShotsLength: 0,
  displayedShotsTimeSpent: 0,
  displayedShotsEstimation: 0,
  displayedShotsFrames: 0,
  displayedShotsDrawings: 0,
  shotFilledColumns: {},

  shotCreated: '',
  shotSelectionGrid: {},

  isShotsLoading: false,
  isShotsLoadingError: false,
  shotsCsvFormData: null,

  shotListScrollPosition: 0,

  shotValidationColumns: [],

  selectedShots: new Map()
}

const state = {
  ...initialState
}

const getters = {
  shots: state => cache.shots,
  shotValidationColumns: state => state.shotValidationColumns,

  shotSearchQueries: state => state.shotSearchQueries,
  shotSearchFilterGroups: state => state.shotSearchFilterGroups,
  shotMap: state => cache.shotMap,
  shotSorting: state => state.shotSorting,

  isFps: state => state.isFps,
  isFrames: state => state.isFrames,
  isFrameIn: state => state.isFrameIn,
  isFrameOut: state => state.isFrameOut,
  isMaxRetakes: state => state.isMaxRetakes,
  isResolution: state => state.isResolution,
  isShotDescription: state => state.isShotDescription,
  isShotEstimation: state => state.isShotEstimation,
  isShotTime: state => state.isShotTime,

  shotSearchText: state => state.shotSearchText,
  shotSelectionGrid: state => state.shotSelectionGrid,

  displayedShots: state => state.displayedShots,
  displayedShotsCount: state => state.displayedShotsCount,
  displayedShotsLength: state => state.displayedShotsLength,
  displayedShotsTimeSpent: state => state.displayedShotsTimeSpent,
  displayedShotsEstimation: state => state.displayedShotsEstimation,
  displayedShotsFrames: state => state.displayedShotsFrames,
  displayedShotsDrawings: state => state.displayedShotsDrawings,
  shotFilledColumns: state => state.shotFilledColumns,

  displayedShotsBySequence: state => {
    return groupEntitiesByParents(state.displayedShots, 'sequence_name')
  },

  isShotsLoading: state => state.isShotsLoading,
  isShotsLoadingError: state => state.isShotsLoadingError,
  shotCreated: state => state.shotCreated,

  isLongShotList: state => cache.shotMap.size > 500,
  shotsCsvFormData: state => state.shotsCsvFormData,
  shotListScrollPosition: state => state.shotListScrollPosition,

  shotsByEpisode: state => {
    const shotsBySequence = []
    let sequenceShots = []
    let previousShot = null

    Array.from(cache.shotMap.values()).forEach(shot => {
      if (previousShot && shot.sequence_name !== previousShot.sequence_name) {
        shotsBySequence.push(sequenceShots.slice(0))
        sequenceShots = []
      }
      sequenceShots.push(shot)
      previousShot = shot
    })
    shotsBySequence.push(sortShots(sequenceShots))

    return shotsBySequence
  },
  selectedShots: state => state.selectedShots
}

const actions = {
  getPendingShots({ commit }, daily = false) {
    const shots = []
    cache.shots.forEach(shot => {
      let isPending = false
      shot.tasks.forEach(taskId => {
        const task = tasksStore.state.taskMap.get(taskId)
        if (!isPending) {
          const taskStatus = helpers.getTaskStatus(task.task_status_id)
          if (daily) {
            if (task.last_comment_date) {
              const lastCommentDate = moment(task.last_comment_date)
              const yesterday = moment().subtract(1, 'days')
              isPending =
                taskStatus.is_feedback_request &&
                lastCommentDate.isAfter(yesterday)
            }
          } else {
            isPending = taskStatus.is_feedback_request
          }
        }
      })
      if (isPending) shots.push(shot)
    })
    return shots
  },

  loadShots({ commit, dispatch, state, rootGetters }, callback) {
    const production = rootGetters.currentProduction
    const episodes = rootGetters.episodes
    const userFilters = rootGetters.userFilters
    const userFilterGroups = rootGetters.userFilterGroups
    const taskTypeMap = rootGetters.taskTypeMap
    const episodeMap = episodeStore.cache.episodeMap
    const personMap = rootGetters.personMap
    const isTVShow = rootGetters.isTVShow
    let episode = isTVShow ? rootGetters.currentEpisode : null

    if (episode && ['all', 'main'].includes(episode.id)) {
      // If it's a wide episode, we just store it. There isn't anything to
      // load because we don't have episode defined.
      commit(SET_CURRENT_EPISODE, episode.id)
      if (callback) return callback()
    } else if (isTVShow && !episode) {
      // If it's tv show and if we don't have any episode set, we use the first
      // one.
      episode = episodes.length > 0 ? episodes[0] : null
      if (!episode && callback) return callback()
      if (!episode) return
      commit(SET_CURRENT_EPISODE, episode.id)
    }

    if (isTVShow && !episode && episodes.length === 0) {
      if (callback) return callback()
    }

    if (!isTVShow && episode) {
      commit(SET_CURRENT_EPISODE, null)
    }

    if (state.isShotsLoading) {
      if (callback) return callback()
    }

    commit(LOAD_SHOTS_START)
    return dispatch('loadSequencesWithTasks')
      .then(() => {
        return shotsApi.getShots(production, episode)
      })
      .then(shots => {
        if (
          !isTVShow ||
          shots.length === 0 ||
          shots[0].episode_id === rootGetters.currentEpisode.id
        ) {
          const sequenceMap = sequenceStore.cache.sequenceMap
          const taskMap = rootGetters.taskMap
          commit(LOAD_SHOTS_END, {
            production,
            shots,
            userFilters,
            userFilterGroups,
            taskTypeMap,
            taskMap,
            personMap,
            sequenceMap,
            episodeMap
          })
        }
        if (callback) callback()
      })
      .catch(err => {
        commit(LOAD_SHOTS_ERROR)
        console.error(err)
        if (callback) callback(err)
      })
  },

  /*
   * Function useds mainly to reload shot data after an update or creation
   * event. If the shot was updated a few times ago, it is not reloaded.
   */
  loadShot({ commit, state, rootGetters }, shotId) {
    const shot = rootGetters.shotMap.get(shotId)
    if (shot?.lock) return

    const personMap = rootGetters.personMap
    const production = rootGetters.currentProduction
    const taskMap = rootGetters.taskMap
    const taskTypeMap = rootGetters.taskTypeMap
    return shotsApi
      .getShot(shotId)
      .then(shot => {
        if (cache.shotMap.get(shot.id)) {
          commit(UPDATE_SHOT, shot)
        } else {
          shot.tasks.forEach(task => {
            commit(NEW_TASK_END, { task })
          })
          commit(ADD_SHOT, {
            shot,
            taskTypeMap,
            taskMap,
            personMap,
            production
          })
        }
      })
      .catch(err => console.error(err))
  },

  newShot({ commit, dispatch, rootGetters }, shot) {
    return shotsApi.newShot(shot).then(shot => {
      commit(NEW_SHOT_END, { shot })
      const taskTypeIds = rootGetters.productionShotTaskTypeIds
      const createTaskPromises = taskTypeIds.map(taskTypeId =>
        dispatch('createTask', {
          entityId: shot.id,
          projectId: shot.project_id,
          taskTypeId: taskTypeId,
          type: 'shots'
        })
      )
      return func
        .runPromiseAsSeries(createTaskPromises)
        .then(() => Promise.resolve(shot))
        .catch(console.error)
    })
  },

  editShot({ commit, rootGetters }, data) {
    commit(LOCK_SHOT, data)
    commit(EDIT_SHOT_END, {
      newShot: data,
      sequences: rootGetters.displayedSequences
    })
    return shotsApi.updateShot(data).finally(() => {
      setTimeout(() => {
        commit(UNLOCK_SHOT, data)
      }, 2000)
    })
  },

  deleteShot({ commit, state }, shot) {
    return shotsApi.deleteShot(shot).then(() => {
      const previousShot = cache.shotMap.get(shot.id)
      if (
        previousShot &&
        previousShot.tasks.length > 0 &&
        !previousShot.canceled
      ) {
        commit(CANCEL_SHOT, previousShot)
      } else {
        commit(REMOVE_SHOT, shot)
      }
      return Promise.resolve()
    })
  },

  restoreShot({ commit, state }, shot) {
    return shotsApi.restoreShot(shot).then(shot => {
      commit(RESTORE_SHOT_END, shot)
      return Promise.resolve(shot)
    })
  },

  uploadShotFile({ commit, state, rootGetters }, toUpdate) {
    const production = rootGetters.currentProduction
    return shotsApi
      .postCsv(production, state.shotsCsvFormData, toUpdate)
      .then(() => {
        commit(IMPORT_SHOTS_END)
        return Promise.resolve()
      })
  },

  uploadEdlFile({ rootGetters }, { edl_file, namingConvention, matchCase }) {
    const production = rootGetters.currentProduction
    const episode = rootGetters.isTVShow ? rootGetters.currentEpisode : null
    return shotsApi
      .postEdl(production, edl_file, namingConvention, matchCase, episode)
      .then(() => {
        return Promise.resolve()
      })
  },

  displayMoreShots({ commit, rootGetters }) {
    commit(DISPLAY_MORE_SHOTS, {
      taskTypeMap: taskTypesStore.cache.taskTypeMap,
      taskStatusMap: tasksStore.cache.taskStatusMap,
      taskMap: rootGetters.taskMap,
      production: rootGetters.currentProduction
    })
  },

  setShotSearch({ commit, rootGetters }, shotSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    commit(SET_SHOT_SEARCH, {
      shotSearch,
      persons,
      taskStatusMap,
      taskMap,
      taskTypeMap,
      production
    })
  },

  saveShotSearch({ commit, rootGetters }, searchQuery) {
    if (state.shotSearchQueries.some(query => query.name === searchQuery)) {
      return
    }
    const production = rootGetters.currentProduction
    return peopleApi
      .createFilter('shot', searchQuery, searchQuery, production.id, null)
      .then(searchQuery => {
        commit(SAVE_SHOT_SEARCH_END, { searchQuery, production })
        return searchQuery
      })
  },

  saveShotSearchFilterGroup({ commit, state, rootGetters }, filterGroup) {
    const groupExist = state.shotSearchFilterGroups.some(
      query => query.name === filterGroup.name
    )
    if (groupExist) {
      return
    }

    const production = rootGetters.currentProduction
    return peopleApi
      .createFilterGroup(
        'shot',
        filterGroup.name,
        filterGroup.color,
        production.id,
        filterGroup.is_shared,
        filterGroup.department_id
      )
      .then(filterGroup => {
        commit(SAVE_SHOT_SEARCH_FILTER_GROUP_END, { filterGroup, production })
        return filterGroup
      })
  },

  removeShotSearch({ commit, rootGetters }, searchQuery) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilter(searchQuery).then(() => {
      commit(REMOVE_SHOT_SEARCH_END, { searchQuery, production })
    })
  },

  removeShotSearchFilterGroup({ commit, rootGetters }, filterGroup) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilterGroup(filterGroup).then(() => {
      commit(REMOVE_SHOT_SEARCH_FILTER_GROUP_END, { filterGroup, production })
    })
  },

  getShotsCsvLines({ state, rootGetters }) {
    const production = rootGetters.currentProduction
    const isTVShow = rootGetters.isTVShow
    const organisation = rootGetters.organisation
    const personMap = rootGetters.personMap
    let shots = cache.shots
    if (cache.result && cache.result.length > 0) {
      shots = cache.result
    }
    const lines = shots.map(shot => {
      let shotLine = []
      if (isTVShow)
        shotLine.push(rootGetters.episodeMap.get(shot.episode_id).name)
      shotLine = shotLine.concat([
        shot.sequence_name,
        shot.name,
        shot.description
      ])
      sortByName([...production.descriptors])
        .filter(d => d.entity_type === 'Shot')
        .forEach(descriptor => {
          if (descriptor.data_type === 'boolean') {
            shotLine.push(
              shot.data[descriptor.field_name]?.toLowerCase() === 'true'
            )
          } else {
            shotLine.push(shot.data[descriptor.field_name])
          }
        })
      if (state.isShotTime) {
        shotLine.push(minutesToDays(organisation, shot.timeSpent).toFixed(2))
      }
      if (state.isShotEstimation) {
        shotLine.push(minutesToDays(organisation, shot.estimation).toFixed(2))
      }
      if (state.isFrames) shotLine.push(shot.nb_frames)
      if (state.isFrameIn) shotLine.push(shot.data.frame_in)
      if (state.isFrameOut) shotLine.push(shot.data.frame_out)
      if (state.isFps) shotLine.push(shot.data.fps)
      if (state.isResolution) shotLine.push(shot.data.resolution)
      if (state.isMaxRetakes) shotLine.push(shot.data.max_retakes)
      state.shotValidationColumns.forEach(validationColumn => {
        const task = rootGetters.taskMap.get(
          shot.validations.get(validationColumn)
        )
        if (task) {
          shotLine.push(task.task_status_short_name)
          shotLine.push(
            task.assignees.map(id => personMap.get(id).full_name).join(',')
          )
        } else {
          shotLine.push('') // Status
          shotLine.push('') // Assignations
        }
      })
      return shotLine
    })
    return lines
  },

  loadShotHistory({ commit, state }, shotId) {
    return shotsApi.loadShotHistory(shotId)
  },

  computeQuota(
    { commit, state, rootGetters },
    { taskTypeId, personId, detailLevel, countMode, computeMode }
  ) {
    const production = rootGetters.currentProduction
    return shotsApi.getQuotas(
      production.id,
      taskTypeId,
      personId,
      detailLevel,
      computeMode
    )
  },

  changeShotSort({ commit, rootGetters }, sortInfo) {
    const taskStatusMap = rootGetters.taskStatus
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const persons = rootGetters.people
    const production = rootGetters.currentProduction
    const sorting = sortInfo ? [sortInfo] : []
    commit(CHANGE_SHOT_SORT, {
      taskStatusMap,
      taskTypeMap,
      taskMap,
      persons,
      production,
      sorting
    })
  },

  deleteAllShotTasks(
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

  setShotSelection({ commit }, { shot, selected }) {
    commit(SET_SHOT_SELECTION, { shot, selected })
  },

  clearSelectedShots({ commit }) {
    commit(CLEAR_SELECTED_SHOTS)
  },

  deleteSelectedShots({ state, dispatch }) {
    return new Promise((resolve, reject) => {
      let selectedShotIds = [...state.selectedShots.values()]
        .filter(shot => !shot.canceled)
        .map(shot => shot.id)
      if (selectedShotIds.length === 0) {
        selectedShotIds = [...state.selectedShots.keys()]
      }
      async.eachSeries(
        selectedShotIds,
        (shotId, next) => {
          const shot = cache.shotMap.get(shotId)
          if (shot) {
            dispatch('deleteShot', shot)
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
  },

  async setNbFramesFromTaskTypePreviews(
    { commit, rootGetters },
    { taskTypeId, productionId, episodeId }
  ) {
    const shotNbFrames = await shotsApi.setNbFramesFromTaskTypePreviews(
      taskTypeId,
      productionId,
      episodeId
    )
    shotNbFrames.forEach(shot => {
      commit(UPDATE_SHOT, shot)
    })
    return shotNbFrames
  }
}

const mutations = {
  [CLEAR_SHOTS](state) {
    cache.shots = []
    cache.result = []
    cache.shotIndex = {}
    cache.shotMap = new Map()

    state.displayedShots = []
    state.displayedShotsCount = 0
    state.displayedShotsLength = 0
    state.displayedTimeSpent = 0
    state.displayedEstimation = 0
    state.displayedFrames = 0
    state.shotSearchQueries = []
    state.shotSearchFilterGroups = []

    state.selectedShots = new Map()
  },

  [LOAD_SHOTS_START](state) {
    cache.shots = []
    cache.result = []
    cache.shotIndex = {}
    cache.shotMap = new Map()
    state.shotValidationColumns = []

    state.isShotsLoading = true
    state.isShotsLoadingError = false

    state.displayedShots = []
    state.displayedShotsCount = 0
    state.displayedShotsLength = 0
    state.displayedEstimation = 0
    state.displayedFrames = 0
    state.shotSearchQueries = []
    state.shotSearchFilterGroups = []

    state.selectedShots = new Map()
  },

  [LOAD_SHOTS_ERROR](state) {
    state.isShotsLoading = false
    state.isShotsLoadingError = true
  },

  [LOAD_SHOTS_END](
    state,
    {
      production,
      shots,
      userFilters,
      userFilterGroups,
      taskMap,
      taskTypeMap,
      personMap,
      episodeMap,
      sequenceMap
    }
  ) {
    const validationColumns = {}
    let isFps = false
    let isFrames = false
    let isFrameIn = false
    let isFrameOut = false
    let isDescription = false
    let isTime = false
    let isEstimation = false
    let isMaxRetakes = false
    let isResolution = false
    // cache.shotMap = new Map()
    shots.forEach(shot => {
      const taskIds = []
      const validations = new Map()
      let timeSpent = 0
      let estimation = 0
      const sequence = sequenceMap.get(shot.sequence_id)
      const episode = episodeMap.get(shot.episode_id)
      shot.sequence_name = sequence?.name || ''
      shot.episode_name = episode?.name || ''
      shot.project_name = production.name
      shot.production_id = production.id
      shot.full_name = helpers.getShotName(shot)
      shot.nb_drawings = shot.nb_drawings || 0
      shot.tasks.forEach(task => {
        helpers.populateTask(task, shot, production)
        timeSpent += task.duration
        estimation += task.estimation
        task.episode_id = shot.episode_id
        shot.nb_drawings += task.nb_drawings || 0

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
      shot.tasks = taskIds
      shot.validations = validations
      shot.timeSpent = timeSpent
      shot.estimation = estimation

      if (!isFps && shot.data.fps) isFps = true
      if (!isFrames && shot.nb_frames) isFrames = true
      if (!isFrameIn && shot.data.frame_in != null) isFrameIn = true
      if (!isFrameOut && shot.data.frame_out) isFrameOut = true
      if (!isTime && shot.timeSpent > 0) isTime = true
      if (!isEstimation && shot.estimation > 0) isEstimation = true
      if (!isDescription && shot.description) isDescription = true
      if (!isResolution && shot.data.resolution) isResolution = true
      if (!isMaxRetakes && shot.data.max_retakes) isMaxRetakes = true

      cache.shotMap.set(shot.id, shot)
    })
    shots = sortShots(shots)
    cache.shots = shots
    cache.result = shots
    cache.shotIndex = buildShotIndex(shots)

    const displayedShots = shots.slice(0, PAGE_SIZE)
    const filledColumns = getFilledColumns(displayedShots)

    state.shotValidationColumns = helpers.sortValidationColumns(
      Object.values(validationColumns),
      filledColumns,
      taskTypeMap
    )

    state.nbValidationColumns = state.shotValidationColumns.length
    state.isFps = isFps
    state.isFrames = isFrames
    state.isFrameIn = isFrameIn
    state.isFrameOut = isFrameOut
    state.isShotTime = isTime
    state.isMaxRetakes = isMaxRetakes
    state.isResolution = isResolution
    state.isShotEstimation = isEstimation
    state.isShotDescription = isDescription

    state.isShotsLoading = false
    state.isShotsLoadingError = false

    state.displayedShots = displayedShots
    state.shotFilledColumns = filledColumns

    const maxX = state.displayedShots.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)
    helpers.setListStats(state, shots)

    state.shotSearchQueries = userFilters.shot?.[production.id] || []
    state.shotSearchFilterGroups = userFilterGroups?.shot?.[production.id] || []
  },

  [SAVE_SHOT_SEARCH_END](state, { searchQuery }) {
    state.shotSearchQueries.push(searchQuery)
    state.shotSearchQueries = sortByName(state.shotSearchQueries)
  },

  [SAVE_SHOT_SEARCH_FILTER_GROUP_END](state, { filterGroup }) {
    if (!state.shotSearchFilterGroups.includes(filterGroup)) {
      state.shotSearchFilterGroups.push(filterGroup)
      state.shotSearchFilterGroups = sortByName(state.shotSearchFilterGroups)
    }
  },

  [REMOVE_SHOT_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.shotSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.shotSearchQueries.splice(queryIndex, 1)
    }
  },

  [REMOVE_SHOT_SEARCH_FILTER_GROUP_END](state, { filterGroup }) {
    const groupIndex = state.shotSearchFilterGroups.findIndex(
      query => query.name === filterGroup.name
    )
    if (groupIndex >= 0) {
      state.shotSearchFilterGroups.splice(groupIndex, 1)
    }
  },

  [LOAD_SHOT_END](state, { shot, taskTypeMap }) {
    shot.tasks.forEach(task => {
      helpers.populateTask(task, shot)
    })
    shot.tasks = sortTasks(shot.tasks, taskTypeMap)
    cache.shotMap.set(shot.id, shot)
  },

  [SHOT_CSV_FILE_SELECTED](state, formData) {
    state.shotsCsvFormData = formData
  },
  [IMPORT_SHOTS_END](state) {
    state.shotsCsvFormData = null
  },

  [LOAD_OPEN_PRODUCTIONS_END](state, projects) {
    state.openProductions = projects
  },

  [EDIT_SHOT_END](state, { newShot, sequences }) {
    const shot = cache.shotMap.get(newShot.id)
    const sequence = sequences.find(
      sequence => sequence.id === newShot.parent_id
    )
    if (sequence) newShot.sequence_name = sequence.name

    if (shot) {
      const copyNewShot = { ...newShot }
      copyNewShot.data = { ...shot.data, ...newShot.data }
      Object.assign(shot, copyNewShot)
      state.displayedShots = state.displayedShots.map(stateShot => {
        if (stateShot.id === newShot.id) {
          return { ...shot }
        }
        return stateShot
      })
    } else {
      cache.shots.push(newShot)
      cache.shots = sortShots(cache.shots)
      cache.shotMap.set(newShot.id, newShot)
      const maxX = state.displayedShots.length
      const maxY = state.nbValidationColumns
      state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
    cache.shotIndex = buildShotIndex(cache.shots)
    state.shotCreated = newShot.name

    if (state.shotSearchText) {
      helpers.setListStats(state, cache.result)
    } else {
      helpers.setListStats(state, cache.shots)
    }

    if (!newShot.data) newShot.data = {}
    if (newShot.data.fps && !state.isFps) state.isFps = true
    if (newShot.nb_frames && !state.isFrames) state.isFrames = true
    if (newShot.data.frame_in && !state.isFrameIn != null)
      state.isFrameIn = true
    if (newShot.data.frame_out && !state.isFrameOut) state.isFrameOut = true
    if (newShot.data.resolution && !state.isResolution) {
      state.isResolution = true
    }
    if (newShot.data.max_retakes && !state.isMaxRetakes) {
      state.isMaxRetakes = true
    }
    if (shot.description && !state.isShotDescription) {
      state.isShotDescription = true
    }
  },

  [RESTORE_SHOT_END](state, shotToRestore) {
    const shot = cache.shotMap.get(shotToRestore.id)
    shot.canceled = false
    cache.shotIndex = buildShotIndex(cache.shots)
    state.displayedShotsLength = cache.result.filter(s => !s.canceled).length
  },

  [SET_SHOT_SEARCH](state, payload) {
    const sorting = state.shotSorting
    payload.sorting = sorting
    helpers.buildResult(state, payload)
  },

  [NEW_SHOT_END](state, { shot, episodeMap }) {
    const sequence = sequenceStore.cache.sequenceMap.get(shot.parent_id)
    const episode = episodeStore.cache.episodeMap.get(sequence.parent_id)
    shot.production_id = shot.project_id
    shot.sequence_name = sequence.name
    shot.sequence_id = sequence.id
    shot.episode_name = episode ? episode.name : null
    shot.episode_id = episode ? episode.id : null
    shot.preview_file_id = ''

    shot.tasks = []
    shot.validations = new Map()
    shot.data = {}

    cache.shots.push(shot)
    cache.shots = sortShots(cache.shots)
    state.displayedShots = cache.shots.slice(0, PAGE_SIZE)
    helpers.setListStats(state, cache.shots)
    state.shotFilledColumns = getFilledColumns(state.displayedShots)
    cache.shotMap.set(shot.id, shot)
    cache.shotIndex = buildShotIndex(cache.shots)

    const maxX = state.displayedShots.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)

    if (shot.data.fps) state.isFps = true
    if (shot.nb_frames) state.isFrames = true
    if (shot.data.frame_in != null) state.isFrameIn = true
    if (shot.data.frame_out) state.isFrameOut = true
    if (shot.data.resolution) state.isResolution = true
    if (shot.data.max_retakes) state.isMaxRetakes = true
  },

  [CREATE_TASKS_END](state, { tasks }) {
    tasks.forEach(task => {
      if (task) {
        const shot = cache.shotMap.get(task.entity_id)
        if (shot) {
          helpers.populateTask(task, shot)
          shot.validations.set(task.task_type_id, task.id)
          shot.tasks.push(task.id)
        }
        const displayedShot = state.displayedShots.find(
          s => s.id === task.entity_id
        )
        if (displayedShot) {
          displayedShot.validations = new Map(shot.validations)
        }
      }
    })
  },

  [DISPLAY_MORE_SHOTS](
    state,
    { taskTypeMap, taskStatusMap, taskMap, production }
  ) {
    const shots = cache.result
    const newLength = state.displayedShots.length + PAGE_SIZE
    if (newLength < shots.length + PAGE_SIZE) {
      state.displayedShots = shots.slice(
        0,
        state.displayedShots.length + PAGE_SIZE
      )
      state.shotFilledColumns = getFilledColumns(state.displayedShots)
      const previousX = Object.keys(state.shotSelectionGrid).length
      const maxX = state.displayedShots.length
      const maxY = state.nbValidationColumns
      if (previousX >= 0) {
        state.shotSelectionGrid = appendSelectionGrid(
          state.shotSelectionGrid,
          previousX,
          maxX,
          maxY
        )
      }
    }
  },

  [SET_CURRENT_PRODUCTION](state, production) {
    state.shotSearchText = ''
  },

  [SET_PREVIEW](state, { entityId, taskId, previewId, taskMap }) {
    const shot = state.displayedShots.find(s => s.id === entityId)
    if (shot) {
      shot.preview_file_id = previewId
      shot.tasks.forEach(taskId => {
        const task = taskMap.get(taskId)
        if (task) task.entity.preview_file_id = previewId
      })
    }
  },

  [SET_SHOT_LIST_SCROLL_POSITION](state, scrollPosition) {
    state.shotListScrollPosition = scrollPosition
  },

  [REMOVE_SELECTED_TASK](state, validationInfo) {
    if (
      !validationInfo.x &&
      validationInfo.task?.column &&
      cache.shotMap.get(validationInfo.task.entity.id)
    ) {
      const entity = validationInfo.task.entity
      const taskType = validationInfo.task.column
      const list = state.displayedShots.flat()
      validationInfo.x = list.findIndex(e => e.id === entity.id)
      validationInfo.y = state.shotValidationColumns.indexOf(taskType.id)
    }
    if (
      state.shotSelectionGrid[0] &&
      state.shotSelectionGrid[validationInfo.x]
    ) {
      state.shotSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [ADD_SELECTED_TASK](state, validationInfo) {
    if (
      state.shotSelectionGrid[0] &&
      state.shotSelectionGrid[validationInfo.x]
    ) {
      state.shotSelectionGrid[validationInfo.x][validationInfo.y] = true
      state.selectedShots = new Map() // unselect all previously selected lines
    }
  },

  [CLEAR_SELECTED_TASKS](state, validationInfo) {
    if (
      tasksStore.state.nbSelectedValidations > 0 ||
      tasksStore.state.nbSelectedTasks > 0
    ) {
      const tmpGrid = JSON.parse(JSON.stringify(state.shotSelectionGrid))
      state.shotSelectionGrid = clearSelectionGrid(tmpGrid)
    }
  },

  [NEW_TASK_END](state, { task }) {
    const shot = cache.shotMap.get(task.entity_id)
    if (shot && task) {
      task = helpers.populateTask(task, shot)
      // Add Column if it is missing
      if (!state.shotValidationColumns.includes(task.task_type_id)) {
        state.shotValidationColumns.push(task.task_type_id)
        state.shotFilledColumns[task.task_type_id] = true
      }
      // Push task and readds the whole map to activate the realtime display.
      shot.tasks.push(task.id)
      if (!shot.validations) shot.validations = new Map()
      shot.validations.set(task.task_type_id, task.id)
      const displayedShot = state.displayedShots.find(
        s => s.id === task.entity_id
      )
      if (displayedShot) {
        displayedShot.validations = new Map(shot.validations)
      }
    }
  },

  [DELETE_TASK_END](state, task) {
    const shot = state.displayedShots.find(shot => shot.id === task.entity_id)
    if (shot) {
      const validations = new Map(shot.validations)
      validations.delete(task.task_type_id)
      delete shot.validations
      shot.validations = validations

      const taskIndex = shot.tasks.findIndex(
        shotTaskId => shotTaskId === task.id
      )
      shot.tasks.splice(taskIndex, 1)
    }
  },

  [ADD_SELECTED_TASKS](state, selection) {
    let tmpGrid = JSON.parse(JSON.stringify(state.shotSelectionGrid))
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
    state.selectedShots = new Map() // unselect all previously selected lines
    state.shotSelectionGrid = tmpGrid
  },

  [ADD_SHOT](state, { taskTypeMap, taskMap, personMap, production, shot }) {
    const taskIds = []
    const validations = new Map()
    let timeSpent = 0
    let estimation = 0
    shot.project_name = production.name
    shot.production_id = production.id
    shot.tasks.forEach(task => {
      helpers.populateTask(task, shot, production)
      timeSpent += task.duration
      estimation += task.estimation
      task.episode_id = shot.episode_id

      taskMap.set(task.id, task)
      validations.set(task.task_type_id, task.id)
      taskIds.push(task.id)

      if (task.assignees.length > 1) {
        task.assignees = task.assignees.sort((a, b) => {
          return personMap.get(a).name.localeCompare(personMap.get(b))
        })
      }
    })
    shot.tasks = taskIds
    shot.validations = validations
    shot.timeSpent = timeSpent
    shot.estimation = estimation

    cache.shots.push(shot)
    cache.shots = sortShots(cache.shots)
    cache.shotMap.set(shot.id, shot)

    state.displayedShots.push(shot)
    state.displayedShots = sortShots(state.displayedShots)
    state.displayedShotsCount = cache.shots.length
    state.displayedShotsLength = cache.shots.filter(s => !s.canceled).length
    state.shotFilledColumns = getFilledColumns(state.displayedShots)

    const maxX = state.displayedShots.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)
    cache.shotMap.set(shot.id, shot)
  },

  [UPDATE_SHOT](state, shot) {
    Object.assign(cache.shotMap.get(shot.id), shot)
    cache.shotIndex = buildShotIndex(cache.shots)
  },

  [REMOVE_SHOT](state, shotToDelete) {
    cache.shotMap.delete(shotToDelete.id)
    cache.shots = removeModelFromList(cache.shots, shotToDelete)
    cache.result = removeModelFromList(cache.result, shotToDelete)
    cache.shotIndex = buildShotIndex(cache.shots)
    state.displayedShots = removeModelFromList(
      state.displayedShots,
      shotToDelete
    )
    if (shotToDelete.timeSpent && !shotToDelete.canceled) {
      state.displayedShotsTimeSpent -= shotToDelete.timeSpent
    }
    if (shotToDelete.estimation && !shotToDelete.canceled) {
      state.displayedShotsEstimation -= shotToDelete.estimation
    }
    if (shotToDelete.nb_frames) {
      state.displayedShotsFrames -= shotToDelete.nb_frames
    }
    state.displayedShotsDrawings -= shotToDelete.nb_drawings || 0
  },

  [CANCEL_SHOT](state, shot) {
    shot.canceled = true
    state.displayedShotsLength = cache.result.filter(s => !s.canceled).length
  },

  [CHANGE_SHOT_SORT](
    state,
    { taskStatusMap, taskTypeMap, taskMap, production, sorting, persons }
  ) {
    const shotSearch = state.shotSearchText
    state.shotSorting = sorting
    helpers.buildResult(state, {
      persons,
      production,
      sorting,
      shotSearch,
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
      descriptor.entity_type === 'Shot' &&
      previousDescriptorFieldName &&
      previousDescriptorFieldName !== descriptor.field_name
    ) {
      cache.shots.forEach(shot => {
        const data = { ...shot.data }
        data[descriptor.field_name] = data[previousDescriptorFieldName]
        delete data[previousDescriptorFieldName]
        shot.data = data
      })
    }
  },

  [LOCK_SHOT](state, shot) {
    shot = cache.shotMap.get(shot.id)
    if (shot) {
      shot.lock = !shot.lock ? 1 : shot.lock + 1
    }
  },

  [UNLOCK_SHOT](state, shot) {
    shot = cache.shotMap.get(shot.id)
    if (shot) {
      shot.lock = !shot.lock ? 0 : shot.lock - 1
    }
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })

    cache.shots = []
    cache.result = []
    cache.shotIndex = {}
  },

  [SET_SHOT_SELECTION](state, { shot, selected }) {
    if (!selected && state.selectedShots.has(shot.id)) {
      state.selectedShots.delete(shot.id)
    }
    if (selected) {
      state.selectedShots.set(shot.id, shot)
      const maxX = state.displayedShots.length
      const maxY = state.nbValidationColumns
      // unselect previously selected tasks
      state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
  },

  [SORT_VALIDATION_COLUMNS](state, taskTypeMap) {
    const columns = [...state.shotValidationColumns]
    state.shotValidationColumns = []
    state.shotValidationColumns = helpers.sortValidationColumns(
      columns,
      state.shotFilledColumns,
      taskTypeMap
    )
  },

  [CLEAR_SELECTED_SHOTS](state) {
    state.selectedShots = new Map()
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}

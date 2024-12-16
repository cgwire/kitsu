import peopleApi from '@/store/api/people'
import shotsApi from '@/store/api/shots'
import shotStore from '@/store/modules/shots'
import taskStore from '@/store/modules/tasks'

import func from '@/lib/func'
import { getTaskTypePriorityOfProd } from '@/lib/productions'
import { buildEpisodeIndex, indexSearch } from '@/lib/indexing'
import {
  sortByName,
  sortEpisodeResult,
  sortValidationColumns
} from '@/lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'
import { applyFilters, getFilters, getKeyWords } from '@/lib/filtering'
import { getFilledColumns, removeModelFromList } from '@/lib/models'
import { computeStats } from '@/lib/stats'
import {
  ADD_EPISODE,
  ADD_EPISODE_SEARCH,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  CHANGE_EPISODE_SORT,
  CLEAR_EPISODES,
  CLEAR_SELECTED_EPISODES,
  CLEAR_SELECTED_TASKS,
  COMPUTE_EPISODE_STATS,
  CREATE_TASKS_END,
  DELETE_TASK_END,
  EDIT_EPISODE_END,
  LOAD_EPISODES_END,
  LOAD_EPISODES_ERROR,
  LOAD_EPISODES_START,
  NEW_EPISODE_END,
  NEW_TASK_END,
  REMOVE_EPISODE,
  REMOVE_EPISODE_SEARCH,
  REMOVE_SELECTED_TASK,
  RESET_PRODUCTION_PATH,
  SET_CURRENT_EPISODE,
  SET_EPISODE_LIST_SCROLL_POSITION,
  SET_EPISODE_SELECTION,
  SET_EPISODE_SEARCH,
  SET_EPISODE_RETAKE_STATS,
  SET_EPISODE_STATS,
  SET_EPISODES_WITH_TASKS,
  SET_PREVIEW,
  UPDATE_EPISODE,
  UPDATE_METADATA_DESCRIPTOR_END,
  RESET_ALL
} from '@/store/mutation-types'

const EPISODE_STATUS = ['canceled', 'complete', 'running', 'standby']

const helpers = {
  buildResult(
    state,
    {
      episodeSearch,
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
    const query = episodeSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters({
      entryIndex: cache.episodeIndex,
      assetTypes: [],
      taskTypes,
      taskStatuses,
      descriptors: production.descriptors,
      persons,
      query
    })
    let result = indexSearch(cache.episodeIndex, keywords) || cache.episodes
    result = applyFilters(result, filters, taskMap)
    result = sortEpisodeResult(result, sorting, taskTypeMap, taskMap)
    cache.result = result

    const displayedEpisodes = result
    const maxX = displayedEpisodes.length
    const maxY = state.nbValidationColumns

    helpers.setListStats(state, result)
    Object.assign(state, {
      displayedEpisodes: displayedEpisodes,
      episodeFilledColumns: getFilledColumns(displayedEpisodes),
      episodeSearchText: episodeSearch,
      episodeSelectionGrid: buildSelectionGrid(maxX, maxY)
    })
  },

  populateTask(production, task, episode, taskTypeMap, taskStatusMap) {
    task.name = getTaskTypePriorityOfProd(
      taskTypeMap.get(task.task_type_id),
      production
    ).toString()
    task.task_status_short_name = taskStatusMap.get(
      task.task_status_id
    ).short_name

    const episodeName = episode.name
    Object.assign(task, {
      project_id: episode.production_id,
      episode_id: episode.id,
      entity_name: episodeName,
      entity_type_name: 'Episode',
      entity: {
        id: episode.id,
        preview_file_id: episode.preview_file_id
      }
    })

    return task
  },

  setListStats(state, episodes) {
    let timeSpent = 0
    let estimation = 0
    episodes
      .filter(e => !e.canceled)
      .forEach(episode => {
        timeSpent += episode.timeSpent
        estimation += episode.estimation
      })
    Object.assign(state, {
      displayedEpisodesCount: episodes.length,
      displayedEpisodesLength: episodes.filter(e => !e.canceled).length,
      displayedEpisodesTimeSpent: timeSpent,
      displayedEpisodesEstimation: estimation
    })
  },

  sortValidationColumns(
    production,
    validationColumns,
    episodeFilledColumns,
    taskTypeMap
  ) {
    const columns = [...validationColumns]
    return sortValidationColumns(columns, taskTypeMap, production)
  },

  sortStatColumns(stats, taskTypeMap, production) {
    const validationColumnsMap = {}
    if (stats.all) {
      Object.keys(stats.all).forEach(entryId => {
        if (entryId !== 'all' && !stats.all[entryId].name) {
          validationColumnsMap[entryId] = true
        }
      })
    }
    const validationColumns = Object.keys(validationColumnsMap)
    return sortValidationColumns(validationColumns, taskTypeMap, production)
  }
}

const cache = {
  episodes: [],
  result: [],
  episodeIndex: {},
  episodeMap: new Map()
}

const initialState = {
  currentEpisode: null,
  episodes: [],

  displayedEpisodes: [],
  displayedEpisodesLength: 0,
  displayedEpisodesTimeSpent: 0,
  displayedEpisodesEstimation: 0,
  episodeFilledColumns: [],
  episodeSelectionGrid: {},
  episodeValidationColumns: [],
  isEpisodeDescription: false,
  isEpisodeEstimation: false,
  isEpisodeResolution: false,
  isEpisodeTime: false,
  isEpisodesLoading: false,
  isEpisodesLoadingError: false,

  episodeListScrollPosition: 0,
  episodeSearchText: '',
  episodeSearchQueries: [],
  episodeSorting: [],
  selectedEpisodes: new Map(),

  episodeRetakeStats: {},
  episodeStats: {}
}

const state = { ...initialState }

const getters = {
  currentEpisode: state => state.currentEpisode,

  episodeSearchQueries: state => state.episodeSearchQueries,
  episodeSorting: state => state.episodeSorting,

  isEpisodesLoading: state => state.isEpisodesLoading,
  isEpisodesLoadingError: state => state.isEpisodesLoadingError,
  displayedEpisodes: state => state.displayedEpisodes,
  displayedEpisodesLength: state => state.displayedEpisodesLength,
  displayedEpisodesEstimation: state => state.displayedEpisodesEstimation,
  displayedEpisodesTimeSpent: state => state.displayedEpisodesTimeSpent,
  isEpisodeDescription: state => state.isEpisodeDescription,
  isEpisodeResolution: state => state.isEpisodeResolution,
  isEpisodeEstimation: state => state.isEpisodeEstimation,
  isEpisodeTime: state => state.isEpisodeTime,

  episodes: state => state.episodes,
  episodeMap: state => cache.episodeMap,
  episodeRetakeStats: state => state.episodeRetakeStats,
  episodeStats: state => state.episodeStats,

  episodeSearchText: state => state.episodeSearchText,
  episodeListScrollPosition: state => state.episodeListScrollPosition,
  episodeFilledColumns: state => state.episodeFilledColumns,
  episodeValidationColumns: state => state.episodeValidationColumns,
  episodeSelectionGrid: state => state.episodeSelectionGrid,

  isSingleEpisode: state => state.displayedEpisodes.length < 2,
  runningEpisodes: state =>
    state.displayedEpisodes.filter(episode => {
      return !episode.status || ['', 'running'].includes(episode.status)
    }),
  episodeOptions: state =>
    state.episodes.map(episode => {
      return { label: episode.name, value: episode.id }
    }),
  episodeOptionGroups: state => {
    const groups = []
    const runnings = state.displayedEpisodes.filter(e => e.status === 'running')
    const standbys = state.displayedEpisodes.filter(e => e.status === 'standby')
    const completes = state.displayedEpisodes.filter(
      e => e.status === 'complete'
    )
    const canceleds = state.displayedEpisodes.filter(
      e => e.status === 'canceled'
    )

    const tmpGroups = [runnings, standbys, completes, canceleds]
    tmpGroups.forEach(group => {
      if (group.length > 0) {
        groups.push({
          name: group[0].status,
          episodeList: group.map(episode => {
            return { label: episode.name, value: episode.id }
          })
        })
      }
    })
    return groups
  }
}

const actions = {
  setCurrentEpisode({ commit, rootGetters }, episodeId) {
    commit(SET_CURRENT_EPISODE, episodeId)
    const productionId = rootGetters.currentProduction.id
    commit(RESET_PRODUCTION_PATH, { productionId, episodeId })
  },

  setEpisodeListScrollPosition({ commit }, scrollPosition) {
    commit(SET_EPISODE_LIST_SCROLL_POSITION, scrollPosition)
  },

  changeEpisodeSort({ commit, rootGetters }, sortInfo) {
    const taskStatusMap = rootGetters.taskStatus
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const persons = rootGetters.people
    const production = rootGetters.currentProduction
    const sorting = sortInfo ? [sortInfo] : []
    commit(CHANGE_EPISODE_SORT, {
      taskStatusMap,
      taskTypeMap,
      taskMap,
      persons,
      production,
      sorting
    })
  },

  setEpisodeSearch({ commit, rootGetters }, episodeSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    commit(SET_EPISODE_SEARCH, {
      episodeSearch,
      persons,
      taskStatusMap,
      taskMap,
      taskTypeMap,
      production
    })
  },

  saveEpisodeSearch({ commit, rootGetters }, searchQuery) {
    if (state.episodeSearchQueries.some(query => query.name === searchQuery)) {
      return
    }
    const production = rootGetters.currentProduction
    return peopleApi
      .createFilter(
        'episode',
        searchQuery,
        searchQuery,
        production.id,
        'Episode'
      )
      .then(searchQuery => {
        commit(ADD_EPISODE_SEARCH, searchQuery)
        return searchQuery
      })
  },

  removeEpisodeSearch({ commit }, searchQuery) {
    return peopleApi.removeFilter(searchQuery).then(() => {
      commit(REMOVE_EPISODE_SEARCH, searchQuery)
    })
  },

  setEpisodeSelection({ commit, rootGetters }, { episode, selected }) {
    commit(SET_EPISODE_SELECTION, {
      episode,
      selected,
      displayedEpisodes: rootGetters.displayedEpisodes
    })
  },

  clearSelectedEpisodes({ commit }) {
    commit(CLEAR_SELECTED_EPISODES)
  },

  initEpisodes({ commit, dispatch, state, rootState, rootGetters }) {
    const productionId = rootState.route.params.production_id
    const isTVShow = rootGetters.isTVShow
    dispatch('setLastProductionScreen', 'episodes')
    if (
      state.episodes.length === 0 ||
      state.episodes[0].production_id !== productionId
    ) {
      if (isTVShow) {
        return dispatch('loadEpisodes')
          .then(() => {
            return dispatch('loadEpisodeStats', productionId)
          })
          .then(() => {
            return dispatch('loadEpisodeRetakeStats', productionId)
          })
      } else {
        return dispatch('computeEpisodeStats')
      }
    }
  },

  loadEpisode({ commit, state }, episodeId) {
    return shotsApi
      .getEpisode(episodeId)
      .then(episode => {
        if (cache.episodeMap.get(episode.id)) {
          commit(UPDATE_EPISODE, episode)
        } else {
          commit(ADD_EPISODE, episode)
        }
      })
      .catch(console.error)
  },

  loadEpisodes({ commit, state, rootGetters }) {
    const currentProduction = rootGetters.currentProduction
    const routeEpisodeId = rootGetters.route.params.episode_id
    const userFilters = rootGetters.userFilters
    return shotsApi.getEpisodes(currentProduction).then(episodes => {
      commit(LOAD_EPISODES_END, { episodes, routeEpisodeId, userFilters })
      return Promise.resolve(episodes)
    })
  },

  loadEpisodesWithTasks({ commit, state, rootGetters }) {
    const personMap = rootGetters.personMap
    const production = rootGetters.currentProduction
    const routeEpisodeId = rootGetters.route.params.episode_id
    const userFilters = rootGetters.userFilters
    const taskMap = rootGetters.taskMap
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    return shotsApi.getEpisodesWithTasks(production).then(episodes => {
      commit(SET_EPISODES_WITH_TASKS, {
        episodes,
        routeEpisodeId,
        personMap,
        production,
        userFilters,
        taskMap,
        taskTypeMap,
        taskStatusMap
      })
      return Promise.resolve(episodes)
    })
  },

  clearEpisodes({ commit }) {
    commit(CLEAR_EPISODES)
  },

  newEpisode({ commit, dispatch, state, rootGetters }, episode) {
    if (cache.episodes.find(ep => ep.name === episode.name)) {
      return Promise.reject(new Error('Episode already exists'))
    }
    return shotsApi.newEpisode(episode).then(episode => {
      commit(NEW_EPISODE_END, episode)
      const taskTypeIds = rootGetters.productionEpisodeTaskTypeIds
      const createTaskPromises = taskTypeIds.map(taskTypeId =>
        dispatch('createTask', {
          entityId: episode.id,
          projectId: episode.project_id,
          taskTypeId: taskTypeId,
          type: 'episodes'
        })
      )
      return func
        .runPromiseAsSeries(createTaskPromises)
        .then(() => Promise.resolve(episode))
        .catch(console.error)
    })
  },

  editEpisode({ commit, state }, data) {
    return shotsApi.updateEpisode(data).then(episode => {
      commit(EDIT_EPISODE_END, episode)
      return Promise.resolve(episode)
    })
  },

  deleteEpisode({ commit, state }, episode) {
    return shotsApi.deleteEpisode(episode).then(() => {
      commit(REMOVE_EPISODE, episode)
      return Promise.resolve(episode)
    })
  },

  loadEpisodeStats({ commit, rootGetters }, productionId) {
    const taskTypeMap = rootGetters.taskTypeMap
    const production = rootGetters.currentProduction
    commit(SET_EPISODE_STATS, { episodeStats: {}, taskTypeMap, production })
    return shotsApi
      .getEpisodeStats(productionId)
      .then(episodeStats => {
        commit(SET_EPISODE_STATS, { episodeStats, taskTypeMap, production })
        return Promise.resolve(episodeStats)
      })
      .catch(console.error)
  },

  loadEpisodeRetakeStats({ commit, rootGetters }, productionId) {
    const taskTypeMap = rootGetters.taskTypeMap
    const production = rootGetters.currentProduction
    commit(SET_EPISODE_RETAKE_STATS, {
      episodeRetakeStats: {},
      production,
      taskTypeMap
    })
    return shotsApi
      .getEpisodeRetakeStats(productionId)
      .then(episodeRetakeStats => {
        commit(SET_EPISODE_RETAKE_STATS, {
          episodeRetakeStats,
          production,
          taskTypeMap
        })
        return Promise.resolve(episodeRetakeStats)
      })
      .catch(console.error)
  },

  computeEpisodeStats({ commit, dispatch, rootGetters }) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskMap = rootGetters.taskMap
    const isTVShow = rootGetters.isTVShow
    if (!isTVShow) {
      commit(COMPUTE_EPISODE_STATS, { taskStatusMap, taskMap })
    } else {
      dispatch('loadEpisodeStats', rootGetters.currentProduction.id)
    }
  }
}

const mutations = {
  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
    cache.episodes = []
    cache.result = []
    cache.episodeIndex = {}
  },

  [CHANGE_EPISODE_SORT](
    state,
    { taskStatusMap, taskTypeMap, taskMap, production, sorting, persons }
  ) {
    const episodeSearch = state.episodeSearchText
    state.episodeSorting = sorting
    helpers.buildResult(state, {
      persons,
      production,
      sorting,
      episodeSearch,
      taskStatusMap,
      taskTypeMap,
      taskMap
    })
  },

  [ADD_EPISODE_SEARCH](state, searchQuery) {
    state.episodeSearchQueries.push(searchQuery)
    state.episodeSearchQueries = sortByName(state.episodeSearchQueries)
  },

  [REMOVE_EPISODE_SEARCH](state, searchQuery) {
    const queryIndex = state.episodeSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.episodeSearchQueries.splice(queryIndex, 1)
    }
  },

  [SET_EPISODE_SELECTION](state, { episode, selected, displayedEpisodes }) {
    if (!selected && state.selectedEpisodes.has(episode.id)) {
      state.selectedEpisodes.delete(episode.id)
    }
    if (selected) {
      state.selectedEpisodes.set(episode.id, episode)
      const maxX = displayedEpisodes.length
      const maxY = state.nbValidationColumns
      // unselect previously selected tasks
      state.episodeSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
  },

  [CLEAR_SELECTED_EPISODES](state) {
    state.selectedEpisodes = new Map()
  },

  [CLEAR_EPISODES](state) {
    state.episodes = []
    state.currentEpisode = null
    cache.episodes = []
    cache.result = []
    cache.episodeIndex = {}
  },

  [SET_CURRENT_EPISODE](state, episodeId) {
    if (episodeId && episodeId !== state.currentEpisode?.id) {
      if (['all', 'main'].includes(episodeId)) {
        state.currentEpisode = { id: episodeId }
      } else {
        state.currentEpisode = cache.episodeMap.get(episodeId)
      }
    }
  },

  [SET_EPISODES_WITH_TASKS](
    state,
    {
      production,
      episodes,
      userFilters,
      taskMap,
      taskTypeMap,
      personMap,
      taskStatusMap
    }
  ) {
    const validationColumns = {}
    let isDescription = false
    let isTime = false
    let isEstimation = false
    let isResolution = false
    cache.episodeMap = new Map()
    episodes.forEach(episode => {
      const taskIds = []
      const validations = new Map()
      let timeSpent = 0
      let estimation = 0
      episode.project_id = production.id
      episode.project_name = production.name
      episode.production_id = production.id
      episode.full_name = episode.name
      episode.tasks.forEach(task => {
        helpers.populateTask(
          production,
          task,
          episode,
          taskTypeMap,
          taskStatusMap
        )
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
      episode.tasks = taskIds
      episode.validations = validations
      episode.timeSpent = timeSpent
      episode.estimation = estimation

      if (!isTime && episode.timeSpent > 0) isTime = true
      if (!isEstimation && episode.estimation > 0) isEstimation = true
      if (!isDescription && episode.description) isDescription = true
      if (!isResolution && episode.data.resolution) isResolution = true

      cache.episodeMap.set(episode.id, episode)
    })
    episodes = sortByName(episodes)
    cache.episodes = episodes
    cache.result = episodes
    cache.episodeIndex = buildEpisodeIndex(episodes)

    const displayedEpisodes = cache.episodes
    const filledColumns = getFilledColumns(displayedEpisodes)

    state.episodeValidationColumns = helpers.sortValidationColumns(
      production,
      Object.values(validationColumns),
      filledColumns,
      taskTypeMap
    )

    state.nbValidationColumns = state.episodeValidationColumns.length
    state.isEpisodeTime = isTime
    state.isEpisodeEstimation = isEstimation
    state.isEpisodeDescription = isDescription
    state.isEpisodeResolution = isResolution

    state.isEpisodesLoading = false
    state.isEpisodesLoadingError = false

    state.displayedEpisodes = displayedEpisodes
    state.displayedEpisodesLength = displayedEpisodes.length
    state.episodeFilledColumns = filledColumns

    const maxX = state.displayedEpisodes.length
    const maxY = state.nbValidationColumns
    state.episodeSelectionGrid = buildSelectionGrid(maxX, maxY)
    helpers.setListStats(state, episodes)

    if (userFilters.episode && userFilters.episode[production.id]) {
      state.episodeSearchQueries = userFilters.episode[production.id]
    } else {
      state.episodeSearchQueries = []
    }
  },

  [ADD_EPISODE](state, episode) {
    state.episodes.push(episode)
    const sortedEpisodes = sortByName(state.episodes)
    cache.episodeMap.set(episode.id, episode)
    state.episodes = sortedEpisodes
    state.displayedEpisodes.push(episode)
    state.displayedEpisodes = sortByName(state.displayedEpisodes)
    state.episodeIndex = buildEpisodeIndex(sortedEpisodes)
    state.displayedEpisodesLength = sortedEpisodes.length
  },

  [UPDATE_EPISODE](state, episode) {
    Object.assign(cache.episodeMap.get(episode.id), episode)
    state.episodeIndex = buildEpisodeIndex(state.episodes)
  },

  [REMOVE_EPISODE](state, episode) {
    delete cache.episodeMap.get(episode.id)
    state.episodes = removeModelFromList(state.episodes, episode)
    state.displayedEpisodes = removeModelFromList(
      state.displayedEpisodes,
      episode
    )
    state.episodeIndex = buildEpisodeIndex(state.episodes)
  },

  [SET_EPISODE_SEARCH](state, payload) {
    const sorting = state.episodeSorting
    payload.sorting = sorting
    helpers.buildResult(state, payload)
  },

  [SET_EPISODE_LIST_SCROLL_POSITION](state, scrollPosition) {
    state.episodeListScrollPosition = scrollPosition
  },

  [NEW_EPISODE_END](state, episode) {
    episode.production_id = episode.project_id
    episode.preview_file_id = ''
    episode.tasks = []
    episode.validations = new Map()
    episode.data = {}

    const maxX = state.displayedEpisodes.length + 1
    const maxY = state.nbValidationColumns
    state.episodeSelectionGrid = buildSelectionGrid(maxX, maxY)

    cache.episodes = state.displayedEpisodes
    cache.episodes.push(episode)
    cache.episodes = sortByName(cache.episodes)
    state.displayedEpisodes = cache.episodes
    helpers.setListStats(state, cache.episodes)
    cache.episodeMap.set(episode.id, episode)
    state.episodeFilledColumns = getFilledColumns(state.displayedEpisodes)
    cache.episodeIndex = buildEpisodeIndex(cache.episodes)
  },

  [EDIT_EPISODE_END](state, newEpisode) {
    const episode = cache.episodeMap.get(newEpisode.id)
    if (episode) {
      Object.assign(episode, newEpisode)
    }
    state.episodeIndex = buildEpisodeIndex(state.episodes)
    if (episode.description && !state.isEpisodeDescription) {
      state.isEpisodeDescription = true
    }
    if (episode.resolution && !state.isEpisodeResolution) {
      state.isEpisodeResolution = true
    }
  },

  [LOAD_EPISODES_START](state) {
    cache.episodes = []
    cache.result = []
    cache.episodeIndex = {}
    cache.episodeMap = new Map()
    state.episodeValidationColumns = []

    state.isEpisodesLoading = true
    state.isEpisodesLoadingError = false

    state.displayedepisodes = []
    state.displayedepisodesLength = 0
    state.episodeSearchQueries = []
    state.displayedEpisodes = []
    state.displayedEpisodesLength = 0

    state.selectedepisodes = new Map()
  },

  [LOAD_EPISODES_ERROR](state) {
    state.isEpisodesLoading = false
    state.isEpisodesLoadingError = true
  },

  [LOAD_EPISODES_END](state, { episodes, routeEpisodeId }) {
    if (state.episodes.length > 0) return
    if (!episodes) episodes = []
    cache.episodeMap = new Map()
    episodes.forEach(episode => {
      if (!EPISODE_STATUS.includes(episode.status)) {
        episode.status = 'running'
      }
      cache.episodeMap.set(episode.id, episode)
    })
    state.episodes = sortByName(episodes)

    state.episodeIndex = buildEpisodeIndex(state.episodes)
    state.displayedEpisodes = state.episodes
    state.displayedEpisodesLength = state.episodes.length

    // Set currentEpisode
    if (state.episodes.length > 0) {
      if (routeEpisodeId === 'all') {
        state.currentEpisode = { id: 'all' }
      } else if (routeEpisodeId === 'main') {
        state.currentEpisode = { id: 'main' }
      } else if (routeEpisodeId) {
        state.currentEpisode = cache.episodeMap.get(routeEpisodeId)
      }
      if (!state.currentEpisode) {
        const runningEpisodes = state.episodes.filter(
          e => e.status === 'running'
        )
        if (runningEpisodes.length > 0) {
          state.currentEpisode = runningEpisodes[0]
        } else {
          state.currentEpisode = state.episodes[0]
        }
      }
    } else {
      state.currentEpisode = null
    }
  },

  [SET_EPISODE_STATS](state, { episodeStats, taskTypeMap, production }) {
    state.episodeValidationColumns = helpers.sortStatColumns(
      episodeStats,
      taskTypeMap,
      production
    )
    state.episodeStats = episodeStats
  },

  [SET_EPISODE_RETAKE_STATS](
    state,
    { episodeRetakeStats, taskTypeMap, production }
  ) {
    state.episodeValidationColumns = helpers.sortStatColumns(
      episodeRetakeStats,
      taskTypeMap,
      production
    )
    state.episodeRetakeStats = episodeRetakeStats
  },

  [COMPUTE_EPISODE_STATS](state, { taskMap, taskStatusMap }) {
    state.episodeStats = computeStats(
      shotStore.cache.shots,
      'episode_id',
      taskStatusMap,
      taskMap
    )
  },

  [CREATE_TASKS_END](state, { tasks, production, taskTypeMap, taskStatusMap }) {
    tasks.forEach(task => {
      if (task) {
        const episode = cache.episodeMap.get(task.entity_id)
        if (episode) {
          helpers.populateTask(
            production,
            task,
            episode,
            taskTypeMap,
            taskStatusMap
          )
          episode.validations.set(task.task_type_id, task.id)
          const displayedEpisode = state.displayedEpisodes.find(
            e => e.id === episode.id
          )
          if (displayedEpisode) {
            displayedEpisode.validations = new Map(episode.validations)
          }
          episode.tasks.push(task.id)
        }
      }
    })
  },

  [REMOVE_SELECTED_TASK](state, validationInfo) {
    if (
      !validationInfo.x &&
      validationInfo.task?.column &&
      cache.episodeMap.get(validationInfo.task.entity.id)
    ) {
      const entity = validationInfo.task.entity
      const taskType = validationInfo.task.column
      const list = state.displayedEpisodes.flat()
      validationInfo.x = list.findIndex(e => e.id === entity.id)
      validationInfo.y = state.episodeValidationColumns.indexOf(taskType.id)
    }
    if (
      state.episodeSelectionGrid[0] &&
      state.episodeSelectionGrid[validationInfo.x]
    ) {
      state.episodeSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [ADD_SELECTED_TASK](state, validationInfo) {
    if (
      state.episodeSelectionGrid[0] &&
      state.episodeSelectionGrid[validationInfo.x]
    ) {
      state.episodeSelectionGrid[validationInfo.x][validationInfo.y] = true
      state.selectedEpisodes = new Map() // unselect all previously selected lines
    }
  },

  [ADD_SELECTED_TASKS](state, selection) {
    let tmpGrid = JSON.parse(JSON.stringify(state.episodeSelectionGrid))
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
    state.selectedEpisodes = new Map() // unselect all previously selected lines
    state.episodeSelectionGrid = tmpGrid
  },

  [CLEAR_SELECTED_TASKS](state, validationInfo) {
    if (taskStore.state.nbSelectedTasks > 0) {
      const tmpGrid = JSON.parse(JSON.stringify(state.episodeSelectionGrid))
      state.episodeSelectionGrid = clearSelectionGrid(tmpGrid)
    }
  },

  [NEW_TASK_END](state, { task, taskTypeMap, taskStatusMap, production }) {
    const episode = cache.episodeMap.get(task.entity_id)
    if (episode && task) {
      task = helpers.populateTask(
        production,
        task,
        episode,
        taskTypeMap,
        taskStatusMap
      )
      // Add Column if it is missing
      if (!state.episodeValidationColumns.includes(task.task_type_id)) {
        state.episodeValidationColumns.push(task.task_type_id)
        state.episodeFilledColumns[task.task_type_id] = true
      }
      // Push task and readds the whole map to activate the realtime display.
      episode.tasks.push(task.id)
      if (!episode.validations) episode.validations = new Map()
      episode.validations.set(task.task_type_id, task.id)
      const displayedEpisode = state.displayedEpisodes.find(
        e => e.id === episode.id
      )
      if (displayedEpisode) {
        displayedEpisode.validations = new Map(episode.validations)
      }
    }
  },

  [DELETE_TASK_END](state, task) {
    const episode = cache.episodeMap.get(task.entity_id)
    if (episode) {
      const validations = new Map(episode.validations)
      validations.delete(task.task_type_id)
      delete episode.validations
      episode.validations = validations
      const taskIndex = episode.tasks.findIndex(
        episodeTaskId => episodeTaskId === task.id
      )
      episode.tasks.splice(taskIndex, 1)
    }
  },

  [SET_PREVIEW](state, { entityId, taskId, previewId, taskMap }) {
    const episodes = state.displayedEpisodes.find(s => s.id === entityId)
    if (episodes) {
      episodes.preview_file_id = previewId
      episodes.tasks.forEach(taskId => {
        const task = taskMap.get(taskId)
        if (task) task.entity.preview_file_id = previewId
      })
    }
  },

  [UPDATE_METADATA_DESCRIPTOR_END](
    state,
    { descriptor, previousDescriptorFieldName }
  ) {
    if (
      descriptor.entity_type === 'Episode' &&
      previousDescriptorFieldName &&
      previousDescriptorFieldName !== descriptor.field_name
    ) {
      cache.episodes.forEach(episode => {
        const data = { ...episode.data }
        data[descriptor.field_name] = data[previousDescriptorFieldName]
        delete data[previousDescriptorFieldName]
        episode.data = data
      })
    }
  }
}

export default {
  actions,
  cache,
  getters,
  mutations,
  state
}

import Vue from 'vue'
import peopleApi from '@/store/api/people'
import shotsApi from '@/store/api/shots'
import shotStore from '@/store/modules/shots'

import { getTaskTypePriorityOfProd } from '@/lib/productions'
import {
  buildSequenceIndex,
  indexSearch
} from '@/lib/indexing'
import {
  sortByName,
  sortSequences,
  sortSequenceResult,
  sortValidationColumns
} from '@/lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid
} from '@/lib/selection'
import {
  applyFilters,
  getFilters,
  getKeyWords
} from '@/lib/filtering'
import {
  getFilledColumns,
  removeModelFromList
} from '@/lib/models'
import {
  computeStats
} from '@/lib/stats'
import {
  ADD_SEQUENCE,
  ADD_SEQUENCE_SEARCH,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  CHANGE_SEQUENCE_SORT,
  CLEAR_SEQUENCES,
  CLEAR_SELECTED_SEQUENCES,
  CLEAR_SELECTED_TASKS,
  COMPUTE_SEQUENCE_STATS,
  CREATE_TASKS_END,
  DELETE_TASK_END,
  EDIT_SEQUENCE_END,
  LOAD_SEQUENCES_END,
  LOAD_SEQUENCES_ERROR,
  LOAD_SEQUENCES_START,
  LOCK_SEQUENCE,
  NEW_SEQUENCE_END,
  NEW_TASK_END,
  REMOVE_SEQUENCE,
  REMOVE_SEQUENCE_SEARCH,
  REMOVE_SELECTED_TASK,
  RESET_PRODUCTION_PATH,
  SAVE_SEQUENCE_SEARCH_END,
  REMOVE_SEQUENCE_SEARCH_END,
  SET_CURRENT_PRODUCTION,
  SET_CURRENT_SEQUENCE,
  SET_SEQUENCE_LIST_SCROLL_POSITION,
  SET_SEQUENCE_SELECTION,
  SET_SEQUENCE_SEARCH,
  SET_SEQUENCE_STATS_SEARCH,
  SET_SEQUENCE_RETAKE_STATS,
  SET_SEQUENCE_STATS,
  SET_SEQUENCES_WITH_TASKS,
  UNLOCK_SEQUENCE,
  UPDATE_SEQUENCE,
  RESET_ALL
} from '@/store/mutation-types'

const helpers = {
  buildResult (state, {
    sequenceSearch,
    production,
    sorting,
    taskStatusMap,
    taskTypeMap,
    persons,
    taskMap
  }, applySequenceFilters = true
  ) {
    const taskTypes = Array.from(taskTypeMap.values())
    const taskStatuses = Array.from(taskStatusMap.values())
    const query = sequenceSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters({
      entryIndex: cache.sequenceIndex,
      assetTypes: [],
      taskTypes,
      taskStatuses,
      descriptors: production.descriptors,
      persons,
      query
    })
    let result = indexSearch(cache.sequenceIndex, keywords) || cache.sequences
    if (applySequenceFilters) {
      result = applyFilters(result, filters, taskMap)
    }
    result = sortSequenceResult(
      result,
      sorting,
      taskTypeMap,
      taskMap
    )
    cache.result = result

    const displayedSequences = result
    const maxX = displayedSequences.length
    const maxY = state.nbValidationColumns

    helpers.setListStats(state, result)
    Object.assign(state, {
      displayedSequences: displayedSequences,
      sequenceFilledColumns: getFilledColumns(displayedSequences),
      sequenceSearchText: sequenceSearch,
      sequenceSelectionGrid: buildSelectionGrid(maxX, maxY)
    })
    return result
  },

  populateTask (production, task, sequence, taskTypeMap, taskStatusMap) {
    task.name = getTaskTypePriorityOfProd(
      taskTypeMap.get(task.task_type_id),
      production
    ).toString()
    task.task_status_short_name =
      taskStatusMap.get(task.task_status_id).short_name

    Object.assign(task, {
      project_id: sequence.production_id,
      sequence_id: sequence.id,
      entity_name: sequence.full_name,
      entity_type_name: 'Sequence',
      entity: {
        id: sequence.id,
        preview_file_id: sequence.preview_file_id
      }
    })

    return task
  },

  setListStats (state, sequences) {
    let timeSpent = 0
    let estimation = 0
    sequences.filter(e => !e.canceled).forEach(sequence => {
      timeSpent += sequence.timeSpent
      estimation += sequence.estimation
    })
    Object.assign(state, {
      displayedSequencesCount: sequences.length,
      displayedSequencesLength: sequences.filter(e => !e.canceled).length,
      displayedSequencesTimeSpent: timeSpent,
      displayedSequencesEstimation: estimation
    })
  },

  sortValidationColumns (
    production,
    validationColumns,
    sequenceFilledColumns,
    taskTypeMap
  ) {
    const columns = [...validationColumns]
    return sortValidationColumns(
      columns, taskTypeMap, production
    )
  },

  sortStatColumns (stats, taskTypeMap, production) {
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
      validationColumns, taskTypeMap, production
    )
  }
}

const cache = {
  sequences: [],
  result: [],
  sequenceIndex: {}
}

const initialState = {
  currentSequence: null,
  sequenceMap: new Map(),

  displayedSequences: [],
  displayedSequencesLength: 0,
  displayedSequencesTimeSpent: 0,
  displayedSequencesEstimation: 0,
  sequenceFilledColumns: [],
  sequenceSelectionGrid: {},
  sequenceValidationColumns: [],
  isSequenceDescription: false,
  isSequenceEstimation: false,
  isSequenceTime: false,
  isSequencesLoading: false,
  isSequencesLoadingError: false,

  sequenceListScrollPosition: 0,
  sequenceSearchText: '',
  sequenceSearchQueries: [],
  searchSequenceFilters: [],
  sequenceSorting: [],
  selectedSequences: new Map(),

  sequenceRetakeStats: {},
  sequenceStats: {}
}

const state = { ...initialState }

const getters = {
  currentSequence: state => state.currentSequence,

  sequenceSearchQueries: state => state.sequenceSearchQueries,
  sequenceSorting: state => state.sequenceSorting,

  isSequencesLoading: state => state.isSequencesLoading,
  isSequencesLoadingError: state => state.isSequencesLoadingError,
  displayedSequences: state => state.displayedSequences,
  displayedSequencesLength: state => state.displayedSequencesLength,
  displayedSequencesEstimation: state => state.displayedSequencesEstimation,
  displayedSequencesTimeSpent: state => state.displayedSequencesTimeSpent,
  isSequenceDescription: state => state.isSequenceDescription,
  isSequenceEstimation: state => state.isSequenceEstimation,
  isSequenceTime: state => state.isSequenceTime,

  sequences: state => cache.sequences,
  sequenceMap: state => state.sequenceMap,
  sequenceRetakeStats: state => state.sequenceRetakeStats,
  sequenceStats: state => state.sequenceStats,

  sequenceListScrollPosition: state => state.sequenceListScrollPosition,
  sequenceFilledColumns: state => state.sequenceFilledColumns,
  sequenceValidationColumns: state => state.sequenceValidationColumns,
  sequenceSelectionGrid: state => state.sequenceSelectionGrid,
  sequenceSearchText: state => state.sequenceSearchText,
  searchSequenceFilters: state => state.searchSequenceFilters,

  isSingleSequence: state => cache.sequences.length < 2,
  sequenceOptions: state => cache.sequences.map(
    sequence => { return { label: sequence.name, value: sequence.id } }
  )
}

const actions = {

  setCurrentSequence ({ commit, rootGetters }, sequenceId) {
    commit(SET_CURRENT_SEQUENCE, sequenceId)
    const productionId = rootGetters.currentProduction.id
    commit(RESET_PRODUCTION_PATH, { productionId, sequenceId })
  },

  changeSequenceSort ({ commit, rootGetters }, sortInfo) {
    const taskStatusMap = rootGetters.taskStatus
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const persons = rootGetters.people
    const production = rootGetters.currentProduction
    const sorting = sortInfo ? [sortInfo] : []
    commit(CHANGE_SEQUENCE_SORT, {
      taskStatusMap, taskTypeMap, taskMap, persons, production, sorting
    })
  },

  setSequenceSearch ({ commit, rootGetters }, sequenceSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    commit(
      SET_SEQUENCE_SEARCH,
      {
        sequenceSearch,
        persons,
        taskStatusMap,
        taskMap,
        taskTypeMap,
        production
      }
    )
  },

  setSequenceStatsSearch ({ commit, rootGetters }, sequenceSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    const persons = rootGetters.people
    commit(
      SET_SEQUENCE_STATS_SEARCH,
      {
        sequenceSearch,
        persons,
        taskStatusMap,
        taskMap,
        taskTypeMap,
        production
      }
    )
  },

  saveSequenceSearch ({ commit, rootGetters }, searchQuery) {
    const query = state.sequenceSearchQueries.find(
      (query) => query && query.name === searchQuery
    )
    const production = rootGetters.currentProduction
    if (!query) {
      return peopleApi.createFilter(
        'sequence',
        searchQuery,
        searchQuery,
        production.id,
        'Sequence'
      ).then(query => {
        commit(ADD_SEQUENCE_SEARCH, query)
        return Promise.resolve(query)
      })
    } else {
      return Promise.resolve()
    }
  },

  removeSequenceSearch ({ commit, rootGetters }, searchQuery) {
    return peopleApi.removeFilter(searchQuery)
      .then(() => {
        commit(REMOVE_SEQUENCE_SEARCH, searchQuery)
        return Promise.resolve()
      })
  },

  clearSelectedSequences ({ commit }) {
    commit(CLEAR_SELECTED_SEQUENCES)
  },

  initSequences ({ commit, dispatch, state, rootState, rootGetters }) {
    const productionId = rootState.route.params.production_id
    dispatch('setLastProductionScreen', 'sequences')
    if (
      cache.sequences.length === 0 ||
      cache.sequences[0].production_id !== productionId
    ) {
      return dispatch('loadSequences')
        .then(() => {
          return dispatch('computeSequenceStats')
        })
    } else {
      return dispatch('computeSequenceStats')
    }
  },

  loadSequences ({ commit, state, rootGetters }) {
    const production = rootGetters.currentProduction
    const routeSequenceId = rootGetters.route.params.sequence_id
    const userFilters = rootGetters.userFilters
    const isTVShow = rootGetters.isTVShow
    const episode = isTVShow ? rootGetters.currentEpisode : null
    const episodeMap = rootGetters.episodeMap
    return shotsApi.getSequences(production, episode)
      .then(sequences => {
        commit(LOAD_SEQUENCES_END, {
          sequences,
          episodeMap,
          routeSequenceId,
          production,
          userFilters
        })
        return Promise.resolve(sequences)
      })
  },

  loadSequencesWithTasks ({ commit, state, rootGetters }) {
    const episodeMap = rootGetters.episodeMap
    const personMap = rootGetters.personMap
    const production = rootGetters.currentProduction
    let episode = rootGetters.currentEpisode
    const isTVShow = rootGetters.isTVShow
    const routeSequenceId = rootGetters.route.params.sequence_id
    const userFilters = rootGetters.userFilters
    const taskMap = rootGetters.taskMap
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    if (!episode && isTVShow) {
      if (rootGetters.episodes && rootGetters.episodes.length > 0) {
        episode = rootGetters.episodes[0]
      } else {
        commit(SET_SEQUENCES_WITH_TASKS, {
          sequences: [],
          episodeMap,
          personMap,
          production,
          userFilters,
          routeSequenceId,
          taskMap,
          taskTypeMap,
          taskStatusMap
        })
        return Promise.resolve([])
      }
    }
    return shotsApi.getSequencesWithTasks(production, episode)
      .then(sequences => {
        commit(SET_SEQUENCES_WITH_TASKS, {
          sequences,
          episodeMap,
          personMap,
          production,
          routeSequenceId,
          taskMap,
          taskTypeMap,
          taskStatusMap,
          userFilters
        })
        return Promise.resolve(sequences)
      })
  },

  clearSequences ({ commit }) {
    commit(CLEAR_SEQUENCES)
  },

  newSequence ({ commit, dispatch, state, rootGetters }, sequence) {
    const episodeMap = rootGetters.episodeMap
    return shotsApi.newSequence(sequence)
      .then(sequence => {
        commit(NEW_SEQUENCE_END, { sequence, episodeMap })
        const taskTypeIds = rootGetters.productionSequenceTaskTypeIds
        const createTaskPromises = taskTypeIds.map(
          taskTypeId => dispatch('createTask', {
            entityId: sequence.id,
            projectId: sequence.project_id,
            taskTypeId: taskTypeId,
            type: 'sequences'
          })
        )
        return Promise.all(createTaskPromises)
          .then(() => Promise.resolve(sequence))
          .catch(console.error)
      })
  },

  editSequence ({ commit, state }, data) {
    commit(LOCK_SEQUENCE, data)
    return shotsApi.updateSequence(data)
      .then(sequence => {
        commit(EDIT_SEQUENCE_END, sequence)
        commit(UNLOCK_SEQUENCE, data)
        return Promise.resolve(sequence)
      })
  },

  deleteSequence ({ commit, state }, sequence) {
    return shotsApi.deleteSequence(sequence)
      .then(() => {
        commit(REMOVE_SEQUENCE, sequence)
        return Promise.resolve(sequence)
      })
  },

  loadSequence ({ commit, state, rootGetters }, sequenceId) {
    const episodeMap = rootGetters.episodeMap
    const sequence = rootGetters.sequenceMap.get(sequenceId)
    if (sequence && sequence.lock) return

    return shotsApi.getSequence(sequenceId)
      .then(sequence => {
        if (state.sequenceMap.get(sequence.id)) {
          commit(UPDATE_SEQUENCE, sequence)
        } else {
          commit(ADD_SEQUENCE, { sequence, episodeMap })
        }
        return Promise.resolve(sequence)
      })
      .catch(console.error)
  },

  loadSequenceStats ({ commit, rootGetters }, productionId) {
    const taskTypeMap = rootGetters.taskTypeMap
    commit(SET_SEQUENCE_STATS, { sequenceStats: {}, taskTypeMap })
    return shotsApi.getSequenceStats(productionId)
      .then(sequenceStats => {
        commit(SET_SEQUENCE_STATS, { sequenceStats, taskTypeMap })
        return Promise.resolve(sequenceStats)
      })
      .catch(console.error)
  },

  loadSequenceRetakeStats ({ commit, rootGetters }, productionId) {
    const taskTypeMap = rootGetters.taskTypeMap
    const production = rootGetters.currentProduction
    commit(SET_SEQUENCE_RETAKE_STATS, {
      sequenceRetakeStats: {},
      production,
      taskTypeMap
    })
    return shotsApi.getSequenceRetakeStats(productionId)
      .then(sequenceRetakeStats => {
        commit(SET_SEQUENCE_RETAKE_STATS, {
          sequenceRetakeStats,
          production,
          taskTypeMap
        })
        return Promise.resolve(sequenceRetakeStats)
      })
      .catch(console.error)
  },

  setSequenceListScrollPosition ({ commit }, scrollPosition) {
    commit(SET_SEQUENCE_LIST_SCROLL_POSITION, scrollPosition)
  },

  computeSequenceStats ({ commit, rootGetters }) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskMap = rootGetters.taskMap
    commit(COMPUTE_SEQUENCE_STATS, { taskStatusMap, taskMap })
  }
}

const mutations = {

  [RESET_ALL] (state) {
    Object.assign(state, { ...initialState })
    cache.sequences = []
    cache.result = []
    cache.sequenceIndex = {}
  },

  [CHANGE_SEQUENCE_SORT] (state, {
    taskStatusMap, taskTypeMap, taskMap, production, sorting, persons
  }) {
    const sequenceSearch = state.sequenceSearchText
    state.sequenceSorting = sorting
    helpers.buildResult(state, {
      persons,
      production,
      sorting,
      sequenceSearch,
      taskStatusMap,
      taskTypeMap,
      taskMap
    })
  },

  [ADD_SEQUENCE_SEARCH] (state, searchQuery) {
    state.sequenceSearchQueries.push(searchQuery)
    state.sequenceSearchQueries = sortByName(state.sequenceSearchQueries)
  },

  [REMOVE_SEQUENCE_SEARCH] (state, searchQuery) {
    const queryIndex = state.sequenceSearchQueries.findIndex(
      (query) => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.sequenceSearchQueries.splice(queryIndex, 1)
    }
  },

  [SET_SEQUENCE_SELECTION] (state, { sequence, selected, displayedSequences }) {
    if (!selected && state.selectedSequences.has(sequence.id)) {
      state.selectedSequences.delete(sequence.id)
      state.selectedSequences = new Map(state.selectedSequences) // for reactivity
    }
    if (selected) {
      state.selectedSequences.set(sequence.id, sequence)
      state.selectedSequences = new Map(state.selectedSequences) // for reactivity
      const maxX = displayedSequences.length
      const maxY = state.nbValidationColumns
      // unselect previously selected tasks
      state.sequenceSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
  },

  [CLEAR_SELECTED_SEQUENCES] (state) {
    state.selectedSequences = new Map()
  },

  [CLEAR_SEQUENCES] (state) {
    cache.sequences = []
    state.currentSequence = null
  },

  [SET_CURRENT_PRODUCTION] (state, production) {
    state.shotSearchText = ''
  },

  [SET_CURRENT_SEQUENCE] (state, sequenceId) {
    if (sequenceId) {
      if (sequenceId === 'main') {
        state.currentSequence = { id: 'main' }
      } else if (sequenceId === 'all') {
        state.currentSequence = { id: 'all' }
      } else {
        state.currentSequence = state.sequenceMap.get(sequenceId)
      }
    }
  },

  [SET_SEQUENCES_WITH_TASKS] (
    state,
    {
      episodeMap,
      userFilters,
      personMap,
      production,
      sequences,
      taskMap,
      taskTypeMap,
      taskStatusMap
    }
  ) {
    const validationColumns = {}
    let isDescription = false
    let isTime = false
    let isEstimation = false
    state.sequenceMap = new Map()
    sequences.forEach(sequence => {
      const taskIds = []
      const validations = new Map()
      let timeSpent = 0
      let estimation = 0
      const episode = episodeMap.get(sequence.episode_id)
      sequence.project_name = production.name
      sequence.production_id = production.id
      if (episode) {
        sequence.full_name = `${episode.name} / ${sequence.name}`
      } else {
        sequence.full_name = sequence.name
      }
      sequence.tasks.forEach(task => {
        helpers.populateTask(
          production, task, sequence, taskTypeMap, taskStatusMap
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
      sequence.tasks = taskIds
      sequence.validations = validations
      sequence.timeSpent = timeSpent
      sequence.estimation = estimation

      if (!isTime && sequence.timeSpent > 0) isTime = true
      if (!isEstimation && sequence.estimation > 0) isEstimation = true
      if (!isDescription && sequence.description) isDescription = true

      state.sequenceMap.set(sequence.id, sequence)
    })
    sequences = sortSequences(sequences)
    cache.sequences = sequences
    cache.result = sequences
    cache.sequenceIndex = buildSequenceIndex(sequences)

    const displayedSequences = cache.sequences
    const filledColumns = getFilledColumns(displayedSequences)

    state.sequenceValidationColumns = helpers.sortValidationColumns(
      production, Object.values(validationColumns), filledColumns, taskTypeMap
    )

    state.nbValidationColumns = state.sequenceValidationColumns.length
    state.isSequenceTime = isTime
    state.isSequenceEstimation = isEstimation
    state.isSequenceDescription = isDescription

    state.isSequencesLoading = false
    state.isSequencesLoadingError = false

    state.displayedSequences = displayedSequences
    state.displayedSequencesLength = displayedSequences.length
    state.sequenceFilledColumns = filledColumns

    const maxX = state.displayedSequences.length
    const maxY = state.nbValidationColumns
    state.sequenceSelectionGrid = buildSelectionGrid(maxX, maxY)
    helpers.setListStats(state, sequences)

    if (userFilters.sequence && userFilters.sequence[production.id]) {
      state.sequenceSearchQueries = userFilters.sequence[production.id]
    } else {
      state.sequenceSearchQueries = []
    }
  },

  [SET_SEQUENCE_SEARCH] (state, payload) {
    const sorting = state.sequenceSorting
    payload.sorting = sorting
    helpers.buildResult(state, payload)
  },

  [SET_SEQUENCE_STATS_SEARCH] (state, payload) {
    const sorting = state.sequenceSorting
    payload.sorting = sorting
    const result = helpers.buildResult(state, payload, false)

    state.searchSequenceFilters = getFilters({
      entryIndex: shotStore.cache.shotIndex,
      assetTypes: [],
      taskTypes: [],
      taskStatuses: [],
      descriptors:
        payload.production.descriptors.filter(d => d.entity_type === 'Shot'),
      persons: [],
      query: payload.sequenceSearch
    })
    state.displayedSequences = result
    state.displayedSequencesLength = result.length
    state.sequenceSearchText = payload.sequenceSearch
  },

  [SET_SEQUENCE_LIST_SCROLL_POSITION] (state, scrollPosition) {
    state.sequenceListScrollPosition = scrollPosition
  },

  [SAVE_SEQUENCE_SEARCH_END] (state, { searchQuery }) {
    state.sequenceSearchQueries.push(searchQuery)
    state.sequenceSearchQueries = sortByName(state.sequenceSearchQueries)
  },

  [REMOVE_SEQUENCE_SEARCH_END] (state, { searchQuery }) {
    state.sequenceSearchQueries = state
      .sequenceSearchQueries
      .filter((query) => query.name !== searchQuery.name)
  },

  [NEW_SEQUENCE_END] (state, { sequence }) {
    sequence.production_id = sequence.project_id
    sequence.preview_file_id = ''
    sequence.tasks = []
    sequence.validations = new Map()
    sequence.data = {}

    const maxX = state.displayedSequences.length + 1
    const maxY = state.nbValidationColumns
    state.sequenceSelectionGrid = buildSelectionGrid(maxX, maxY)

    cache.sequences.push(sequence)
    cache.sequences = sortByName(cache.sequences)
    state.displayedSequences = cache.sequences
    helpers.setListStats(state, cache.sequences)
    state.sequenceMap.set(sequence.id, sequence)
    state.sequenceFilledColumns = getFilledColumns(state.displayedSequences)
    // cache.sequenceIndex = buildNameIndex(cache.sequences)
  },

  [EDIT_SEQUENCE_END] (state, newSequence) {
    const sequence = state.sequenceMap.get(newSequence.id)
    if (sequence) {
      Object.assign(sequence, newSequence)
    }
    state.sequenceIndex = buildSequenceIndex(cache.sequences)
  },

  [LOAD_SEQUENCES_START] (state) {
    cache.sequences = []
    cache.result = []
    cache.sequenceIndex = {}
    state.sequenceMap = new Map()
    state.sequenceValidationColumns = []

    state.isSequencesLoading = true
    state.isSequencesLoadingError = false

    state.displayedsequences = []
    state.displayedsequencesLength = 0
    state.sequenceSearchQueries = []
    state.displayedSequences = []
    state.displayedSequencesLength = 0

    state.selectedsequences = new Map()
  },

  [LOAD_SEQUENCES_ERROR] (state) {
    state.isSequencesLoading = false
    state.isSequencesLoadingError = true
  },

  [LOAD_SEQUENCES_END] (
    state, { sequences, episodeMap, production, userFilters }
  ) {
    const sequenceMap = new Map()
    if (
      production &&
      userFilters.sequence &&
      userFilters.sequence[production.id]
    ) {
      state.sequenceSearchQueries = userFilters.sequence[production.id]
    } else {
      state.sequenceSearchQueries = []
    }
    if (!sequences) sequences = []
    sequences.forEach(sequence => {
      sequenceMap.set(sequence.id, sequence)
      if (sequence.parent_id) {
        const episode = episodeMap.get(sequence.parent_id)
        if (episode) {
          Object.assign(sequence, {
            episode_id: episode.id,
            episode_name: episode.name
          })
        }
      }
    })
    state.sequenceMap = sequenceMap
    cache.sequences = sortByName(sequences)
    state.sequenceIndex = buildSequenceIndex(cache.sequences)
    state.displayedSequences = cache.sequences
    state.displayedSequencesLength = cache.sequences.length
  },

  [SET_SEQUENCE_STATS] (state, { sequenceStats, taskTypeMap, production }) {
    state.sequenceValidationColumns =
      helpers.sortStatColumns(sequenceStats, taskTypeMap, production)
    state.sequenceStats = sequenceStats
  },

  [SET_SEQUENCE_RETAKE_STATS] (
    state, { sequenceRetakeStats, taskTypeMap, production }
  ) {
    state.sequenceValidationColumns =
      helpers.sortStatColumns(sequenceRetakeStats, taskTypeMap)
    state.sequenceRetakeStats = sequenceRetakeStats
  },

  [COMPUTE_SEQUENCE_STATS] (state, { taskMap, taskStatusMap }) {
    let shots = shotStore.cache.shots
    if (state.searchSequenceFilters.length > 0) {
      shots = applyFilters(shots, state.searchSequenceFilters, {})
      shots = shots.filter(shot => !shot.canceled)
    }
    state.sequenceStats = computeStats(
      shots,
      'sequence_id',
      taskStatusMap,
      taskMap
    )
  },

  [CREATE_TASKS_END] (
    state,
    { tasks, production, taskTypeMap, taskStatusMap }
  ) {
    tasks.forEach(task => {
      if (task) {
        const sequence = state.sequenceMap.get(task.entity_id)
        if (sequence) {
          helpers.populateTask(
            production, task, sequence, taskTypeMap, taskStatusMap
          )
          sequence.validations.set(task.task_type_id, task.id)
          const validations = sequence.validations
          sequence.validations = []
          Vue.set(sequence, 'validations', validations)
          sequence.tasks.push(task.id)
        }
      }
    })
  },

  [REMOVE_SELECTED_TASK] (state, validationInfo) {
    if (state.sequenceSelectionGrid[0] &&
        state.sequenceSelectionGrid[validationInfo.x]) {
      state.sequenceSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [ADD_SELECTED_TASK] (state, validationInfo) {
    if (state.sequenceSelectionGrid[0] &&
        state.sequenceSelectionGrid[validationInfo.x]) {
      state.sequenceSelectionGrid[validationInfo.x][validationInfo.y] = true
      state.selectedSequences = new Map() // unselect all previously selected lines
    }
  },

  [ADD_SELECTED_TASKS] (state, selection) {
    let tmpGrid = JSON.parse(JSON.stringify(state.sequenceSelectionGrid))
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
    state.selectedSequences = new Map() // unselect all previously selected lines
    state.sequenceSelectionGrid = tmpGrid
  },

  [CLEAR_SELECTED_TASKS] (state, validationInfo) {
    const tmpGrid = JSON.parse(JSON.stringify(state.sequenceSelectionGrid))
    state.sequenceSelectionGrid = clearSelectionGrid(tmpGrid)
  },

  [NEW_TASK_END] (state, { task, production, taskTypeMap, taskStatusMap }) {
    const sequence = state.sequenceMap.get(task.entity_id)
    if (sequence && task) {
      task = helpers.populateTask(
        production,
        task,
        sequence,
        taskTypeMap,
        taskStatusMap
      )
      // Add Column if it is missing
      if (!state.sequenceValidationColumns.includes(task.task_type_id)) {
        state.sequenceValidationColumns.push(task.task_type_id)
        state.sequenceFilledColumns[task.task_type_id] = true
      }
      // Push task and readds the whole map to activate the realtime display.
      sequence.tasks.push(task.id)
      if (!sequence.validations) sequence.validations = new Map()
      sequence.validations.set(task.task_type_id, task.id)
      Vue.set(sequence, 'validations', new Map(sequence.validations))
    }
  },

  [DELETE_TASK_END] (state, task) {
    const sequence = state.sequenceMap.get(task.entity_id)
    if (sequence) {
      const validations = new Map(sequence.validations)
      validations.delete(task.task_type_id)
      delete sequence.validations
      Vue.set(sequence, 'validations', validations)
      const taskIndex = sequence.tasks.findIndex(
        (sequenceTaskId) => sequenceTaskId === task.id
      )
      sequence.tasks.splice(taskIndex, 1)
    }
  },

  [ADD_SEQUENCE] (state, { sequence, episodeMap }) {
    cache.sequences.push(sequence)
    const sortedSequences = sortSequences(cache.sequences)
    state.sequenceMap.set(sequence.id, sequence)
    if (sequence.parent_id) {
      const episode = episodeMap.get(sequence.parent_id)
      if (episode) {
        Object.assign(sequence, {
          episode_id: episode.id,
          episode_name: episode.name
        })
      }
    }
    cache.sequences = sortedSequences
    state.displayedSequences.push(sequence)
    state.displayedSequences = sortSequences(state.displayedSequences)
    state.sequenceIndex = buildSequenceIndex(sortedSequences)
    state.displayedSequencesLength = sortedSequences.length
  },

  [UPDATE_SEQUENCE] (state, sequence) {
    Object.assign(state.sequenceMap.get(sequence.id), sequence)
    state.sequenceIndex = buildSequenceIndex(cache.sequences)
  },

  [REMOVE_SEQUENCE] (state, sequence) {
    delete state.sequenceMap.get(sequence.id)
    cache.sequences = removeModelFromList(cache.sequences, sequence)
    state.displayedSequences =
      removeModelFromList(state.displayedSequences, sequence)
    state.sequenceIndex = buildSequenceIndex(cache.sequences)
  },

  [LOCK_SEQUENCE] (state, sequence) {
    sequence = state.sequenceMap.get(sequence.id)
    if (sequence) sequence.lock = true
  },

  [UNLOCK_SEQUENCE] (state, sequence) {
    sequence = state.sequenceMap.get(sequence.id)
    if (sequence) sequence.lock = false
  }
}

export default {
  actions,
  cache,
  getters,
  mutations,
  state
}

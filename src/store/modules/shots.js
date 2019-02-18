import Vue from 'vue'
import shotsApi from '../api/shots'
import peopleApi from '../api/people'
import tasksStore from './tasks'
import peopleStore from './people'
import taskTypesStore from './tasktypes'

import {PAGE_SIZE} from '../../lib/pagination'
import {
  sortShots,
  sortSequences,
  sortTasks,
  sortByName
} from '../../lib/sorting'
import {
  appendSelectionGrid,
  buildSelectionGrid,
  clearSelectionGrid,
  computeStats,
  getFilledColumns
} from '../../lib/helpers'
import {
  buildShotIndex,
  buildSequenceIndex,
  buildEpisodeIndex,
  indexSearch
} from '../../lib/indexing'
import {
  applyFilters,
  getFilters,
  getKeyWords
} from '../../lib/filtering'

import {
  LOAD_SHOTS_START,
  LOAD_SHOTS_ERROR,
  LOAD_SHOTS_END,
  LOAD_EPISODES_END,
  LOAD_SEQUENCES_END,

  LOAD_SHOT_END,
  LOAD_SHOT_CASTING_END,

  SHOT_CSV_FILE_SELECTED,
  IMPORT_SHOTS_START,
  IMPORT_SHOTS_END,

  LOAD_OPEN_PRODUCTIONS_END,

  NEW_SHOT_START,
  NEW_SHOT_ERROR,
  NEW_SHOT_END,

  NEW_SEQUENCE_START,
  NEW_SEQUENCE_ERROR,
  NEW_SEQUENCE_END,

  NEW_EPISODE_START,
  NEW_EPISODE_ERROR,
  NEW_EPISODE_END,

  EDIT_SHOT_START,
  EDIT_SHOT_ERROR,
  EDIT_SHOT_END,

  EDIT_SEQUENCE_START,
  EDIT_SEQUENCE_ERROR,
  EDIT_SEQUENCE_END,

  EDIT_EPISODE_START,
  EDIT_EPISODE_ERROR,
  EDIT_EPISODE_END,

  DELETE_SHOT_START,
  DELETE_SHOT_ERROR,
  DELETE_SHOT_END,

  DELETE_SEQUENCE_START,
  DELETE_SEQUENCE_ERROR,
  DELETE_SEQUENCE_END,

  DELETE_EPISODE_START,
  DELETE_EPISODE_ERROR,
  DELETE_EPISODE_END,

  RESTORE_SHOT_START,
  RESTORE_SHOT_ERROR,
  RESTORE_SHOT_END,

  NEW_TASK_COMMENT_END,
  NEW_TASK_END,
  CREATE_TASKS_END,

  SET_SHOT_SEARCH,
  SET_SEQUENCE_SEARCH,
  SET_EPISODE_SEARCH,

  RESET_PRODUCTION_PATH,
  SET_CURRENT_PRODUCTION,
  SET_CURRENT_EPISODE,
  DISPLAY_MORE_SHOTS,
  DISPLAY_MORE_SEQUENCES,
  DISPLAY_MORE_EPISODES,
  CLEAR_EPISODES,

  SET_SHOT_LIST_SCROLL_POSITION,
  SET_SEQUENCE_LIST_SCROLL_POSITION,
  SET_EPISODE_LIST_SCROLL_POSITION,

  REMOVE_SELECTED_TASK,
  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  DELETE_TASK_END,
  CLEAR_SELECTED_TASKS,

  SET_PREVIEW,

  SAVE_SHOT_SEARCH_END,
  REMOVE_SHOT_SEARCH_END,

  COMPUTE_SEQUENCE_STATS,
  COMPUTE_EPISODE_STATS,
  SET_EPISODE_STATS,

  RESET_ALL
} from '../mutation-types'

const cache = {
  shots: [],
  shotIndex: []
}

const helpers = {
  getTask (taskId) {
    return tasksStore.state.taskMap[taskId]
  },
  getTaskStatus (taskStatusId) {
    return tasksStore.state.taskStatusMap[taskStatusId]
  },
  getTaskType (taskTypeId) {
    return taskTypesStore.state.taskTypeMap[taskTypeId]
  },
  getPerson (personId) {
    return peopleStore.state.personMap[personId]
  },

  populateTask (task, shot, production) {
    task.name = helpers.getTaskType(task.task_type_id).priority.toString()
    task.task_status_short_name =
      helpers.getTaskStatus(task.task_status_id).short_name

    let entityName = `${shot.sequence_name} / ${shot.name}`
    if (shot.episode_name) {
      entityName = `${shot.episode_name} / ${entityName}`
    }

    Object.assign(task, {
      project_id: shot.production_id,

      entity_name: entityName,
      entity_type_name: shot.shot_type_name,
      sequence_name: shot.sequence_name,
      entity: {
        id: shot.id,
        preview_file_id: shot.preview_file_id
      }
    })

    return task
  }
}

const initialState = {
  shotMap: {},
  sequences: [],
  episodes: [],
  shotSearchText: '',
  shotSearchQueries: [],
  sequenceSearchText: '',
  sequenceStats: {},
  episodeSearchText: '',
  episodeStats: {},

  currentEpisode: null,
  episodeValidationColumns: [],

  isFps: false,
  isFrameIn: false,
  isFrameOut: false,

  displayedShots: [],
  displayedShotsLength: 0,
  displayedSequences: [],
  displayedSequencesLength: 0,
  displayedEpisodes: [],
  displayedEpisodesLength: 0,
  sequenceIndex: {},
  shotFilledColumns: {},

  sequenceMap: {},
  episodeMap: {},
  shotCreated: '',
  shotSelectionGrid: {},
  sequenceSelectionGrid: {},

  isShotsLoading: false,
  isShotsLoadingError: false,
  shotsCsvFormData: null,

  editShot: {
    isLoading: false,
    isError: false
  },

  deleteShot: {
    isLoading: false,
    isError: false
  },

  restoreShot: {
    isLoading: false,
    isError: false
  },

  shotListScrollPosition: 0,
  sequenceListScrollPosition: 0,
  episodeListScrollPosition: 0
}

const state = {
  ...initialState
}

const getters = {
  sequences: state => state.sequences,
  sequenceMap: state => state.sequenceMap,
  sequenceStats: state => state.sequenceStats,
  episodes: state => state.episodes,
  episodeMap: state => state.episodeMap,
  episodeStats: state => state.episodeStats,

  currentEpisode: state => state.currentEpisode,

  shotSearchQueries: state => state.shotSearchQueries,
  shotMap: state => state.shotMap,

  isFps: state => state.isFps,
  isFrameIn: state => state.isFrameIn,
  isFrameOut: state => state.isFrameOut,

  shotSearchText: state => state.shotSearchText,
  sequenceSearchText: state => state.sequenceSearchText,
  episodeSearchText: state => state.episodeSearchText,
  shotSelectionGrid: state => state.shotSelectionGrid,
  sequenceSelectionGrid: state => state.sequenceSelectionGrid,

  displayedShots: state => state.displayedShots,
  displayedShotsLength: state => state.displayedShotsLength,
  displayedSequences: state => state.displayedSequences,
  displayedSequencesLength: state => state.displayedSequencesLength,
  displayedEpisodes: state => state.displayedEpisodes,
  displayedEpisodesLength: state => state.displayedEpisodesLength,
  shotFilledColumns: state => state.shotFilledColumns,

  isShotsLoading: state => state.isShotsLoading,
  isShotsLoadingError: state => state.isShotsLoadingError,

  editShot: state => state.editShot,
  deleteShot: state => state.deleteShot,
  restoreShot: state => state.restoreShot,
  shotCreated: state => state.shotCreated,

  shotsCsvFormData: state => state.shotsCsvFormData,
  shotListScrollPosition: state => state.shotListScrollPosition,
  sequenceListScrollPosition: state => state.sequenceListScrollPosition,
  episodeListScrollPosition: state => state.episodeListScrollPosition,

  episodeValidationColumns: state => state.episodeValidationColumns,

  shotsByEpisode: state => {
    const shotsBySequence = []
    let sequenceShots = []
    let previousShot = null

    for (let shot of Object.values(state.shotMap)) {
      if (previousShot && shot.sequence_name !== previousShot.sequence_name) {
        shotsBySequence.push(sequenceShots.slice(0))
        sequenceShots = []
      }
      sequenceShots.push(shot)
      previousShot = shot
    }
    shotsBySequence.push(sequenceShots)

    return shotsBySequence
  },

  getSequenceOptions: state => state.sequences.map(
    (sequence) => { return { label: sequence.name, value: sequence.id } }
  ),

  getEpisodeOptions: state => state.episodes.map(
    (episode) => { return { label: episode.name, value: episode.id } }
  ),

  isSingleEpisode: state => state.episodes.length < 2,

  episodeOptions: state => state.episodes.map(
    (episode) => { return { label: episode.name, value: episode.id } }
  )
}

const actions = {

  clearEpisodes ({ commit }) {
    commit(CLEAR_EPISODES)
  },

  loadEpisodes ({ commit, state, rootGetters }, callback) {
    const currentProduction = rootGetters.currentProduction
    shotsApi.getEpisodes(currentProduction, (err, episodes) => {
      if (err) console.log(err)
      commit(LOAD_EPISODES_END, episodes)
      if (callback) callback()
    })
  },

  loadShots ({ commit, dispatch, state, rootGetters }, callback) {
    const production = rootGetters.currentProduction
    const userFilters = rootGetters.userFilters
    const taskTypeMap = rootGetters.taskTypeMap
    const personMap = rootGetters.personMap
    const isTVShow = rootGetters.isTVShow
    const episode = rootGetters.currentEpisode

    if (isTVShow && !episode) {
      return callback()
    }

    if (state.isShotsLoading) {
      return callback()
    }

    commit(LOAD_SHOTS_START)
    shotsApi.getSequences(production, episode, (err, sequences) => {
      if (err) commit(LOAD_SHOTS_ERROR)
      else {
        shotsApi.getShots(production, episode, (err, shots) => {
          if (err) commit(LOAD_SHOTS_ERROR)
          else {
            shots.forEach((shot) => {
              shot.project_name = production.name
              return shot
            })
            commit(LOAD_SEQUENCES_END, sequences)
            commit(
              LOAD_SHOTS_END,
              { production, shots, userFilters, taskTypeMap, personMap }
            )
          }
          if (callback) callback(err)
        })
      }
    })
  },

  loadShot ({ commit, state, rootGetters }, { shotId, callback }) {
    const taskTypeMap = rootGetters.taskTypeMap
    shotsApi.getShot(shotId, (err, shot) => {
      if (!err) {
        commit(LOAD_SHOT_END, { shot, taskTypeMap })
      }
      if (callback) callback(err)
    })
  },

  loadShotCasting ({ commit, rootGetters }, { shot, callback }) {
    const assetMap = rootGetters.assetMap
    shotsApi.getCasting(shot, (err, casting) => {
      if (!err) {
        commit(LOAD_SHOT_CASTING_END, { shot, casting, assetMap })
      }
      if (callback) callback(err, casting)
    })
  },

  newShot ({ commit, dispatch, rootGetters }, {shot, callback}) {
    commit(NEW_SHOT_START)
    shotsApi.newShot(shot, (err, shot) => {
      if (err) {
        commit(NEW_SHOT_ERROR)
        if (callback) callback(err)
      } else {
        commit(NEW_SHOT_END, shot)
        const taskTypeIds = Object.values(rootGetters.shotValidationColumns)
        const createTaskPromises = taskTypeIds.map(
          (taskTypeId) => dispatch('createTask', {
            entityId: shot.id,
            projectId: shot.project_id,
            taskTypeId: taskTypeId,
            type: 'shots'
          })
        )

        Promise.all(createTaskPromises).then(() => {
          if (callback) callback(null, shot)
        }).catch((err) => {
          console.log(err)
        })
      }
    })
  },

  newSequence ({ commit, state }, { sequence, callback }) {
    commit(NEW_SEQUENCE_START)
    shotsApi.newSequence(sequence, (err, sequence) => {
      if (err) {
        commit(NEW_SEQUENCE_ERROR)
      } else {
        commit(NEW_SEQUENCE_END, sequence)
      }
      if (callback) callback(err, sequence)
    })
  },

  newEpisode ({ commit, state }, payload) {
    commit(NEW_EPISODE_START)
    shotsApi.newEpisode(payload.episode, (err, episode) => {
      if (err) {
        commit(NEW_EPISODE_ERROR)
      } else {
        commit(NEW_EPISODE_END, episode)
      }
      if (payload.callback) payload.callback(err, episode)
    })
  },

  editShot ({ commit, state }, payload) {
    commit(EDIT_SHOT_START)
    shotsApi.updateShot(payload.data, (err, shot) => {
      if (err) {
        commit(EDIT_SHOT_ERROR)
      } else {
        commit(EDIT_SHOT_END, shot)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  editEpisode ({ commit, state }, episode) {
    return new Promise((resolve, reject) => {
      commit(EDIT_EPISODE_START)
      shotsApi.updateEpisode(episode, (err, episode) => {
        if (err) {
          commit(EDIT_EPISODE_ERROR)
          reject(err)
        } else {
          commit(EDIT_EPISODE_END, episode)
          resolve(episode)
        }
      })
    })
  },

  editSequence ({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      commit(EDIT_SEQUENCE_START)
      shotsApi.updateSequence(data, (err, sequence) => {
        if (err) {
          commit(EDIT_SEQUENCE_ERROR)
          reject(err)
        } else {
          commit(EDIT_SEQUENCE_END, sequence)
          resolve(sequence)
        }
      })
    })
  },

  deleteShot ({ commit, state }, { shot, callback }) {
    commit(DELETE_SHOT_START)
    shotsApi.deleteShot(shot, (err) => {
      if (err) {
        commit(DELETE_SHOT_ERROR)
      } else {
        commit(DELETE_SHOT_END, shot)
      }
      if (callback) callback(err)
    })
  },

  deleteEpisode ({ commit, state }, episode) {
    return new Promise((resolve, reject) => {
      commit(DELETE_EPISODE_START)
      shotsApi.deleteEpisode(episode, (err) => {
        if (err) {
          commit(DELETE_EPISODE_ERROR)
          reject(err)
        } else {
          commit(DELETE_EPISODE_END, episode)
          resolve(episode)
        }
      })
    })
  },

  deleteSequence ({ commit, state }, sequence) {
    return new Promise((resolve, reject) => {
      commit(DELETE_SEQUENCE_START)
      shotsApi.deleteSequence(sequence, (err) => {
        if (err) {
          commit(DELETE_SEQUENCE_ERROR)
        } else {
          commit(DELETE_SEQUENCE_END, sequence)
        }
        if (err) reject(err)
        else resolve(sequence)
      })
    })
  },

  restoreShot ({ commit, state }, payload) {
    commit(RESTORE_SHOT_START)
    const shot = payload.shot
    shotsApi.restoreShot(shot, (err) => {
      if (err) {
        commit(RESTORE_SHOT_ERROR)
      } else {
        commit(RESTORE_SHOT_END, shot)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  uploadShotFile ({ commit, state, rootGetters }, callback) {
    commit(IMPORT_SHOTS_START)
    const currentProduction = rootGetters.currentProduction
    shotsApi.postCsv(currentProduction, state.shotsCsvFormData, (err) => {
      commit(IMPORT_SHOTS_END)
      if (callback) callback(err)
    })
  },

  displayMoreShots ({ commit, rootGetters }) {
    commit(DISPLAY_MORE_SHOTS, {
      taskTypeMap: rootGetters.taskTypeMap,
      taskStatusMap: rootGetters.taskStatusMap,
      taskMap: rootGetters.taskMap,
      production: rootGetters.currentProduction
    })
  },

  displayMoreSequences ({commit}) {
    commit(DISPLAY_MORE_SEQUENCES)
  },

  displayMoreEpisodes ({commit}) {
    commit(DISPLAY_MORE_EPISODES)
  },

  setShotSearch ({commit, rootGetters}, shotSearch) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskTypeMap = rootGetters.taskTypeMap
    const taskMap = rootGetters.taskMap
    const production = rootGetters.currentProduction
    commit(
      SET_SHOT_SEARCH,
      { shotSearch, taskStatusMap, taskMap, taskTypeMap, production }
    )
  },

  saveShotSearch ({ commit, rootGetters }, searchQuery) {
    return new Promise((resolve, reject) => {
      const query = state.shotSearchQueries.find(
        (query) => query.name === searchQuery
      )
      const production = rootGetters.currentProduction

      if (!query) {
        peopleApi.createFilter(
          'shot',
          searchQuery,
          searchQuery,
          production.id,
          null,
          (err, searchQuery) => {
            commit(SAVE_SHOT_SEARCH_END, { searchQuery, production })
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

  removeShotSearch ({ commit, rootGetters }, searchQuery) {
    return new Promise((resolve, reject) => {
      const production = rootGetters.currentProduction
      peopleApi.removeFilter(searchQuery, (err) => {
        commit(REMOVE_SHOT_SEARCH_END, { searchQuery, production })
        if (err) reject(err)
        else resolve()
      })
    })
  },

  initSequences ({ commit, dispatch, state, rootState, rootGetters }) {
    return new Promise((resolve, reject) => {
      const productionId = rootState.route.params.production_id
      dispatch('setLastProductionScreen', 'sequences')

      if (state.sequences.length === 0 ||
          state.sequences[0].production_id !== productionId) {
        dispatch('loadShots', (err) => {
          if (err) {
            reject(err)
          } else {
            dispatch('computeSequenceStats')
            resolve()
          }
        })
      }
    })
  },

  setSequenceSearch ({commit}, searchQuery) {
    commit(SET_SEQUENCE_SEARCH, searchQuery)
  },

  setSequenceListScrollPosition ({ commit }, scrollPosition) {
    commit(SET_SEQUENCE_LIST_SCROLL_POSITION, scrollPosition)
  },

  computeSequenceStats ({ commit, rootGetters }) {
    const taskStatusMap = rootGetters.taskStatusMap
    const taskMap = rootGetters.taskMap
    commit(COMPUTE_SEQUENCE_STATS, { taskStatusMap, taskMap })
  },

  setCurrentEpisode ({ commit, rootGetters }, episodeId) {
    commit(SET_CURRENT_EPISODE, episodeId)

    const productionId = rootGetters.currentProduction.id
    commit(RESET_PRODUCTION_PATH, { productionId, episodeId })
  },

  initEpisodes ({ commit, dispatch, state, rootState, rootGetters }) {
    return new Promise((resolve, reject) => {
      const productionId = rootState.route.params.production_id
      const isTVShow = rootGetters.isTVShow
      dispatch('setLastProductionScreen', 'episodes')

      if (state.episodes.length === 0 ||
          state.episodes[0].production_id !== productionId) {
        if (isTVShow) {
          dispatch('loadEpisodes', () => {
            return dispatch('loadEpisodeStats', productionId)
          })
        } else {
          dispatch('computEpisodeStats')
          resolve()
        }
      }
    })
  },

  loadEpisodeStats ({ commit }, productionId) {
    return new Promise((resolve, reject) => {
      commit(SET_EPISODE_STATS, {})
      shotsApi.getEpisodeStats(productionId)
        .then((episodeStats) => {
          commit(SET_EPISODE_STATS, episodeStats)
          resolve()
        })
        .catch(reject)
    })
  },

  setEpisodeSearch ({commit}, searchQuery) {
    commit(SET_EPISODE_SEARCH, searchQuery)
  },

  setEpisodeListScrollPosition ({ commit }, scrollPosition) {
    commit(SET_EPISODE_LIST_SCROLL_POSITION, scrollPosition)
  },

  computeEpisodeStats ({ commit, dispatch, rootGetters }) {
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
  [LOAD_SHOTS_START] (state) {
    cache.shots = []
    cache.shotIndex = {}
    state.shotMap = {}

    state.sequences = []
    state.isShotsLoading = true
    state.isShotsLoadingError = false

    state.sequenceIndex = {}
    state.displayedShots = []
    state.displayedShotsLength = 0
    state.shotSearchQueries = []
    state.displayedSequences = []
    state.displayedSequencesLength = 0
    state.displayedEpisodes = []
    state.displayedEpisodesLength = 0
  },

  [LOAD_SHOTS_ERROR] (state) {
    state.isShotsLoading = false
    state.isShotsLoadingError = true
  },

  [LOAD_SHOTS_END] (
    state,
    { production, shots, userFilters, taskTypeMap }
  ) {
    const validationColumns = {}
    let isFps = false
    let isFrameIn = false
    let isFrameOut = false
    shots = sortShots(shots)

    state.shotMap = {}
    shots.forEach((shot) => {
      shot.production_id = production.id
      shot.tasks.forEach((task) => {
        helpers.populateTask(task, shot, production)
        validationColumns[task.task_type_id] = true
      })

      if (!isFps && shot.data.fps) isFps = true
      if (!isFrameIn && shot.data.frame_in) isFrameIn = true
      if (!isFrameOut && shot.data.frame_out) isFrameOut = true

      state.shotMap[shot.id] = shot
    })

    state.isShotsLoading = false
    state.isShotsLoadingError = false
    state.nbValidationColumns = Object.keys(validationColumns).length

    state.isFps = isFps
    state.isFrameIn = isFrameIn
    state.isFrameOut = isFrameOut

    cache.shotIndex = buildShotIndex(shots)

    state.displayedShots = shots.slice(0, PAGE_SIZE)
    state.displayedShotsLength = shots.length
    state.shotFilledColumns = getFilledColumns(state.displayedShots)
    cache.shots = shots

    const maxX = state.displayedShots.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)

    if (userFilters.shot && userFilters.shot[production.id]) {
      state.shotSearchQueries = userFilters.shot[production.id]
    } else {
      state.shotSearchQueries = []
    }
  },

  [SAVE_SHOT_SEARCH_END] (state, { searchQuery }) {
    state.shotSearchQueries.push(searchQuery)
    state.shotSearchQueries = sortByName(state.shotSearchQueries)
  },

  [REMOVE_SHOT_SEARCH_END] (state, { searchQuery }) {
    const queryIndex = state.shotSearchQueries.findIndex(
      (query) => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.shotSearchQueries.splice(queryIndex, 1)
    }
  },

  [LOAD_SEQUENCES_END] (state, sequences) {
    const sequenceMap = {}
    sequences.forEach((sequence) => {
      sequenceMap[sequence.id] = sequence
      if (sequence.parent_id) {
        const episode = state.episodeMap[sequence.parent_id]
        if (episode) {
          Object.assign(sequence, {
            episode_id: episode.id,
            episode_name: episode.name
          })
        }
      }
    })
    state.sequenceMap = sequenceMap
    state.sequences = sortSequences(sequences)

    state.sequenceIndex = buildSequenceIndex(state.sequences)
    state.displayedSequences = state.sequences.slice(0, PAGE_SIZE)
    state.displayedSequencesLength = state.sequences.length
  },

  [LOAD_EPISODES_END] (state, episodes) {
    const episodeMap = {}
    if (!episodes) episodes = []
    episodes.forEach((episode) => {
      episodeMap[episode.id] = episode
    })
    state.episodeMap = episodeMap
    state.episodes = sortByName(episodes)

    state.episodeIndex = buildEpisodeIndex(state.episodes)
    state.displayedEpisodes = state.episodes.slice(0, PAGE_SIZE)
    state.displayedEpisodesLength = state.episodes.length

    if (state.episodes.length > 0) {
      state.currentEpisode = state.episodes[0]
    }
  },

  [LOAD_SHOT_END] (state, { shot, taskTypeMap }) {
    shot.tasks.forEach((task) => {
      helpers.populateTask(task, shot)
    })
    shot.tasks = sortTasks(shot.tasks, taskTypeMap)
    state.shotMap[shot.id] = shot
  },

  [SHOT_CSV_FILE_SELECTED] (state, formData) {
    state.shotsCsvFormData = formData
  },
  [IMPORT_SHOTS_START] (state) {},
  [IMPORT_SHOTS_END] (state) {
    state.shotsCsvFormData = null
  },

  [LOAD_OPEN_PRODUCTIONS_END] (state, projects) {
    state.openProductions = projects
  },

  [EDIT_SHOT_START] (state, data) {
    state.editShot.isLoading = true
    state.editShot.isError = false
  },

  [EDIT_SHOT_ERROR] (state) {
    state.editShot.isLoading = false
    state.editShot.isError = true
  },

  [EDIT_SHOT_END] (state, newShot) {
    const shot = state.shotMap[newShot.id]
    const sequence = state.sequences.find(
      (sequence) => sequence.id === newShot.parent_id
    )
    newShot.sequence_name = sequence.name

    if (shot) {
      Object.assign(shot, newShot)
    } else {
      cache.shots.push(newShot)
      cache.shots = sortShots(cache.shots)
      state.shotMap[newShot.id] = newShot

      const maxX = state.displayedShots.length
      const maxY = state.nbValidationColumns
      state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)
    }
    state.editShot = {
      isLoading: false,
      isError: false
    }
    cache.shotIndex = buildShotIndex(cache.shots)
    state.shotCreated = newShot.name

    if (newShot.data.fps) state.isFps = true
    if (newShot.data.frame_in) state.isFrameIn = true
    if (newShot.data.frame_out) state.isFrameOut = true
  },

  [EDIT_SEQUENCE_START] (state, data) {},
  [EDIT_SEQUENCE_ERROR] (state) {},
  [EDIT_SEQUENCE_END] (state, newSequence) {
    const sequence = state.sequenceMap[newSequence.id]
    if (sequence) {
      Object.assign(sequence, newSequence)
    }
    state.sequenceIndex = buildSequenceIndex(state.sequences)
  },

  [EDIT_EPISODE_START] (state, data) {},
  [EDIT_EPISODE_ERROR] (state) {},
  [EDIT_EPISODE_END] (state, newEpisode) {
    const episode = state.episodeMap[newEpisode.id]
    if (episode) {
      Object.assign(episode, newEpisode)
    }
    state.episodeIndex = buildEpisodeIndex(state.episodes)
  },

  [DELETE_SHOT_START] (state) {
    state.deleteShot = {
      isLoading: true,
      isError: false
    }
  },
  [DELETE_SHOT_ERROR] (state) {
    state.deleteShot = {
      isLoading: false,
      isError: true
    }
  },
  [DELETE_SHOT_END] (state, shotToDelete) {
    const shot = state.shotMap[shotToDelete.id]

    if (shot.tasks.length > 0 && !shot.canceled) {
      shot.canceled = true
    } else {
      const shotToDeleteIndex = cache.shots.findIndex(
        (shot) => shot.id === shotToDelete.id
      )
      const displayedShotToDeleteIndex = state.displayedShots.findIndex(
        (shot) => shot.id === shotToDelete.id
      )
      cache.shots.splice(shotToDeleteIndex, 1)
      state.displayedShots.splice(displayedShotToDeleteIndex, 1)
      state.shotMap[shotToDelete.id] = undefined
    }

    state.deleteShot = {
      isLoading: false,
      isError: false
    }
    cache.shotIndex = buildShotIndex(cache.shots)
  },

  [DELETE_SEQUENCE_START] (state) {},
  [DELETE_SEQUENCE_ERROR] (state) {},
  [DELETE_SEQUENCE_END] (state, sequenceToDelete) {
    const sequenceToDeleteIndex = state.sequences.findIndex(
      (sequence) => sequence.id === sequenceToDelete.id
    )
    const displayedSequenceToDeleteIndex = state.sequences.findIndex(
      (sequence) => sequence.id === sequenceToDelete.id
    )
    state.sequences.splice(sequenceToDeleteIndex, 1)
    state.displayedSequences.splice(displayedSequenceToDeleteIndex, 1)
    state.sequenceMap[sequenceToDelete.id] = undefined
    state.sequenceIndex = buildSequenceIndex(state.sequences)
  },

  [DELETE_EPISODE_START] (state) {},
  [DELETE_EPISODE_ERROR] (state) {},
  [DELETE_EPISODE_END] (state, episodeToDelete) {
    const episodeToDeleteIndex = state.episodes.findIndex(
      (episode) => episode.id === episodeToDelete.id
    )
    const displayedEpisodeToDeleteIndex = state.episodes.findIndex(
      (episode) => episode.id === episodeToDelete.id
    )
    state.episodes.splice(episodeToDeleteIndex, 1)
    state.displayedEpisodes.splice(displayedEpisodeToDeleteIndex, 1)
    state.episodeMap[episodeToDelete.id] = undefined
    state.episodeIndex = buildEpisodeIndex(state.episodes)
  },

  [RESTORE_SHOT_START] (state) {
    state.restoreShot = {
      isLoading: true,
      isError: false
    }
  },
  [RESTORE_SHOT_ERROR] (state) {
    state.restoreShot = {
      isLoading: false,
      isError: true
    }
  },
  [RESTORE_SHOT_END] (state, shotToRestore) {
    const shot = state.shotMap[shotToRestore.id]
    shot.canceled = false
    state.restoreShot = {
      isLoading: false,
      isError: false
    }
    cache.shotIndex = buildShotIndex(cache.shots)
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {},

  [SET_SHOT_SEARCH] (
    state,
    { shotSearch, taskStatusMap, taskMap, taskTypeMap, production }
  ) {
    const taskTypes = Object.values(taskTypeMap)
    const taskStatuses = Object.values(taskStatusMap)

    const query = shotSearch
    const keywords = getKeyWords(query) || []
    const filters = getFilters(
      cache.shotIndex,
      taskTypes,
      taskStatuses,
      production.descriptors,
      query
    )
    let result = indexSearch(cache.shotIndex, keywords) || cache.shots
    result = applyFilters(result, filters, taskMap)

    state.displayedShots = result.slice(0, PAGE_SIZE)
    state.displayedShotsLength = result.length
    state.shotFilledColumns = getFilledColumns(state.displayedShots)
    state.shotSearchText = shotSearch

    const maxX = state.displayedShots.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)
  },

  [SET_SEQUENCE_SEARCH] (state, sequenceSearch) {
    const keywords = getKeyWords(sequenceSearch)
    const result =
      indexSearch(state.sequenceIndex, keywords) || state.sequences

    state.displayedSequences = result.slice(0, PAGE_SIZE)
    state.displayedSequencesLength = result.length
    state.sequenceSearchText = sequenceSearch
  },

  [SET_EPISODE_SEARCH] (state, episodeSearch) {
    const keywords = getKeyWords(episodeSearch)
    const result =
      indexSearch(state.episodeIndex, keywords) || state.episodes

    state.displayedEpisodes = result.slice(0, PAGE_SIZE)
    state.displayedEpisodesLength = result.length
    state.episodeSearchText = episodeSearch
  },

  [NEW_SHOT_START] (state) {},
  [NEW_SHOT_ERROR] (state) {},
  [NEW_SHOT_END] (state, shot) {
    const sequence = state.sequenceMap[shot.parent_id]
    const episode = state.episodeMap[sequence.parent_id]
    shot.production_id = shot.project_id
    shot.sequence_name = sequence.name
    shot.sequence_id = sequence.id
    shot.episode_name = episode ? episode.name : null
    shot.episode_id = episode ? episode.id : null
    shot.preview_file_id = ''

    shot.tasks = []
    shot.validations = {}
    shot.data = {}

    cache.shots.push(shot)
    cache.shots = sortShots(cache.shots)
    state.displayedShots = cache.shots.slice(0, PAGE_SIZE)
    state.shotFilledColumns = getFilledColumns(state.displayedShots)
    state.shotMap[shot.id] = shot
    cache.shotIndex = buildShotIndex(cache.shots)

    const maxX = state.displayedShots.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)

    if (shot.data.fps) state.isFps = true
    if (shot.data.frame_in) state.isFrameIn = true
    if (shot.data.frame_out) state.isFrameOut = true
  },

  [NEW_SEQUENCE_START] (state) {},
  [NEW_SEQUENCE_ERROR] (state) {},
  [NEW_SEQUENCE_END] (state, sequence) {
    if (sequence.parent_id) {
      const episode = state.episodeMap[sequence.parent_id]
      sequence.episode_id = episode.id
      sequence.episode_name = episode.name
    }
    state.sequences.push(sequence)
    state.sequences = sortSequences(state.sequences)
    state.sequenceMap[sequence.id] = sequence
    state.sequenceIndex = buildSequenceIndex(state.sequences)
  },

  [NEW_EPISODE_START] (state) {},
  [NEW_EPISODE_ERROR] (state) {},
  [NEW_EPISODE_END] (state, episode) {
    state.episodes.push(episode)
    state.episodes = sortByName(state.episodes)
    state.displayedEpisodes = state.episodes
    state.episodeMap[episode.id] = episode
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task) {
        const shot = state.shotMap[task.entity_id]
        if (shot) {
          const validations = {...shot.validations}
          Vue.set(validations, task.task_type_id, task.id)
          delete shot.validations
          Vue.set(shot, 'validations', validations)
        }
      }
    })
  },

  [DISPLAY_MORE_SHOTS] (state, {
    taskTypeMap,
    taskStatusMap,
    taskMap,
    production
  }) {
    let shots = cache.shots
    if (state.shotSearchText.length > 0) {
      const taskTypes = Object.values(taskTypeMap)
      const taskStatuses = Object.values(taskStatusMap)
      const query = state.shotSearchText
      const keywords = getKeyWords(query) || []
      const filters = getFilters(
        cache.shotIndex,
        taskTypes,
        taskStatuses,
        production.descriptors || [],
        query
      )
      shots = indexSearch(cache.shotIndex, keywords) || cache.shots
      shots = applyFilters(shots, filters, taskMap)
    }
    state.displayedShots = shots.slice(
      0,
      state.displayedShots.length + PAGE_SIZE
    )
    state.shotFilledColumns = getFilledColumns(state.displayedShots)

    const previousX = state.displayedShots.length - PAGE_SIZE
    const maxX = state.displayedShots.length
    const maxY = state.nbValidationColumns
    if (previousX >= 0) {
      state.shotSelectionGrid = appendSelectionGrid(
        state.shotSelectionGrid, previousX, maxX, maxY
      )
    }
  },

  [DISPLAY_MORE_SEQUENCES] (state, tasks) {
    let sequences = state.sequences
    if (state.sequenceSearchText.length > 0) {
      const keywords = getKeyWords(state.sequenceSearchText)
      sequences = indexSearch(state.sequenceIndex, keywords)
    }
    state.displayedSequences = sequences.slice(
      0,
      state.displayedSequences.length + PAGE_SIZE
    )
  },

  [DISPLAY_MORE_EPISODES] (state, tasks) {
    let episodes = state.episodes
    if (state.episodeSearchText.length > 0) {
      const keywords = getKeyWords(state.episodeSearchText)
      episodes = indexSearch(state.episodeIndex, keywords)
    }
    state.displayedEpisodes = episodes.slice(
      0,
      state.displayedEpisodes.length + PAGE_SIZE
    )
  },

  [SET_CURRENT_PRODUCTION] (state, production) {
    state.shotSearchText = ''
    state.sequenceSearchText = ''
  },

  [CLEAR_EPISODES] (state) {
    state.episodes = []
    state.currentEpisode = null
  },

  [SET_PREVIEW] (state, { entityId, taskId, previewId, taskMap }) {
    const shot = state.shotMap[entityId]
    if (shot) {
      shot.preview_file_id = previewId
      shot.tasks.forEach((taskId) => {
        const task = taskMap[taskId]
        task.entity.preview_file_id = previewId
      })
    }
  },

  [SET_SHOT_LIST_SCROLL_POSITION] (state, scrollPosition) {
    state.shotListScrollPosition = scrollPosition
  },

  [SET_SEQUENCE_LIST_SCROLL_POSITION] (state, scrollPosition) {
    state.sequenceListScrollPosition = scrollPosition
  },

  [SET_EPISODE_LIST_SCROLL_POSITION] (state, scrollPosition) {
    state.episodeListScrollPosition = scrollPosition
  },

  [REMOVE_SELECTED_TASK] (state, validationInfo) {
    if (state.shotSelectionGrid[0] &&
        state.shotSelectionGrid[validationInfo.x]) {
      state.shotSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [ADD_SELECTED_TASK] (state, validationInfo) {
    if (state.shotSelectionGrid[0] &&
        state.shotSelectionGrid[validationInfo.x]) {
      state.shotSelectionGrid[validationInfo.x][validationInfo.y] = true
    }
  },

  [CLEAR_SELECTED_TASKS] (state, validationInfo) {
    const tmpGrid = JSON.parse(JSON.stringify(state.shotSelectionGrid))
    state.shotSelectionGrid = clearSelectionGrid(tmpGrid)
  },

  [COMPUTE_SEQUENCE_STATS] (state, { taskMap, taskStatusMap }) {
    state.sequenceStats = computeStats(
      cache.shots,
      'sequence_id',
      taskStatusMap,
      taskMap
    )
  },

  [COMPUTE_EPISODE_STATS] (state, { taskMap, taskStatusMap }) {
    state.episodeStats = computeStats(
      cache.shots,
      'episode_id',
      taskStatusMap,
      taskMap
    )
  },

  [NEW_TASK_END] (state, task) {
    const shot = state.shotMap[task.entity_id]
    if (shot && task) {
      task = helpers.populateTask(task, shot)

      shot.tasks.push(task)
      Vue.set(shot.validations, task.task_type_id, task.id)
    }
  },

  [DELETE_TASK_END] (state, task) {
    const shot = state.displayedShots.find(
      (shot) => shot.id === task.entity_id
    )
    if (shot) {
      const validations = JSON.parse(JSON.stringify(shot.validations))
      delete validations[task.task_type_id]
      delete shot.validations
      Vue.set(shot, 'validations', validations)

      const taskIndex = shot.tasks.findIndex(
        (shotTaskId) => shotTaskId === task.id
      )
      shot.tasks.splice(taskIndex, 1)
    }
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task) {
        const shot = state.shotMap[task.entity_id]
        if (shot) {
          const validations = {...shot.validations}
          Vue.set(validations, task.task_type_id, task.id)
          delete shot.validations
          Vue.set(shot, 'validations', validations)
        }
      }
    })
  },

  [ADD_SELECTED_TASKS] (state, selection) {
    const tmpGrid = JSON.parse(JSON.stringify(state.shotSelectionGrid))
    selection.forEach((validationInfo) => {
      if (tmpGrid[0] && tmpGrid[validationInfo.x]) {
        tmpGrid[validationInfo.x][validationInfo.y] = true
      }
    })
    state.shotSelectionGrid = tmpGrid
  },

  [SET_CURRENT_EPISODE] (state, episodeId) {
    if (episodeId) {
      state.currentEpisode = state.episodeMap[episodeId]
    }
  },

  [SET_EPISODE_STATS] (state, episodeStats) {
    const validationColumnsMap = {}
    Object.keys(episodeStats).forEach((episodeId) => {
      Object.keys(episodeStats[episodeId]).forEach((taskTypeId) => {
        validationColumnsMap[taskTypeId] = true
      })
    })

    state.episodeStats = episodeStats
    state.episodeValidationColumns = Object.keys(validationColumnsMap)
  },

  [RESET_ALL] (state) {
    Object.assign(state, {...initialState})

    cache.shots = []
    cache.shotIndex = {}
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

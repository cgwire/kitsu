import Vue from 'vue'
import shotsApi from '../api/shots'
import tasksStore from './tasks'
import peopleStore from './people'
import taskTypesStore from './tasktypes'
import productionsStore from './productions'

import {PAGE_SIZE} from '../../lib/pagination'
import {
  sortShots,
  sortByName
} from '../../lib/sorting'
import {
  buildSelectionGrid,
  clearSelectionGrid
} from '../../lib/helpers'
import {
  buildShotIndex,
  indexSearch
} from '../../lib/indexing'
import {
  applyFilters,
  extractTaskTypes
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

  DELETE_SHOT_START,
  DELETE_SHOT_ERROR,
  DELETE_SHOT_END,

  RESTORE_SHOT_START,
  RESTORE_SHOT_ERROR,
  RESTORE_SHOT_END,

  NEW_TASK_COMMENT_END,

  SET_SHOT_SEARCH,
  SET_CURRENT_PRODUCTION,
  CREATE_TASKS_END,
  DISPLAY_MORE_SHOTS,

  SET_SHOT_LIST_SCROLL_POSITION,

  REMOVE_SELECTED_TASK,
  ADD_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,

  SET_PREVIEW,

  RESET_ALL
} from '../mutation-types'

const helpers = {
  getCurrentProduction () {
    return productionsStore.getters.currentProduction(productionsStore.state)
  },
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
  populateTask (task) {
    task.persons = []

    task.taskType = helpers.getTaskType(task.task_type_id)
    task.taskStatus = helpers.getTaskStatus(task.task_status_id)
    task.assignees.forEach((personId) => {
      task.persons.push(helpers.getPerson(personId))
    })

    // Hacks for proper render
    task.task_status_short_name = task.taskStatus.short_name
    task.task_status_color = task.taskStatus.color
    task.name = task.taskType.priority.toString()
  }
}

const state = {
  shots: [],
  sequences: [],
  episodes: [],
  shotSearchText: '',

  displayedShots: [],
  displayedShotsLength: 0,
  shotIndex: {},
  shotMap: {},
  sequenceMap: {},
  episodeMap: {},
  shotCreated: '',
  shotSelectionGrid: {},

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

  shotListScrollPosition: 0
}

const getters = {
  shots: state => state.shots,
  shotMap: state => state.shotMap,
  sequences: state => state.sequences,
  episodes: state => state.episodes,

  shotSearchText: state => state.shotSearchText,
  shotSelectionGrid: state => state.shotSelectionGrid,

  displayedShots: state => state.displayedShots,
  displayedShotsLength: state => state.displayedShotsLength,
  shotsBySequence: state => {
    const shotsBySequence = []
    let sequenceShots = []
    let previousShot = null

    for (let shot of state.shots) {
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

  isShotsLoading: state => state.isShotsLoading,
  isShotsLoadingError: state => state.isShotsLoadingError,

  editShot: state => state.editShot,
  deleteShot: state => state.deleteShot,
  restoreShot: state => state.restoreShot,
  shotCreated: state => state.shotCreated,

  shotsCsvFormData: state => state.shotsCsvFormData,
  shotListScrollPosition: state => state.shotListScrollPosition,

  getShot: (state, getters) => (id) => {
    return state.shots.find((shot) => shot.id === id)
  },

  getSequenceOptions: state => state.sequences.map(
    (sequence) => { return { label: sequence.name, value: sequence.id } }
  ),

  getEpisodeOptions: state => state.episodes.map(
    (episode) => { return { label: episode.name, value: episode.id } }
  )
}

const actions = {

  loadShots ({ commit, state, rootState }, callback) {
    const currentProduction = productionsStore.getters.currentProduction(
      rootState.productions
    )
    commit(LOAD_SHOTS_START)
    shotsApi.getEpisodes(currentProduction, (err, episodes) => {
      commit(LOAD_EPISODES_END, episodes)
      if (err) commit(LOAD_SHOTS_ERROR)
      else {
        shotsApi.getSequences(currentProduction, (err, sequences) => {
          if (err) commit(LOAD_SHOTS_ERROR)
          else {
            commit(LOAD_SEQUENCES_END, sequences)
            shotsApi.getShots(currentProduction, (err, shots) => {
              if (err) commit(LOAD_SHOTS_ERROR)
              else {
                shots.forEach((shot) => {
                  shot.project_name = currentProduction.name
                  return shot
                })
                commit(LOAD_SHOTS_END, shots)
              }
              if (callback) callback(err)
            })
          }
        })
      }
    })
  },

  loadShot ({ commit, state }, { shotId, callback }) {
    shotsApi.getShot(shotId, (err, shot) => {
      if (!err) {
        commit(LOAD_SHOT_END, shot)
      }
      if (callback) callback(err)
    })
  },

  loadShotCasting ({ commit, state, rootState }, { shot, callback }) {
    const assetMap = rootState.assets.assetMap
    shotsApi.getCasting(shot, (err, casting) => {
      if (!err) {
        commit(LOAD_SHOT_CASTING_END, { shot, casting, assetMap })
      }
      if (callback) callback(err, casting)
    })
  },

  newShot ({ commit, state }, payload) {
    commit(NEW_SHOT_START)
    shotsApi.newShot(payload.shot, (err, shot) => {
      if (err) {
        commit(NEW_SHOT_ERROR)
      } else {
        commit(NEW_SHOT_END, shot)
      }
      if (payload.callback) payload.callback(err, shot)
    })
  },

  newSequence ({ commit, state }, payload) {
    commit(NEW_SEQUENCE_START)
    shotsApi.newSequence(payload.sequence, (err, sequence) => {
      if (err) {
        commit(NEW_SEQUENCE_ERROR)
      } else {
        commit(NEW_SEQUENCE_END, sequence)
      }
      if (payload.callback) payload.callback(err, sequence)
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

  deleteShot ({ commit, state }, payload) {
    commit(DELETE_SHOT_START)
    const shot = payload.shot
    shotsApi.deleteShot(shot, (err) => {
      if (err) {
        commit(DELETE_SHOT_ERROR)
      } else {
        commit(DELETE_SHOT_END, shot)
      }
      if (payload.callback) payload.callback(err)
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

  uploadShotFile ({ commit, state }, callback) {
    commit(IMPORT_SHOTS_START)
    const currentProduction = helpers.getCurrentProduction()
    shotsApi.postCsv(currentProduction, state.shotsCsvFormData, (err) => {
      commit(IMPORT_SHOTS_END)
      if (callback) callback(err)
    })
  },

  displayMoreShots ({commit}) {
    commit(DISPLAY_MORE_SHOTS)
  },

  setShotSearch ({commit}, searchQuery) {
    commit(SET_SHOT_SEARCH, searchQuery)
  }
}

const mutations = {
  [LOAD_SHOTS_START] (state) {
    state.shots = []
    state.shotValidationColumns = []
    state.sequences = []
    state.episoded = []
    state.isShotsLoading = true
    state.isShotsLoadingError = false

    state.shotIndex = {}
    state.shotMap = {}
    state.displayedShots = []
    state.displayedShotsLength = 0
  },

  [LOAD_SHOTS_ERROR] (state) {
    state.isShotsLoading = false
    state.isShotsLoadingError = true
  },

  [LOAD_SHOTS_END] (state, shots) {
    const validationColumns = {}

    state.shotMap = {}
    state.shots = sortShots(shots)
    state.shots.forEach((shot) => {
      state.shotMap[shot.id] = shot
      shot.production_id = helpers.getCurrentProduction().id
      shot.tasks.forEach((task) => {
        helpers.populateTask(task)
        validationColumns[task.task_type_id] = true
      })
    })

    state.isShotsLoading = false
    state.isShotsLoadingError = false
    state.nbValidationColumns = Object.keys(validationColumns).length

    state.shotIndex = buildShotIndex(state.shots)

    const maxX = shots.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)

    state.displayedShots = state.shots.slice(0, PAGE_SIZE)
    state.displayedShotsLength = state.shots.length
  },

  [LOAD_SEQUENCES_END] (state, sequences) {
    const sequenceMap = {}
    sequences.forEach((sequence) => {
      sequenceMap[sequence.id] = sequence
    })
    state.sequenceMap = sequenceMap
    state.sequences = sortByName(sequences)
  },

  [LOAD_EPISODES_END] (state, episodes) {
    const episodeMap = {}
    episodes.forEach((episode) => {
      episodeMap[episode.id] = episode
    })
    state.episodeMap = episodeMap
    state.episodes = sortByName(episodes)
  },

  [LOAD_SHOT_END] (state, shot) {
    shot.tasks.forEach(helpers.populateTask)
    shot.tasks = sortByName(shot.tasks)
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
    const shot = getters.getShot(state)(newShot.id)
    const sequence = state.sequences.find(
      (sequence) => sequence.id === newShot.parent_id
    )
    newShot.sequence_name = sequence.name

    if (shot) {
      Object.assign(shot, newShot)
    } else {
      state.shots.push(newShot)
      state.shots = sortShots(state.shots)
      state.shotMap[newShot.id] = newShot
    }
    state.editShot = {
      isLoading: false,
      isError: false
    }
    state.shotIndex = buildShotIndex(state.shots)
    state.shotCreated = newShot.name
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

    if (shot.tasks.length > 0) {
      shot.canceled = true
    } else {
      const shotToDeleteIndex = state.shots.findIndex(
        (shot) => shot.id === shotToDelete.id
      )
      const displayedShotToDeleteIndex = state.shots.findIndex(
        (shot) => shot.id === shotToDelete.id
      )
      state.shots.splice(shotToDeleteIndex, 1)
      state.displayedShots.splice(displayedShotToDeleteIndex, 1)
      state.shotMap[shotToDelete.id] = undefined
    }

    state.deleteShot = {
      isLoading: false,
      isError: false
    }
    state.shotIndex = buildShotIndex(state.shots)
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
    state.shotIndex = buildShotIndex(state.shots)
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
    const task = helpers.getTask(taskId)

    if (task) {
      const shot = state.shotMap[task.entity_id]
      const taskStatus = helpers.getTaskStatus(comment.task_status_id)

      if (shot) {
        const validations = {...shot.validations}

        delete validations[task.task_type_name]
        Vue.set(task, 'task_status_id', taskStatus.id)
        Vue.set(task, 'task_status_color', taskStatus.color)
        Vue.set(task, 'task_status_name', taskStatus.name)
        Vue.set(task, 'task_status_short_name', taskStatus.short_name)
        Vue.set(validations, task.task_type_name, {...task})

        delete shot.validations
        Vue.set(shot, 'validations', validations)
      }
    }
  },

  [SET_SHOT_SEARCH] (state, shotSearch) {
    const taskTypes = extractTaskTypes(state.shots)
    let result = indexSearch(state.shotIndex, shotSearch) || state.shots
    result = applyFilters(taskTypes, result, shotSearch) || []

    const maxX = result.length
    const maxY = state.nbValidationColumns
    state.shotSelectionGrid = buildSelectionGrid(maxX, maxY)

    state.displayedShots = result.slice(0, PAGE_SIZE)
    state.displayedShotsLength = result.length
    state.shotSearchText = shotSearch
  },

  [NEW_SHOT_START] (state) {},
  [NEW_SHOT_ERROR] (state) {},
  [NEW_SHOT_END] (state, shot) {
    const sequence = state.sequenceMap[shot.parent_id]
    const episode = state.episodeMap[sequence.parent_id]
    shot.sequence_name = sequence.name
    shot.sequence_id = sequence.id
    shot.episode_name = episode.name
    shot.episode_id = episode.id
    shot.preview_file_id = ''

    shot.tasks = []
    shot.validations = []
    shot.data = {}

    state.shots.push(shot)
    state.shots = sortShots(state.shots)
    state.displayedShots = state.shots.slice(0, PAGE_SIZE)
    state.shotMap[shot.id] = shot
    state.shotIndex = buildShotIndex(state.shots)
  },

  [NEW_SEQUENCE_START] (state) {},
  [NEW_SEQUENCE_ERROR] (state) {},
  [NEW_SEQUENCE_END] (state, sequence) {
    state.sequences.push(sequence)
    state.sequences = sortByName(state.sequences)
    state.sequenceMap[sequence.id] = sequence
  },

  [NEW_EPISODE_START] (state) {},
  [NEW_EPISODE_ERROR] (state) {},
  [NEW_EPISODE_END] (state, episode) {
    state.episodes.push(episode)
    state.episodes = sortByName(state.episodes)
    state.episodeMap[episode.id] = episode
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      if (task) {
        const shot = state.shotMap[task.entity_id]
        if (shot) {
          const validations = {...shot.validations}
          Vue.set(validations, task.task_type_name, task)
          delete shot.validations
          Vue.set(shot, 'validations', validations)
        }
      }
    })
  },

  [DISPLAY_MORE_SHOTS] (state, tasks) {
    let shots
    if (state.shotSearchText.length > 0) {
      shots = indexSearch(state.shotIndex, state.shotSearchText)
    } else {
      shots = state.shots
    }
    state.displayedShots = shots.slice(
      0,
      state.displayedShots.length + PAGE_SIZE
    )
  },

  [SET_CURRENT_PRODUCTION] (state, production) {
    state.shotSearchText = ''
  },

  [SET_PREVIEW] (state, {entityId, taskId, previewId}) {
    const shot = state.shotMap[entityId]
    if (shot) {
      shot.preview_file_id = previewId
    }
  },

  [SET_SHOT_LIST_SCROLL_POSITION] (state, scrollPosition) {
    state.shotListScrollPosition = scrollPosition
  },

  [REMOVE_SELECTED_TASK] (state, validationInfo) {
    state.shotSelectionGrid[validationInfo.x][validationInfo.y] = false
  },

  [ADD_SELECTED_TASK] (state, validationInfo) {
    state.shotSelectionGrid[validationInfo.x][validationInfo.y] = true
  },

  [CLEAR_SELECTED_TASKS] (state, validationInfo) {
    state.shotSelectionGrid = clearSelectionGrid(state.shotSelectionGrid)
  },

  [RESET_ALL] (state) {
    state.shots = []
    state.sequences = []
    state.episodes = []
    state.isShotsLoading = false
    state.isShotsLoadingError = false
    state.shotsCsvFormData = null

    state.shotIndex = {}
    state.shotMap = {}
    state.displayedShots = []
    state.displayedShotsLength = 0

    state.editShot = {
      isLoading: false,
      isError: false
    }

    state.deleteShot = {
      isLoading: false,
      isError: false
    }

    state.restoreShot = {
      isLoading: false,
      isError: false
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

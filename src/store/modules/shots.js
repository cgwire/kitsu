import shotsApi from '../api/shots'
import tasksStore from './tasks'
import productionsStore from './productions'
import { buildNameIndex, indexSearch } from '../../lib/indexing'

import {
  sortShots,
  sortValidationColumns,
  sortByName
} from '../../lib/sorting'
import {
  LOAD_SHOTS_START,
  LOAD_SHOTS_ERROR,
  LOAD_SHOTS_END,

  SHOT_CSV_FILE_SELECTED,
  IMPORT_SHOTS_START,
  IMPORT_SHOTS_END,

  LOAD_OPEN_PRODUCTIONS_END,

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

  RESET_ALL
} from '../mutation-types'

const state = {
  shots: [],
  sequences: [],
  validationColumns: {},

  displayedShots: [],
  shotIndex: {},
  shotMap: {},
  shotCreated: '',

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
  }
}

const getters = {
  shots: state => state.shots,
  shotMap: state => state.shotMap,
  sequences: state => state.sequences,
  shotValidationColumns: state => {
    return sortValidationColumns(Object.values(state.validationColumns))
  },

  displayedShots: state => state.displayedShots,
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

  getShot: (state, getters) => (id) => {
    return state.shots.find((shot) => shot.id === id)
  },

  getSequenceOptions: state => state.sequences.map(
    (sequence) => { return { label: sequence.name, value: sequence.id } }
  )
}

const actions = {

  loadShots ({ commit, state, rootState }, callback) {
    const currentProduction = productionsStore.getters.currentProduction(
      rootState.productions
    )
    commit(LOAD_SHOTS_START)
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
  },

  newShot ({ commit, state }, payload) {
    commit(EDIT_SHOT_START, payload.data)
    shotsApi.newShot(payload.data, (err, shot) => {
      if (err) {
        commit(EDIT_SHOT_ERROR)
      } else {
        commit(EDIT_SHOT_END, payload.data)
      }
      if (payload.callback) payload.callback(err)
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
    shotsApi.postCsv(state.shotsCsvFormData, (err) => {
      commit(IMPORT_SHOTS_END)
      if (callback) callback(err)
    })
  }

}

const mutations = {
  [LOAD_SHOTS_START] (state) {
    state.shots = []
    state.validationColumns = {}
    state.isShotsLoading = true
    state.isShotsLoadingError = false

    state.shotIndex = {}
    state.shotMap = {}
    state.displayedShots = []
  },

  [LOAD_SHOTS_ERROR] (state) {
    state.isShotsLoading = false
    state.isShotsLoadingError = true
  },

  [LOAD_SHOTS_END] (state, shots) {
    state.isShotsLoading = false
    state.isShotsLoadingError = false

    const validationColumns = {}
    shots = sortShots(shots)
    shots = shots.map((shot) => {
      shot.validations = {}
      shot.tasks.forEach((task) => {
        shot.validations[task.task_type_name] = task
        validationColumns[task.task_type_name] = {
          name: task.task_type_name,
          color: task.task_type_color,
          priority: task.task_type_priority
        }
      })
      return shot
    })
    state.shots = shots
    state.validationColumns = validationColumns

    state.shotIndex = buildNameIndex(shots)
    const shotMap = {}
    const sequenceMap = {}
    state.shots.forEach((shot) => {
      shotMap[shot.id] = shot
      sequenceMap[shot.sequence_id] = {
        id: shot.sequence_id,
        name: shot.sequence_name
      }
    })
    state.sequences = sortByName(Object.values(sequenceMap))
    state.shotMap = shotMap
    state.displayedShots = state.shots
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
    state.shotIndex = buildNameIndex(state.shots)
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
    const shotToDeleteIndex = state.shots.findIndex(
      (shot) => shot.id === shotToDelete.id
    )
    const shot = state.shotMap[shotToDelete.id]

    if (shot.tasks.length > 0) {
      shot.canceled = true
    } else {
      state.shots.splice(shotToDeleteIndex, 1)
      state.shotMap[shotToDelete.id] = undefined
    }

    state.deleteShot = {
      isLoading: false,
      isError: false
    }
    state.shotIndex = buildNameIndex(state.shots)
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
    state.shotIndex = buildNameIndex(state.shots)
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
    const getTask = tasksStore.getters.getTask(
      tasksStore.state, tasksStore.getters
    )
    const task = getTask(taskId)
    const shot = getters.getShot(state)(task.entity_id)
    if (shot) {
      shot.validations[task.task_type_name] = task
    }
  },

  [SET_SHOT_SEARCH] (state, shotSearch) {
    state.displayedShots =
      indexSearch(state.shotIndex, shotSearch) || state.shots
  },

  [RESET_ALL] (state) {
    state.shots = []
    state.sequences = []
    state.isShotsLoading = false
    state.isShotsLoadingError = false
    state.shotsCsvFormData = null

    state.shotIndex = {}
    state.shotMap = {}
    state.displayedShots = []

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

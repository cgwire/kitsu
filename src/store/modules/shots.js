import shotsApi from '../api/shots'
import { sortShots, sortValidationColumns } from '../../lib/sorting'
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

  RESET_ALL
} from '../mutation-types'

const state = {
  shots: [],
  sequences: [],
  validationColumns: {},

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
  }
}

const getters = {
  shots: state => state.shots,
  sequences: state => state.sequences,
  shotValidationColumns: state => {
    return sortValidationColumns(Object.values(state.validationColumns))
  },

  isShotsLoading: state => state.isShotsLoading,
  isShotsLoadingError: state => state.isShotsLoadingError,

  editShot: state => state.editShot,
  deleteShot: state => state.deleteShot,

  shotsCsvFormData: state => state.shotsCsvFormData,

  getShot: (state, getters) => (id) => {
    return state.shots.find((shot) => shot.id === id)
  },

  getSequenceOptions: state => state.sequences.map(
    (type) => { return { label: type.name, value: type.id } }
  )
}

const actions = {

  loadShots ({ commit, state }, callback) {
    commit(LOAD_SHOTS_START)
    shotsApi.getShots((err, shots) => {
      if (err) commit(LOAD_SHOTS_ERROR)
      else commit(LOAD_SHOTS_END, shots)
      if (callback) callback(err)
    })
  },

  newShot ({ commit, state }, payload) {
    commit(EDIT_SHOT_START, payload.data)
    shotsApi.newShot(payload.data, (err, shot) => {
      if (err) {
        commit(EDIT_SHOT_ERROR)
      } else {
        commit(EDIT_SHOT_END, shot)
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
    state.isShotsLoading = true
    state.isShotsLoadingError = false
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
    const shotType = state.sequences.find(
      (shotType) => shotType.id === newShot.entity_type_id
    )
    newShot.shot_type_name = shotType.name

    const production = state.openProductions.find(
      (production) => production.id === newShot.project_id
    )
    newShot.project_name = production.name

    if (shot) {
      Object.assign(shot, newShot)
    } else {
      state.shots.push(newShot)
      state.shots = sortShots(state.shots)
    }
    state.editShot = {
      isLoading: false,
      isError: false
    }
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
    const shot = state.shots[shotToDeleteIndex]

    if (shot.tasks.length > 0) {
      shot.canceled = true
    } else {
      state.shots.splice(shotToDeleteIndex, 1)
    }

    state.deleteShot = {
      isLoading: false,
      isError: false
    }
  },

  [RESET_ALL] (state) {
    state.shots = []
    state.sequences = []
    state.isShotsLoading = false
    state.isShotsLoadingError = false
    state.shotsCsvFormData = null

    state.editShot = {
      isLoading: false,
      isError: false
    }

    state.deleteShot = {
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

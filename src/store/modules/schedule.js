import scheduleApi from '../api/schedule'
import {
  ADD_MILESTONE,
  ADD_MILESTONES,
  RESET_ALL
} from '../mutation-types'

const initialState = {
  milestones: {}
}

let state = { ...initialState }

const getters = {
  milestones: (state) => state.milestones
}

const actions = {
  loadScheduleItems ({ commit }, production) {
    return scheduleApi.getScheduleItems(production)
  },

  loadAssetTypeScheduleItems ({ commit }, { production, taskType }) {
    return scheduleApi.getAssetTypeScheduleItems(production, taskType)
  },

  loadSequenceScheduleItems ({ commit }, { production, taskType }) {
    return scheduleApi.getSequenceScheduleItems(production, taskType)
  },

  loadEpisodeScheduleItems ({ commit }, { production, taskType }) {
    return scheduleApi.getEpisodeScheduleItems(production, taskType)
  },

  saveScheduleItem ({ commit }, scheduleItem) {
    return scheduleApi.updateScheduleItem(scheduleItem)
  },

  loadMilestones ({ commit, rootState }) {
    const production = rootState.productions.currentProduction
    return scheduleApi.getMilestones(production)
      .then((milestones) => {
        commit(ADD_MILESTONES, milestones)
      })
  },

  saveMilestone ({ commit, rootState }, milestone) {
    const production = rootState.productions.currentProduction
    if (!milestone.id) {
      return scheduleApi.createMilestone(production, milestone)
        .then((milestone) => {
          commit(ADD_MILESTONE, milestone)
        })
    } else {
      return scheduleApi.updateMilestone(milestone)
        .then((milestone) => {
          commit(ADD_MILESTONE, milestone)
        })
    }
  }
}

const mutations = {
  [ADD_MILESTONE] (state, milestone) {
    state.milestones[milestone.date] = milestone
  },

  [ADD_MILESTONES] (state, milestones) {
    state.milestones = {}
    milestones.forEach((milestone) => {
      state.milestones[milestone.date] = milestone
    })
  },

  [RESET_ALL] (state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

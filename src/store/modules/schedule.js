import scheduleApi from '../api/schedule'
import {
  ADD_MILESTONE,
  ADD_MILESTONES,
  REMOVE_MILESTONE,
  SET_CURRENT_SCHEDULE_ITEMS,
  RESET_ALL
} from '../mutation-types'

const initialState = {
  milestones: {},
  currentScheduleItems: []
}

const state = { ...initialState }

const getters = {
  milestones: (state) => state.milestones
}

const actions = {
  loadScheduleItems ({ commit }, production) {
    return scheduleApi.getScheduleItems(production)
      .catch(console.error)
  },

  loadAssetTypeScheduleItems ({ commit }, { production, taskType }) {
    return scheduleApi.getAssetTypeScheduleItems(production, taskType)
      .catch(console.error)
  },

  loadSequenceScheduleItems ({ commit }, { production, taskType }) {
    return scheduleApi.getSequenceScheduleItems(production, taskType)
      .catch(console.error)
  },

  loadEpisodeScheduleItems ({ commit }, { production, taskType }) {
    return scheduleApi.getEpisodeScheduleItems(production, taskType)
      .catch(console.error)
  },

  saveScheduleItem ({ commit }, scheduleItem) {
    return scheduleApi.updateScheduleItem(scheduleItem)
      .catch(console.error)
  },

  loadMilestones ({ commit, rootState }) {
    const production = rootState.productions.currentProduction
    return scheduleApi.getMilestones(production)
      .then((milestones) => {
        commit(ADD_MILESTONES, milestones)
      })
      .catch(console.error)
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
        .catch(console.error)
    }
  },

  deleteMilestone ({ commit, rootState }, milestone) {
    return scheduleApi.deleteMilestone(milestone)
      .then((milestone) => {
        commit(REMOVE_MILESTONE, milestone)
      })
      .catch(console.error)
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

  [REMOVE_MILESTONE] (state, milestone) {
    delete state.milestones[milestone.date.format('YYYY-MM-DD')]
  },

  [SET_CURRENT_SCHEDULE_ITEMS] (state, items) {
    this.currentScheduleItems = items
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

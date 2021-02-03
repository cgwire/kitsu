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
  milestones: (state) => state.milestones,
  currentScheduleItems: (state) => state.currentScheduleItems
}

const actions = {
  loadScheduleItems ({ commit }, production) {
    return scheduleApi.getScheduleItems(production)
      .then(scheduleItems => {
        commit(SET_CURRENT_SCHEDULE_ITEMS, scheduleItems)
        return Promise.resolve(scheduleItems)
      })
      .catch(console.error)
  },

  loadAllScheduleItems ({ commit }, production) {
    return scheduleApi.getAllScheduleItems(production)
      .then(scheduleItems => {
        commit(SET_CURRENT_SCHEDULE_ITEMS, scheduleItems)
      })
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
    if (!taskType.id) {
      return Promise.reject(new Error('Wrong task type for loading schedule'))
    } else {
      return scheduleApi.getEpisodeScheduleItems(production, taskType)
        .catch(console.error)
    }
  },

  createScheduleItem ({ commit, state }, scheduleItem) {
    if (!scheduleItem.object_id) {
      const previousItem = state.currentScheduleItems.find(
        item => item.task_type_id === scheduleItem.taskTypeId &&
                item.project_id === scheduleItem.project_id
      )
      if (previousItem) return Promise.resolve(scheduleItem)
    }
    return scheduleApi.createScheduleItem(scheduleItem)
      .then(newScheduleItem => {
        const scheduleItems = state.currentScheduleItems.slice()
        scheduleItems.push(newScheduleItem)
        commit(SET_CURRENT_SCHEDULE_ITEMS, scheduleItems)
        return Promise.resolve(newScheduleItem)
      })
      .catch(console.error)
  },

  deleteScheduleItem ({ commit, state }, scheduleItem) {
    return scheduleApi.deleteScheduleItem(scheduleItem)
      .then(() => {
        const scheduleItems = state.currentScheduleItems.slice()
        const indexToRemove = scheduleItems.findIndex(
          item => item.id === scheduleItem.id
        )
        if (indexToRemove !== -1) {
          scheduleItems.splice(indexToRemove, 1)
          commit(SET_CURRENT_SCHEDULE_ITEMS, scheduleItems)
        }
      })
      .catch(console.error)
  },

  saveScheduleItem ({ commit, state }, scheduleItem) {
    return scheduleApi.updateScheduleItem(scheduleItem)
      .then(updatedItem => {
        const scheduleItems = state.currentScheduleItems.slice()
        const indexUpdate = scheduleItems.findIndex(
          item => item.id === updatedItem.id
        )
        if (indexUpdate !== -1) {
          scheduleItems[indexUpdate] = updatedItem
          commit(SET_CURRENT_SCHEDULE_ITEMS, scheduleItems)
        }
      })
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
    state.currentScheduleItems = items
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

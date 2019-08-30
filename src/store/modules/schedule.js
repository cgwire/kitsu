import productionsApi from '../api/productions'
import {
} from '../mutation-types'

const initialState = {
}

let state = { ...initialState }

const getters = {
}

const actions = {
  loadScheduleItems ({ commit }, production) {
    return productionsApi.getScheduleItems(production)
  },

  loadAssetTypeScheduleItems ({ commit }, { production, taskType }) {
    return productionsApi.getAssetTypeScheduleItems(production, taskType)
  },

  loadSequenceScheduleItems ({ commit }, { production, taskType }) {
    return productionsApi.getSequenceScheduleItems(production, taskType)
  },

  loadEpisodeScheduleItems ({ commit }, { production, taskType }) {
    return productionsApi.getEpisodeScheduleItems(production, taskType)
  },

  saveScheduleItem ({ commit }, scheduleItem) {
    return productionsApi.updateScheduleItem(scheduleItem)
  }
}

const mutations = {
}

export default {
  state,
  getters,
  actions,
  mutations
}

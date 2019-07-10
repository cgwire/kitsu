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

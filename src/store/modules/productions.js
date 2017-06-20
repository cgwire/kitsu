import productionsApi from '../api/productions'
import {
  LOAD_PRODUCTIONS_START,
  LOAD_PRODUCTIONS_ERROR,
  LOAD_PRODUCTIONS_END,
  RESET_ALL
} from '../mutation-types'

const state = {
  productions: [],
  isProductionsLoading: false,
  isProductionsLoadingError: true
}

const getters = {
  productions: state => state.productions,
  isProductionsLoading: state => state.isProductionsLoading,
  isProductionsLoadingError: state => state.isProductionsLoadingError
}

const actions = {
  loadProductions ({ commit, state }, callback) {
    commit(LOAD_PRODUCTIONS_START)
    productionsApi.getProductions((err, productions) => {
      if (err) commit(LOAD_PRODUCTIONS_ERROR)
      else commit(LOAD_PRODUCTIONS_END, productions)
      if (callback) callback(err)
    })
  }
}

const mutations = {
  [LOAD_PRODUCTIONS_START] (state) {
    state.isProductionsLoading = true
    state.isProductionsLoadingError = false
  },
  [LOAD_PRODUCTIONS_ERROR] (state) {
    state.isProductionsLoading = false
    state.isProductionsLoadingError = true
  },
  [LOAD_PRODUCTIONS_END] (state, productions) {
    state.isProductionsLoading = false
    state.isProductionsLoadingError = false
    state.productions = productions.sort((a, b) => {
      if (a.project_status_name === b.project_status_name) {
        return a.name.localeCompare(b.name)
      } else {
        return -1 * a.project_status_name.localeCompare(b.project_status_name)
      }
    })
  },

  [RESET_ALL] (state) {
    state.isProductionsLoading = false
    state.isProductionsLoadingError = false
    state.productions = []
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

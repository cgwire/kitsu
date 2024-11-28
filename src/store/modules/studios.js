import { sortByName } from '@/lib/sorting'
import studiosApi from '@/store/api/studios'
import {
  LOAD_STUDIOS_END,
  EDIT_STUDIOS_END,
  DELETE_STUDIOS_END,
  RESET_ALL
} from '@/store/mutation-types'

const cache = {
  studioMap: new Map()
}

const initialState = {
  studios: []
}

const state = { ...initialState }

const getters = {
  studios: state => state.studios.filter(d => !d.archived),
  archivedStudios: state => state.studios.filter(d => d.archived),
  studioMap: state => cache.studioMap,

  getStudio: state => id => {
    return state.studios.find(studio => studio.id === id)
  }
}

const actions = {
  async loadStudios({ commit }) {
    const studios = await studiosApi.getStudios()
    commit(LOAD_STUDIOS_END, studios)
    return studios
  },

  async newStudio({ commit }, data) {
    const studio = await studiosApi.newStudio(data)
    commit(EDIT_STUDIOS_END, studio)
    return studio
  },

  async editStudio({ commit }, data) {
    const studio = await studiosApi.editStudio(data)
    commit(EDIT_STUDIOS_END, studio)
    return studio
  },

  async deleteStudio({ commit }, studio) {
    await studiosApi.deleteStudio(studio)
    commit(DELETE_STUDIOS_END, studio)
    return studio
  }
}

const mutations = {
  [LOAD_STUDIOS_END](state, studios) {
    state.studios = sortByName(studios)
    studios.forEach(studio => {
      cache.studioMap.set(studio.id, studio)
    })
  },

  [EDIT_STUDIOS_END](state, newStudio) {
    const studio = getters.getStudio(state)(newStudio.id)
    if (studio?.id) {
      Object.assign(studio, newStudio)
    } else {
      state.studios.push(newStudio)
    }
    cache.studioMap.set(newStudio.id, newStudio)
  },

  [DELETE_STUDIOS_END](state, studioToDelete) {
    const studioToDeleteIndex = state.studios.findIndex(
      studio => studio.id === studioToDelete.id
    )
    if (studioToDeleteIndex >= 0) {
      state.studios.splice(studioToDeleteIndex, 1)
    }
    cache.studioMap.delete(studioToDelete.id)
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
    cache.studioMap.clear()
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

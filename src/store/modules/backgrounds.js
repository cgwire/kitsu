import backgroundApi from '@/store/api/backgrounds'
import { sortByName } from '@/lib/sorting'

import {
  LOAD_BACKGROUNDS_START,
  LOAD_BACKGROUNDS_ERROR,
  LOAD_BACKGROUNDS_END,
  EDIT_BACKGROUND_END,
  DELETE_BACKGROUND_END,
  RESET_ALL
} from '@/store/mutation-types'

const cache = {
  backgroundMap: new Map()
}

const initialState = {
  backgrounds: []
}

const state = initialState

const getters = {
  backgrounds: state =>
    state.backgrounds.filter(background => !background.archived),
  archivedBackgrounds: state =>
    state.backgrounds.filter(background => background.archived),
  backgroundMap: state => cache.backgroundMap,
  editBackgrounds: state => state.editBackgrounds,
  deleteBackground: state => state.deleteBackground
}

const actions = {
  async loadBackgrounds({ commit }) {
    commit(LOAD_BACKGROUNDS_START)
    try {
      const backgrounds = await backgroundApi.getBackgrounds()
      commit(LOAD_BACKGROUNDS_END, backgrounds)
    } catch (err) {
      commit(LOAD_BACKGROUNDS_ERROR)
    }
  },

  async loadBackground({ commit }, backgroundId) {
    try {
      const background = await backgroundApi.getBackground(backgroundId)
      commit(EDIT_BACKGROUND_END, background)
    } catch (err) {
      console.error(err)
    }
  },

  async newBackground({ commit }, { name, is_default, file }) {
    let background = await backgroundApi.newBackground({
      is_default,
      name
    })
    background = await backgroundApi.uploadBackgroundImage(background, file)
    commit(EDIT_BACKGROUND_END, background)
    return background
  },

  async saveBackground({ commit }, form) {
    const background = await backgroundApi.updateBackground(form)
    commit(EDIT_BACKGROUND_END, background)
    return background
  },

  async deleteBackground({ commit }, background) {
    await backgroundApi.deleteBackground(background)
    commit(DELETE_BACKGROUND_END, background)
  }
}

const mutations = {
  [LOAD_BACKGROUNDS_START](state) {
    state.backgrounds = []
    cache.backgroundMap = new Map()
  },

  [LOAD_BACKGROUNDS_ERROR](state) {
    state.backgrounds = []
    cache.backgroundMap = new Map()
  },

  [LOAD_BACKGROUNDS_END](state, backgrounds) {
    if (!backgrounds) return
    backgrounds.forEach(background => {
      background.url = `/api/pictures/preview-background-files/${background.id}.${background.extension}`
      background.thumbnail = `/api/pictures/thumbnails/preview-background-files/${background.id}.png`
    })
    state.backgrounds = sortByName(backgrounds)
    cache.backgroundMap = new Map(
      state.backgrounds.map(background => [background.id, background])
    )
  },

  [EDIT_BACKGROUND_END](state, newBackground) {
    const background = cache.backgroundMap.get(newBackground.id)

    newBackground.url = `/api/pictures/preview-background-files/${newBackground.id}.${newBackground.extension}`
    newBackground.thumbnail = `/api/pictures/thumbnails/preview-background-files/${newBackground.id}.png`

    if (newBackground.is_default) {
      state.backgrounds.forEach(status => {
        if (status.is_default && status.id !== newBackground.id)
          status.is_default = false
      })
    }

    if (background?.id) {
      Object.assign(background, newBackground)
      cache.backgroundMap.delete(background.id)
      cache.backgroundMap.set(background.id, background)
      state.backgrounds = sortByName(state.backgrounds)
    } else {
      state.backgrounds.push(newBackground)
      state.backgrounds = sortByName(state.backgrounds)
      cache.backgroundMap.set(newBackground.id, newBackground)
    }
  },

  [DELETE_BACKGROUND_END](state, backgroundToDelete) {
    const backgroundToDeleteIndex = state.backgrounds.findIndex(
      ({ id }) => id === backgroundToDelete.id
    )
    if (backgroundToDeleteIndex >= 0) {
      state.backgrounds.splice(backgroundToDeleteIndex, 1)
    }
    cache.backgroundMap.delete(backgroundToDelete.id)
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  cache
}

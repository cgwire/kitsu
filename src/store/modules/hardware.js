import hardwareItemsApi from '@/store/api/hardware'
import {
  LOAD_HARDWARE_ITEMS_END,
  EDIT_HARDWARE_ITEM_END,
  DELETE_HARDWARE_ITEM_END,
  RESET_ALL
} from '@/store/mutation-types'
import { sortByName } from '@/lib/sorting'

const cache = {
  hardwareItemMap: new Map()
}

const initialState = {
  hardwareItems: []
}

const state = { ...initialState }

const getters = {
  hardwareItems: state =>
    state.hardwareItems.filter(hardwareItem => !hardwareItem.archived),
  archivedHardwareItems: state =>
    state.hardwareItems.filter(hardwareItem => hardwareItem.archived),
  hardwareItemMap: () => cache.hardwareItemMap,

  getHardwareItem: state => id => {
    return state.hardwareItems.find(hardwareItem => hardwareItem.id === id)
  },

  getHardwareItemOptions: state =>
    state.hardwareItems.map(hardwareItem => {
      return { label: hardwareItem.name, value: hardwareItem.id }
    })
}

const actions = {
  loadHardwareItems({ commit }) {
    hardwareItemsApi.getHardwareItems().then(hardwareItems => {
      commit(LOAD_HARDWARE_ITEMS_END, hardwareItems)
      Promise.resolve(hardwareItems)
    })
  },

  loadHardwareItem({ commit }, hardwareItemId) {
    hardwareItemsApi.getHardwareItem(hardwareItemId).then(hardwareItem => {
      commit(EDIT_HARDWARE_ITEM_END, hardwareItem)
      Promise.resolve(hardwareItem)
    })
  },

  newHardwareItem({ commit }, data) {
    return hardwareItemsApi.newHardwareItem(data).then(hardwareItem => {
      commit(EDIT_HARDWARE_ITEM_END, hardwareItem)
      Promise.resolve(hardwareItem)
    })
  },

  editHardwareItem({ commit }, data) {
    return hardwareItemsApi.updateHardwareItem(data).then(hardwareItem => {
      commit(EDIT_HARDWARE_ITEM_END, hardwareItem)
      Promise.resolve(hardwareItem)
    })
  },

  deleteHardwareItem({ commit }, hardwareItem) {
    return hardwareItemsApi.deleteHardwareItem(hardwareItem).then(() => {
      commit(DELETE_HARDWARE_ITEM_END, hardwareItem)
      Promise.resolve(hardwareItem)
    })
  }
}

const mutations = {
  [LOAD_HARDWARE_ITEMS_END](state, hardwareItems) {
    state.hardwareItems = sortByName(hardwareItems)
    cache.hardwareItemMap = new Map()
    state.hardwareItems.forEach(hardwareItem => {
      cache.hardwareItemMap.set(hardwareItem.id, hardwareItem)
    })
  },

  [EDIT_HARDWARE_ITEM_END](state, newHardwareItem) {
    const hardwareItem = getters.getHardwareItem(state)(newHardwareItem.id)

    if (hardwareItem && hardwareItem.id) {
      Object.assign(hardwareItem, newHardwareItem)
    } else {
      state.hardwareItems.push(newHardwareItem)
      cache.hardwareItemMap.set(newHardwareItem.id, newHardwareItem)
    }
    state.hardwareItems = sortByName(state.hardwareItems)
  },

  [DELETE_HARDWARE_ITEM_END](state, hardwareItemToDelete) {
    const hardwareItemToDeleteIndex = state.hardwareItems.findIndex(
      hardwareItem => hardwareItem.id === hardwareItemToDelete.id
    )
    if (hardwareItemToDeleteIndex >= 0) {
      state.hardwareItems.splice(hardwareItemToDeleteIndex, 1)
    }
    cache.hardwareItemMap.delete(hardwareItemToDelete.id)
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

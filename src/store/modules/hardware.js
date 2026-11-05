import hardwareItemsApi from '@/store/api/hardware'
import {
  LOAD_HARDWARE_ITEMS_END,
  EDIT_HARDWARE_ITEM_END,
  DELETE_HARDWARE_ITEM_END,
  RESET_ALL
} from '@/store/mutation-types'
import { sortByName } from '@/lib/sorting'

const initialState = {
  hardwareItems: []
}

const state = { ...initialState }

const getters = {
  hardwareItems: state =>
    state.hardwareItems.filter(hardwareItem => !hardwareItem.archived),
  archivedHardwareItems: state =>
    state.hardwareItems.filter(hardwareItem => hardwareItem.archived),

  getHardwareItem: state => id => {
    return state.hardwareItems.find(hardwareItem => hardwareItem.id === id)
  }
}

const actions = {
  async loadHardwareItems({ commit }) {
    const hardwareItems = await hardwareItemsApi.getHardwareItems()
    commit(LOAD_HARDWARE_ITEMS_END, hardwareItems)
    return hardwareItems
  },

  async newHardwareItem({ commit }, data) {
    const hardwareItem = await hardwareItemsApi.newHardwareItem(data)
    commit(EDIT_HARDWARE_ITEM_END, hardwareItem)
    return hardwareItem
  },

  async editHardwareItem({ commit }, data) {
    const hardwareItem = await hardwareItemsApi.updateHardwareItem(data)
    commit(EDIT_HARDWARE_ITEM_END, hardwareItem)
    return hardwareItem
  },

  async deleteHardwareItem({ commit }, hardwareItem) {
    await hardwareItemsApi.deleteHardwareItem(hardwareItem)
    commit(DELETE_HARDWARE_ITEM_END, hardwareItem)
    return hardwareItem
  }
}

const mutations = {
  [LOAD_HARDWARE_ITEMS_END](state, hardwareItems) {
    state.hardwareItems = sortByName(hardwareItems)
  },

  [EDIT_HARDWARE_ITEM_END](state, newHardwareItem) {
    const hardwareItem = getters.getHardwareItem(state)(newHardwareItem.id)

    if (hardwareItem && hardwareItem.id) {
      Object.assign(hardwareItem, newHardwareItem)
    } else {
      state.hardwareItems.push(newHardwareItem)
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
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

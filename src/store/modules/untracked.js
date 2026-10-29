/*
 * Untracked items: the work planned in the production schedule that is not
 * an asset, a shot or an edit (sound design, a department planned before its
 * shots exist...). They carry tasks but stay out of the entity lists, and
 * can be linked to an episode, a sequence or a shot later on.
 */
import untrackedApi from '@/store/api/untracked'
import {
  LOAD_UNTRACKED_END,
  NEW_TASK_END,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  untrackedMap: new Map()
}

const state = { ...initialState, untrackedMap: new Map() }

const getters = {
  untrackedMap: state => state.untrackedMap,
  untrackedItems: state =>
    Array.from(state.untrackedMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
}

const actions = {
  async loadUntracked({ commit }, production) {
    const untrackedItems = await untrackedApi.getUntracked(production)
    commit(LOAD_UNTRACKED_END, untrackedItems)
    return untrackedItems
  },

  // With create_task, the server creates the task along, with the task type
  // of the department, which it creates and enables in the production when
  // needed: the caller reloads the task types and the production then.
  async newUntracked({ commit, dispatch }, data) {
    const untracked = await untrackedApi.newUntracked(data)
    ;(untracked.tasks || []).forEach(task => commit(NEW_TASK_END, { task }))
    // Reload rather than insert: the list resolves the episode of the link.
    await dispatch('loadUntracked', { id: untracked.project_id })
    return untracked
  },

  async editUntracked({ dispatch }, data) {
    const untracked = await untrackedApi.updateUntracked(data)
    await dispatch('loadUntracked', { id: untracked.project_id })
    return untracked
  }
}

const mutations = {
  [LOAD_UNTRACKED_END](state, untrackedItems) {
    state.untrackedMap = new Map(untrackedItems.map(item => [item.id, item]))
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState, untrackedMap: new Map() })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

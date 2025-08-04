import softwareLicensesApi from '@/store/api/software'
import {
  LOAD_SOFTWARE_LICENSES_END,
  EDIT_SOFTWARE_LICENSE_END,
  DELETE_SOFTWARE_LICENSE_END,
  RESET_ALL
} from '@/store/mutation-types'
import { sortByName } from '@/lib/sorting'

const cache = {
  softwareLicenseMap: new Map()
}

const initialState = {
  softwareLicenses: []
}

const state = { ...initialState }

const getters = {
  softwareLicenses: state =>
    state.softwareLicenses.filter(license => !license.archived),
  archivedSoftwareLicenses: state =>
    state.softwareLicenses.filter(license => license.archived),
  softwareLicenseMap: () => cache.softwareLicenseMap,

  getSoftwareLicense: state => id => {
    return state.softwareLicenses.find(
      softwareLicense => softwareLicense.id === id
    )
  },

  getSoftwareLicenseOptions: state =>
    state.softwareLicenses.map(license => {
      return { label: license.name, value: license.id }
    })
}

const actions = {
  loadSoftwareLicenses({ commit }) {
    softwareLicensesApi.getSoftwareLicenses().then(softwareLicenses => {
      commit(LOAD_SOFTWARE_LICENSES_END, softwareLicenses)
      Promise.resolve(softwareLicenses)
    })
  },

  loadSoftwareLicense({ commit }, softwareLicenseId) {
    softwareLicensesApi
      .getSoftwareLicense(softwareLicenseId)
      .then(softwareLicense => {
        commit(EDIT_SOFTWARE_LICENSE_END, softwareLicense)
        Promise.resolve(softwareLicense)
      })
  },

  newSoftwareLicense({ commit }, data) {
    return softwareLicensesApi
      .newSoftwareLicense(data)
      .then(softwareLicense => {
        commit(EDIT_SOFTWARE_LICENSE_END, softwareLicense)
        Promise.resolve(softwareLicense)
      })
  },

  editSoftwareLicense({ commit }, data) {
    return softwareLicensesApi
      .updateSoftwareLicense(data)
      .then(softwareLicense => {
        commit(EDIT_SOFTWARE_LICENSE_END, softwareLicense)
        Promise.resolve(softwareLicense)
      })
  },

  deleteSoftwareLicense({ commit }, softwareLicense) {
    return softwareLicensesApi
      .deleteSoftwareLicense(softwareLicense)
      .then(() => {
        commit(DELETE_SOFTWARE_LICENSE_END, softwareLicense)
        Promise.resolve(softwareLicense)
      })
  }
}

const mutations = {
  [LOAD_SOFTWARE_LICENSES_END](state, softwareLicenses) {
    state.softwareLicenses = sortByName(softwareLicenses)
    cache.softwareLicenseMap = new Map()
    state.softwareLicenses.forEach(softwareLicense => {
      cache.softwareLicenseMap.set(softwareLicense.id, softwareLicense)
    })
  },

  [EDIT_SOFTWARE_LICENSE_END](state, newSoftwareLicense) {
    const softwareLicense = getters.getSoftwareLicense(state)(
      newSoftwareLicense.id
    )

    if (softwareLicense && softwareLicense.id) {
      Object.assign(softwareLicense, newSoftwareLicense)
    } else {
      state.softwareLicenses.push(newSoftwareLicense)
      cache.softwareLicenseMap.set(newSoftwareLicense.id, newSoftwareLicense)
    }
    state.softwareLicenses = sortByName(state.softwareLicenses)
  },

  [DELETE_SOFTWARE_LICENSE_END](state, softwareLicenseToDelete) {
    const softwareLicenseToDeleteIndex = state.softwareLicenses.findIndex(
      softwareLicense => softwareLicense.id === softwareLicenseToDelete.id
    )
    if (softwareLicenseToDeleteIndex >= 0) {
      state.softwareLicenses.splice(softwareLicenseToDeleteIndex, 1)
    }
    cache.softwareLicenseMap.delete(softwareLicenseToDelete.id)
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

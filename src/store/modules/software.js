import softwareLicensesApi from '@/store/api/software'
import {
  LOAD_SOFTWARE_LICENSES_END,
  EDIT_SOFTWARE_LICENSE_END,
  DELETE_SOFTWARE_LICENSE_END,
  RESET_ALL
} from '@/store/mutation-types'
import { sortByName } from '@/lib/sorting'

const initialState = {
  softwareLicenses: []
}

const state = { ...initialState }

const getters = {
  softwareLicenses: state =>
    state.softwareLicenses.filter(license => !license.archived),
  archivedSoftwareLicenses: state =>
    state.softwareLicenses.filter(license => license.archived),

  getSoftwareLicense: state => id => {
    return state.softwareLicenses.find(
      softwareLicense => softwareLicense.id === id
    )
  }
}

const actions = {
  async loadSoftwareLicenses({ commit }) {
    const softwareLicenses = await softwareLicensesApi.getSoftwareLicenses()
    commit(LOAD_SOFTWARE_LICENSES_END, softwareLicenses)
    return softwareLicenses
  },

  async newSoftwareLicense({ commit }, data) {
    const softwareLicense = await softwareLicensesApi.newSoftwareLicense(data)
    commit(EDIT_SOFTWARE_LICENSE_END, softwareLicense)
    return softwareLicense
  },

  async editSoftwareLicense({ commit }, data) {
    const softwareLicense =
      await softwareLicensesApi.updateSoftwareLicense(data)
    commit(EDIT_SOFTWARE_LICENSE_END, softwareLicense)
    return softwareLicense
  },

  async deleteSoftwareLicense({ commit }, softwareLicense) {
    await softwareLicensesApi.deleteSoftwareLicense(softwareLicense)
    commit(DELETE_SOFTWARE_LICENSE_END, softwareLicense)
    return softwareLicense
  }
}

const mutations = {
  [LOAD_SOFTWARE_LICENSES_END](state, softwareLicenses) {
    state.softwareLicenses = sortByName(softwareLicenses)
  },

  [EDIT_SOFTWARE_LICENSE_END](state, newSoftwareLicense) {
    const softwareLicense = getters.getSoftwareLicense(state)(
      newSoftwareLicense.id
    )

    if (softwareLicense && softwareLicense.id) {
      Object.assign(softwareLicense, newSoftwareLicense)
    } else {
      state.softwareLicenses.push(newSoftwareLicense)
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

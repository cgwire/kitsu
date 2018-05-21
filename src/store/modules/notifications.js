import notificationsApi from '../api/notifications'
import { sortByDate } from '../../lib/sorting'

import {
  LOAD_NOTIFICATIONS_END,
  RESET_ALL
} from '../mutation-types'

const initialState = {
  notifications: []
}

const state = {
  ...initialState
}

const getters = {
  notifications: state => state.notifications
}

const actions = {
  loadNotifications ({ commit, state }) {
    commit(LOAD_NOTIFICATIONS_END, [])
    return new Promise((resolve, reject) => {
      notificationsApi.getNotifications((err, notifications) => {
        if (err) {
          reject(err)
        } else {
          commit(LOAD_NOTIFICATIONS_END, notifications)
          resolve()
        }
      })
    })
  }
}

const mutations = {
  [LOAD_NOTIFICATIONS_END] (state, notifications) {
    state.notifications = sortByDate(notifications)
  },

  [RESET_ALL] (state) {
    state = {
      ...initialState
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

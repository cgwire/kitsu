import notificationsApi from '@/store/api/notifications'
import { sortByDate } from '@/lib/sorting'

import {
  CLEAR_NOTIFICATIONS,
  INCREMENT_NOTIFICATION_COUNTER,
  LOAD_MORE_NOTIFICATIONS_END,
  LOAD_NOTIFICATION_END,
  LOAD_NOTIFICATIONS_END,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  NOTIFICATION_ADD_PREVIEW,
  SET_NOTIFICATION_COUNT,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  notificationCount: 0,
  notifications: []
}

const state = {
  ...initialState
}

const getters = {
  notificationCount: state => state.notificationCount,
  notifications: state => state.notifications,
  isNewNotification: state => state.notificationCount > 0
}

const actions = {
  clearNotifications({ commit }) {
    commit(CLEAR_NOTIFICATIONS)
  },

  loadNotifications({ commit, state }, params) {
    commit(LOAD_NOTIFICATIONS_END, [])
    return notificationsApi.getNotifications(params).then(notifications => {
      commit(LOAD_NOTIFICATIONS_END, notifications)
      return Promise.resolve()
    })
  },

  loadMoreNotifications({ commit, state }, params) {
    if (
      state.notifications.length > 0 &&
      state.notifications.length % 100 === 0
    ) {
      const lastNotification = state.notifications.length - 1
      params.before = state.notifications[lastNotification].created_at
      return notificationsApi.getNotifications(params).then(notifications => {
        commit(LOAD_MORE_NOTIFICATIONS_END, notifications)
        return Promise.resolve(notifications)
      })
    } else {
      return Promise.resolve([])
    }
  },

  loadNotification({ commit, state }, notificationId) {
    return notificationsApi
      .getNotification(notificationId)
      .then(notification => {
        commit(LOAD_NOTIFICATION_END, notification)
        return Promise.resolve()
      })
  },

  incrementNotificationCounter({ commit }) {
    commit(INCREMENT_NOTIFICATION_COUNTER)
  },

  markAllNotificationsAsRead({ commit }) {
    commit(MARK_ALL_NOTIFICATIONS_AS_READ)
  }
}

const mutations = {
  [CLEAR_NOTIFICATIONS](state) {
    state.notifications = []
  },

  [LOAD_NOTIFICATIONS_END](state, notifications) {
    state.notifications = sortByDate(notifications)
  },

  [LOAD_MORE_NOTIFICATIONS_END](state, notifications) {
    state.notifications = sortByDate(state.notifications.concat(notifications))
  },

  [LOAD_NOTIFICATION_END](state, notification) {
    state.notifications.push(notification)
    state.notifications = sortByDate(state.notifications)
  },

  [SET_NOTIFICATION_COUNT](state, count) {
    state.notificationCount = count
  },

  [MARK_ALL_NOTIFICATIONS_AS_READ](state) {
    let notificationCount = state.notificationCount - state.notifications.length
    if (notificationCount < 0) notificationCount = 0
    state.notificationCount = notificationCount
  },

  [NOTIFICATION_ADD_PREVIEW](state, { commentId, previewId }) {
    const notification = state.notifications.find(notification => {
      return notification.comment_id === commentId
    })

    if (notification) {
      notification.preview_file_id = previewId
    }
  },

  [INCREMENT_NOTIFICATION_COUNTER](state) {
    state.notificationCount = state.notificationCount + 1
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

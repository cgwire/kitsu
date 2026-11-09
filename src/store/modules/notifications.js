import { isNotFound } from '@/lib/errors'
import { sortByDate } from '@/lib/sorting'
import notificationsApi from '@/store/api/notifications'

import {
  CLEAR_NOTIFICATIONS,
  INCREMENT_NOTIFICATION_COUNTER,
  DECREMENT_NOTIFICATION_COUNTER,
  RESET_NOTIFICATION_COUNTER,
  LOAD_MORE_NOTIFICATIONS_END,
  LOAD_NOTIFICATION_END,
  LOAD_NOTIFICATIONS_END,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  NOTIFICATION_ADD_PREVIEW,
  REMOVE_COMMENT_NOTIFICATIONS,
  REMOVE_NOTIFICATION,
  SET_NOTIFICATION_COUNT,
  TOGGLE_NOTIFICATION_READ_STATUS,
  RESET_ALL
} from '@/store/mutation-types'

// Zou answers at most this many entries: a shorter page is the last one.
const PAGE_SIZE = 100

// Where the page after given one starts, if any. The list cannot tell: live
// notifications enter it, whatever their date, and deleted ones leave it.
const getNextPageDate = page =>
  page.length >= PAGE_SIZE ? page[page.length - 1].created_at : null

// A factory, not a literal: the mutations push into the list in place, and
// RESET_ALL must not hand the same array back.
const initialState = () => ({
  nextPageDate: null,
  notificationCount: 0,
  notifications: []
})

const state = initialState()

// In place: a page in flight checks that the list is still the same one.
const removeNotifications = (state, isRemoved) => {
  state.notifications.filter(isRemoved).forEach(notification => {
    state.notifications.splice(state.notifications.indexOf(notification), 1)
  })
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
    })
  },

  loadMoreNotifications({ commit, state }, params) {
    if (state.nextPageDate) {
      params.before = state.nextPageDate
      // A filter change replaces the list while the page is in flight: the
      // page was fetched for the previous list and would land out of order.
      const list = state.notifications
      return notificationsApi.getNotifications(params).then(notifications => {
        if (state.notifications !== list) {
          return []
        }
        commit(LOAD_MORE_NOTIFICATIONS_END, notifications)
        return notifications
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
        return notification
      })
  },

  incrementNotificationCounter({ commit }) {
    commit(INCREMENT_NOTIFICATION_COUNTER)
  },

  decrementNotificationCounter({ commit }) {
    commit(DECREMENT_NOTIFICATION_COUNTER)
  },

  resetNotificationCounter({ commit }) {
    commit(RESET_NOTIFICATION_COUNTER)
  },

  markAllNotificationsAsRead({ commit, dispatch }) {
    commit(MARK_ALL_NOTIFICATIONS_AS_READ)
    return notificationsApi.markAllNotificationsAsRead().catch(err => {
      // No cheap rollback for a bulk toggle: resync from the server.
      dispatch('loadNotifications')
      throw err
    })
  },

  markAllNotificationsAsReadLocal({ commit }) {
    commit(MARK_ALL_NOTIFICATIONS_AS_READ)
    return true
  },

  toggleNotificationReadStatus({ commit }, notification) {
    commit(TOGGLE_NOTIFICATION_READ_STATUS, notification)
    return notificationsApi
      .updateNotificationReadStatus(notification.id, notification.read)
      .catch(err => {
        // The mutation toggles: re-committing restores the previous state.
        commit(TOGGLE_NOTIFICATION_READ_STATUS, notification)
        // Zou deleted it with its comment or its reply, and no event names it.
        if (isNotFound(err)) {
          commit(REMOVE_NOTIFICATION, notification.id)
          return
        }
        throw err
      })
  },

  toggleNotificationReadStatusLocal({ commit }, notification) {
    commit('TOGGLE_NOTIFICATION_READ_STATUS', notification)
    return notification
  }
}

const mutations = {
  [CLEAR_NOTIFICATIONS](state) {
    state.notifications = []
  },

  [LOAD_NOTIFICATIONS_END](state, notifications) {
    state.notifications = sortByDate(notifications)
    state.nextPageDate = getNextPageDate(state.notifications)
  },

  [LOAD_MORE_NOTIFICATIONS_END](state, notifications) {
    // The page is fetched with before = the oldest date of the previous one,
    // so it only holds older entries: append it instead of re-sorting the list.
    const page = sortByDate(notifications)
    // A live entry can carry an old date (a Zou without its mention fix
    // recreates the mentions of an edited comment with the date of the
    // comment): its page then brings it again.
    const pageIds = new Set(page.map(({ id }) => id))
    removeNotifications(state, ({ id }) => pageIds.has(id))
    state.notifications.push(...page)
    state.nextPageDate = getNextPageDate(page)
  },

  [LOAD_NOTIFICATION_END](state, notification) {
    const idx = state.notifications.findIndex(n => n.id === notification.id)
    if (idx !== -1) {
      state.notifications.splice(idx, 1, notification)
    } else {
      state.notifications.push(notification)
      state.notifications = sortByDate(state.notifications)
    }
  },

  [REMOVE_NOTIFICATION](state, notificationId) {
    removeNotifications(state, ({ id }) => id === notificationId)
  },

  [REMOVE_COMMENT_NOTIFICATIONS](state, commentId) {
    removeNotifications(state, ({ comment_id }) => comment_id === commentId)
  },

  [SET_NOTIFICATION_COUNT](state, count) {
    if (state.notificationCount !== count) {
      state.notificationCount = count
    }
  },

  [MARK_ALL_NOTIFICATIONS_AS_READ](state) {
    // The mark-all endpoint clears every notification server-side, not only
    // the loaded page.
    state.notificationCount = 0
    state.notifications.forEach(notification => {
      notification.read = true
    })
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

  [DECREMENT_NOTIFICATION_COUNTER](state) {
    state.notificationCount = state.notificationCount - 1
    if (state.notificationCount < 0) {
      state.notificationCount = 0
    }
  },

  [RESET_NOTIFICATION_COUNTER](state) {
    state.notificationCount = 0
  },

  [TOGGLE_NOTIFICATION_READ_STATUS](state, notification) {
    notification.read = !notification.read
    state.notificationCount = notification.read
      ? state.notificationCount - 1
      : state.notificationCount + 1
  },

  [RESET_ALL](state) {
    Object.assign(state, initialState())
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

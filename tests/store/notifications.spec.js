import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import notificationsApi from '../../src/store/api/notifications'
import notificationsStore from '../../src/store/modules/notifications'
import { reset, runAction } from './helpers'
import {
  LOAD_NOTIFICATIONS_END,
  LOAD_NOTIFICATION_END,
  MARK_ALL_NOTIFICATIONS_AS_READ,

  NOTIFICATION_ADD_PREVIEW
} from '../../src/store/mutation-types'


let notifications = []
let notification = {}


notificationsApi.getNotifications = (callback) => {
  process.nextTick(() => {
    callback(null, notifications)
  })
}

notificationsApi.getNotification = (notificationId, callback) => {
  process.nextTick(() => {
    callback(null, notification)
  })
}

const getters = notificationsStore.getters
const state = store.state.notifications

describe('notifications', () => {

  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    notifications = [
      {
        id: 'notification-1',
        created_at: '2018-05-19 14:00:00',
        comment_id: 'comment-1',
        read: true
      },
      {
        id: 'notification-2',
        created_at: '2018-05-18 12:00:00',
        comment_id: 'comment-1',
        read: true
      },
      {
        id: 'notification-3',
        created_at: '2018-05-19 13:00:00',
        comment_id: 'comment-2',
        read: true
      }
    ]

    notification = {
      id: 'notification-4',
      created_at: '2018-05-20 13:00:00',
      comment_id: 'comment-3',
      read: false
    }

    /*
    taskStatuses = [
      {
        id: 'task-status-1',
        name: 'Todo',
        short_name: 'todo',
        color: '#FFFFFF',
        is_reviewable: false
      },
      {
        id: 'task-status-2',
        name: 'Retake',
        short_name: 'rtk',
        color: '#000000',
        is_reviewable: false
      },
      {
        id: 'task-status-3',
        name: 'Waiting For Approval',
        short_name: 'wfa',
        color: '#333333',
        is_reviewable: false
      }
    ]

    taskTypes = [
      {
        id: 'task-type-1',
        name: 'Animation',
        priority: 1
      },
      {
        id: 'task-type-2',
        name: 'Compositing',
        priority: 2
      },
      {
        id: 'task-type-3',
        name: 'FX',
        priority: 3
      }
    ]
    */
  })

  describe('getters', () => {
    it('isNewNotification', () => {
      store.commit(LOAD_NOTIFICATIONS_END, notifications)
      expect(getters.isNewNotification(state)).to.equal(false)
      store.commit(LOAD_NOTIFICATION_END, notification)
      expect(getters.isNewNotification(state)).to.equal(true)
    })
  })

  describe('actions', () => {
    it('loadNotifications', () => {
      return helpers.runAction('loadNotifications')
        .then(() => {
          expect(state.notifications.length).to.equal(3)
          expect(state.notifications[1].id).to.equal('notification-3')
        })
    })

    it('loadNotification', () => {
      return helpers.runAction('loadNotification', notification)
        .then(() => {
          expect(state.notifications.length).to.equal(4)
          expect(state.notifications[0].id).to.equal('notification-4')
        })
    })

    it('markAllNotificationsAsRead', () => {
      store.commit(LOAD_NOTIFICATIONS_END, notifications)
      store.commit(LOAD_NOTIFICATION_END, notification)
      expect(getters.isNewNotification(state)).to.equal(true)
      helpers.runAction('markAllNotificationsAsRead')
      expect(getters.isNewNotification(state)).to.equal(false)
    })
  })

  describe('mutations', () => {
    it(LOAD_NOTIFICATIONS_END, () => {
      store.commit(LOAD_NOTIFICATIONS_END, notifications)
      expect(state.notifications.length).to.equal(3)
      expect(state.notifications[1].id).to.equal('notification-3')
    })

    it(LOAD_NOTIFICATION_END, () => {
      store.commit(LOAD_NOTIFICATION_END, notification)
      expect(state.notifications.length).to.equal(4)
      expect(state.notifications[0].id).to.equal('notification-4')
    })

    it(MARK_ALL_NOTIFICATIONS_AS_READ, () => {
      store.commit(LOAD_NOTIFICATIONS_END, notifications)
      store.commit(LOAD_NOTIFICATION_END, notification)
      expect(getters.isNewNotification(state)).to.equal(true)
      store.commit(MARK_ALL_NOTIFICATIONS_AS_READ)
      expect(getters.isNewNotification(state)).to.equal(false)
    })

    it(NOTIFICATION_ADD_PREVIEW, () => {
      store.commit(NOTIFICATION_ADD_PREVIEW, {
        commentId: 'comment-2',
        previewId: 'preview-1'
      })
      expect(state.notifications[2].preview_file_id).to.equal('preview-1')
    })
  })
})

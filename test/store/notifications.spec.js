import { expect } from 'chai'
import helpers from './helpers'
import store from '../../src/store'
import notificationsApi from '../../src/store/api/notifications'
import notificationsStore from '../../src/store/modules/notifications'
import { reset, runAction } from './helpers'
import {
  LOAD_NOTIFICATIONS_END,
} from '../../src/store/mutation-types'


let notifications = []


notificationsApi.getNotifications = (callback) => {
  process.nextTick(() => {
    callback(null, notifications)
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
        created_at: '2018-05-19 14:00:00'
      },
      {
        id: 'notification-2',
        created_at: '2018-05-18 12:00:00'
      },
      {
        id: 'notification-3',
        created_at: '2018-05-19 13:00:00'
      }
    ]

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
  })

  describe('actions', () => {
    it('loadNotifications', () => {
      return helpers.runAction('loadNotifications')
        .then(() => {
          expect(state.notifications.length).to.equal(3)
          expect(state.notifications[1].id).to.equal('notification-3')
        })
    })
  })

  describe('mutations', () => {
    it(LOAD_NOTIFICATIONS_END, () => {
      store.commit(LOAD_NOTIFICATIONS_END, notifications)
      expect(state.notifications.length).to.equal(3)
      expect(state.notifications[1].id).to.equal('notification-3')
    })
  })
})

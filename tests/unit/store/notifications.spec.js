// @vitest-environment node

import { vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('@/store/api/notifications', () => ({
  default: {
    getNotification: vi.fn(),
    getNotifications: vi.fn()
  }
}))

import notificationsApi from '@/store/api/notifications'
import notificationsStore from '@/store/modules/notifications'
import {
  LOAD_MORE_NOTIFICATIONS_END,
  LOAD_NOTIFICATION_END,
  RESET_ALL
} from '@/store/mutation-types'

const notification = (id, createdAt) => ({ id, created_at: createdAt })

const OLDEST_DATE = '2026-09-01T10:00:00'
const NEWEST_DATE = '2026-09-10T10:00:00'

const fullPage = (length = 100) =>
  Array.from({ length }, (_, i) => notification(`n${i}`, OLDEST_DATE))

const storeWithFirstPage = async rows => {
  const store = createStore({ modules: { notifications: notificationsStore } })
  store.commit(RESET_ALL)
  notificationsApi.getNotifications.mockResolvedValueOnce(rows)
  await store.dispatch('loadNotifications', {})
  notificationsApi.getNotifications.mockClear()
  return store
}

describe('Notifications store', () => {
  // A value a test leaves unconsumed must not answer the next test.
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('loadMoreNotifications', () => {
    const loadedPage = () =>
      Array.from({ length: 100 }, (_, i) =>
        notification(`n${i}`, '2026-09-01T10:00:00')
      )

    test('appends the page when the list is still the one it was fetched for', async () => {
      const page = [notification('old', '2026-08-01T10:00:00')]
      notificationsApi.getNotifications.mockResolvedValue(page)
      const state = { notifications: loadedPage(), nextPageDate: OLDEST_DATE }
      const commit = vi.fn()

      await notificationsStore.actions.loadMoreNotifications(
        { commit, state },
        {}
      )

      expect(commit).toHaveBeenCalledWith('LOAD_MORE_NOTIFICATIONS_END', page)
    })

    test('drops the page when the list was reloaded while it was in flight', async () => {
      let resolvePage
      notificationsApi.getNotifications.mockReturnValue(
        new Promise(resolve => {
          resolvePage = resolve
        })
      )
      const state = { notifications: loadedPage(), nextPageDate: OLDEST_DATE }
      const commit = vi.fn()

      const pending = notificationsStore.actions.loadMoreNotifications(
        { commit, state },
        {}
      )
      state.notifications = []
      resolvePage([notification('old', '2026-08-01T10:00:00')])

      await expect(pending).resolves.toEqual([])
      expect(commit).not.toHaveBeenCalled()
    })

    test('asks for the next page after a new notification landed', async () => {
      const store = await storeWithFirstPage(fullPage())
      notificationsApi.getNotification.mockResolvedValueOnce(
        notification('new', NEWEST_DATE)
      )
      await store.dispatch('loadNotification', 'new')
      notificationsApi.getNotifications.mockResolvedValueOnce([])

      await store.dispatch('loadMoreNotifications', {})

      expect(notificationsApi.getNotifications).toHaveBeenCalledExactlyOnceWith(
        { before: OLDEST_DATE }
      )
    })

    test('pages from the last page, not from an older live notification', async () => {
      const store = await storeWithFirstPage(fullPage())
      notificationsApi.getNotification.mockResolvedValueOnce(
        notification('back-dated', '2026-01-01T10:00:00')
      )
      await store.dispatch('loadNotification', 'back-dated')
      notificationsApi.getNotifications.mockResolvedValueOnce([])

      await store.dispatch('loadMoreNotifications', {})

      expect(notificationsApi.getNotifications).toHaveBeenCalledExactlyOnceWith(
        { before: OLDEST_DATE }
      )
    })

    test('asks for nothing more once a page came back short', async () => {
      const store = await storeWithFirstPage(fullPage())
      notificationsApi.getNotifications.mockResolvedValueOnce([])
      await store.dispatch('loadMoreNotifications', {})
      notificationsApi.getNotifications.mockClear()

      await store.dispatch('loadMoreNotifications', {})

      expect(notificationsApi.getNotifications).not.toHaveBeenCalled()
    })

    test('asks for nothing when a new notification fills a short list', async () => {
      const store = await storeWithFirstPage(fullPage(99))
      notificationsApi.getNotification.mockResolvedValueOnce(
        notification('new', NEWEST_DATE)
      )
      await store.dispatch('loadNotification', 'new')

      await store.dispatch('loadMoreNotifications', {})

      expect(notificationsApi.getNotifications).not.toHaveBeenCalled()
    })
  })

  describe(LOAD_MORE_NOTIFICATIONS_END, () => {
    test('appends the page after the loaded entries, newest first', () => {
      const state = {
        notifications: [
          notification('n1', '2026-09-10T10:00:00'),
          notification('n2', '2026-09-09T10:00:00')
        ]
      }

      notificationsStore.mutations[LOAD_MORE_NOTIFICATIONS_END](state, [
        notification('n4', '2026-09-07T10:00:00'),
        notification('n3', '2026-09-08T10:00:00')
      ])

      expect(state.notifications.map(n => n.id)).toEqual([
        'n1',
        'n2',
        'n3',
        'n4'
      ])
    })

    test('appends the page without re-sorting the loaded entries', () => {
      const state = {
        notifications: [
          notification('n2', '2026-09-09T10:00:00'),
          notification('n3', '2026-09-08T10:00:00')
        ]
      }

      notificationsStore.mutations[LOAD_MORE_NOTIFICATIONS_END](state, [
        notification('n1', '2026-09-10T10:00:00')
      ])

      expect(state.notifications.map(n => n.id)).toEqual(['n2', 'n3', 'n1'])
    })

    // A Zou without its mention fix recreates the mentions of an edited
    // comment with the date of the comment: listed live, such an entry sits
    // at the end until its page comes.
    test('moves an entry the page brings again to its place', () => {
      const list = [
        notification('n1', '2026-09-10T10:00:00'),
        notification('back-dated', '2026-01-01T10:00:00')
      ]
      const state = { notifications: list }

      notificationsStore.mutations[LOAD_MORE_NOTIFICATIONS_END](state, [
        notification('back-dated', '2026-01-01T10:00:00'),
        notification('n2', '2026-06-01T10:00:00')
      ])

      expect(state.notifications.map(n => n.id)).toEqual([
        'n1',
        'n2',
        'back-dated'
      ])
      expect(state.notifications).toBe(list)
    })
  })

  describe(LOAD_NOTIFICATION_END, () => {
    test('keeps the list sorted so the next page can be appended', () => {
      const state = {
        notifications: [
          notification('n1', '2026-09-10T10:00:00'),
          notification('n3', '2026-09-08T10:00:00')
        ]
      }

      notificationsStore.mutations[LOAD_NOTIFICATION_END](
        state,
        notification('n2', '2026-09-09T10:00:00')
      )

      expect(state.notifications.map(n => n.id)).toEqual(['n1', 'n2', 'n3'])
    })
  })

  describe(RESET_ALL, () => {
    test('restores an empty list even after a page landed on the reset list', () => {
      const state = {
        notifications: [notification('n1', '2026-09-10T10:00:00')]
      }

      notificationsStore.mutations[RESET_ALL](state)
      notificationsStore.mutations[LOAD_MORE_NOTIFICATIONS_END](state, [
        notification('n2', '2026-09-09T10:00:00')
      ])
      notificationsStore.mutations[RESET_ALL](state)

      expect(state.notifications).toEqual([])
    })
  })
})

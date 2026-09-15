// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store/api/notifications', () => ({
  default: { getNotifications: vi.fn() }
}))

import notificationsApi from '@/store/api/notifications'
import notificationsStore from '@/store/modules/notifications'
import {
  LOAD_MORE_NOTIFICATIONS_END,
  LOAD_NOTIFICATION_END,
  RESET_ALL
} from '@/store/mutation-types'

const notification = (id, createdAt) => ({ id, created_at: createdAt })

describe('Notifications store', () => {
  describe('loadMoreNotifications', () => {
    const loadedPage = () =>
      Array.from({ length: 100 }, (_, i) =>
        notification(`n${i}`, '2026-09-01T10:00:00')
      )

    test('appends the page when the list is still the one it was fetched for', async () => {
      const page = [notification('old', '2026-08-01T10:00:00')]
      notificationsApi.getNotifications.mockResolvedValue(page)
      const state = { notifications: loadedPage() }
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
      const state = { notifications: loadedPage() }
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

// @vitest-environment node

import { vi } from 'vitest'

// The store modules transitively import the root store: stub it so no Vuex
// store is built.
vi.mock('@/store', () => ({ default: {} }))

import scheduleStore from '@/store/modules/schedule'
import scheduleApi from '@/store/api/schedule'
import { SET_SCHEDULE_VERSION } from '@/store/mutation-types'

describe('Schedule store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // The schedule page reloads for the production switched to: the response
  // of the production left must not replace its items.
  test('ignores the schedule items of a production left during the fetch', async () => {
    const rootGetters = { currentProduction: { id: 'p1' } }
    vi.spyOn(scheduleApi, 'getScheduleItems').mockImplementation(async () => {
      rootGetters.currentProduction = { id: 'p2' }
      return [{ id: 'item-1' }]
    })
    const commit = vi.fn()

    const items = await scheduleStore.actions.loadScheduleItems(
      { commit, rootGetters },
      { id: 'p1' }
    )

    expect(items).toEqual([{ id: 'item-1' }])
    expect(commit).not.toHaveBeenCalled()
  })

  // The version modal only sends the fields it edits: the version list is
  // sorted on created_at, which must survive a rename or a lock.
  test('keeps the fields a version update does not send', () => {
    const state = {
      scheduleVersions: [
        {
          id: 'v1',
          name: 'Draft',
          locked: false,
          created_at: '2026-09-01T10:00:00',
          project_id: 'p1'
        }
      ]
    }

    scheduleStore.mutations[SET_SCHEDULE_VERSION](state, {
      id: 'v1',
      name: 'Final',
      locked: true
    })

    expect(state.scheduleVersions).toEqual([
      {
        id: 'v1',
        name: 'Final',
        locked: true,
        created_at: '2026-09-01T10:00:00',
        project_id: 'p1'
      }
    ])
  })

  describe('milestones', () => {
    const { mutations, getters } = scheduleStore

    // Two milestones on one day used to overwrite each other: the store was
    // keyed by date.
    test('keeps several milestones on the same day', () => {
      const state = { milestones: {} }
      mutations.ADD_MILESTONES(state, [
        { id: 'm1', date: '2026-10-20', name: 'Review' },
        { id: 'm2', date: '2026-10-20', name: 'Delivery' },
        { id: 'm3', date: '2026-10-21', name: 'Kickoff' }
      ])

      expect(Object.keys(state.milestones)).toHaveLength(3)
      const byDate = getters.milestonesByDate(state)
      expect(byDate['2026-10-20'].map(m => m.id)).toEqual(['m2', 'm1'])
      expect(byDate['2026-10-21'].map(m => m.id)).toEqual(['m3'])
    })

    test('adds, updates and removes milestones by id', () => {
      const state = { milestones: {} }
      mutations.ADD_MILESTONE(state, { id: 'm1', date: '2026-10-20' })
      mutations.ADD_MILESTONE(state, { id: 'm2', date: '2026-10-20' })
      mutations.ADD_MILESTONE(state, {
        id: 'm1',
        date: '2026-10-22',
        name: 'Moved'
      })

      expect(state.milestones.m1).toEqual({
        id: 'm1',
        date: '2026-10-22',
        name: 'Moved'
      })
      mutations.REMOVE_MILESTONE(state, { id: 'm1' })
      expect(Object.keys(state.milestones)).toEqual(['m2'])
    })
  })
})

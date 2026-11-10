import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ref } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
// The browser download is where an export leaves the app.
vi.mock('@/lib/download', () => ({ downloadBlob: vi.fn() }))

import { downloadBlob } from '@/lib/download'

import Timesheets from '@/components/pages/Timesheets.vue'
import PeopleTimesheetInfo from '@/components/sides/PeopleTimesheetInfo.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const alice = { id: 'person-1', full_name: 'Alice', active: true }
const bob = { id: 'person-2', full_name: 'Bob', active: true }

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/timesheets/day/:year/:month',
      name: 'timesheets-day',
      component: Timesheets
    },
    {
      path: '/timesheets/week/:year',
      name: 'timesheets-week',
      component: Timesheets
    },
    {
      path: '/timesheets/month/:year/:month/persons/:person_id',
      name: 'timesheets-month-person',
      component: Timesheets
    }
  ]
})

let wrapper

const mountPage = async (path, { actions = {}, getters = {} } = {}) => {
  const store = createStore({
    getters: {
      canReadDaysOff: () => () => true,
      firstTimesheetYear: () => 2024,
      isCurrentUserAdmin: () => false,
      organisation: () => ({ hours_by_day: 8 }),
      people: () => [alice],
      personMap: () => new Map([[alice.id, alice]]),
      productions: () => [],
      timesheet: () => ({ 1: { [alice.id]: 120 } }),
      ...getters
    }
  })
  store.dispatch = vi.fn((name, payload) =>
    Promise.resolve(actions[name]?.(payload))
  )
  await router.push(path)
  await router.isReady()
  wrapper = shallowMount(Timesheets, {
    global: { plugins: [store, router] }
  })
  await flushPromises()
}

// The lines of the file the export hands to the browser.
const exportLines = async () => {
  wrapper
    .findAllComponents(ButtonSimple)
    .find(button => button.props('icon') === 'export')
    .vm.$emit('click')
  const [blob] = downloadBlob.mock.calls[0]
  return (await blob.text()).split('\n')
}

describe('Timesheets', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 3, 12))
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('export', () => {
    test('exports the days of a past month', async () => {
      await mountPage('/timesheets/day/2026/10')

      const [headers, aliceLine] = await exportLines()

      const days = headers.split(';')
      expect(days).toHaveLength(32)
      expect(days[1]).toBe('"2026-10-01"')
      expect(days[31]).toBe('"2026-10-31"')
      // The export guards the cells a spreadsheet could read as a formula.
      expect(aliceLine.split(';').slice(0, 3)).toEqual([
        '"Alice"',
        '"2"',
        `"'-"`
      ])
    })

    test('exports the days of the current month up to today', async () => {
      await mountPage('/timesheets/day/2026/11')

      const [headers] = await exportLines()

      expect(headers).toBe(
        '"Person";"2026-11-01";"2026-11-02";"2026-11-03"'
      )
    })

    test('exports every week of a past year', async () => {
      await mountPage('/timesheets/week/2025')

      const [headers] = await exportLines()

      // 2025 has 52 ISO weeks, 2026 has 53.
      expect(headers.split(';')).toHaveLength(53)
    })
  })

  describe('person panel', () => {
    const path = `/timesheets/month/2026/10/persons/${alice.id}`
    const tasks = [{ task_id: 'task-1', duration: 60 }]

    test('shows the time and days off of the period', async () => {
      const loadAggregatedPersonDaysOff = vi.fn(() => [{ date: '2026-10-05' }])
      await mountPage(path, {
        actions: {
          loadAggregatedPersonDaysOff,
          loadAggregatedPersonTimeSpents: () => tasks
        }
      })

      expect(loadAggregatedPersonDaysOff).toHaveBeenCalledWith(
        expect.objectContaining({ personId: alice.id, detailLevel: 'month' })
      )
      expect(wrapper.findComponent(PeopleTimesheetInfo).props()).toMatchObject(
        {
          dayOffs: [{ date: '2026-10-05' }],
          isLoadingError: false,
          tasks,
          withDaysOff: true
        }
      )
    })

    // the rule can change under an open panel, as when the viewer gets a
    // new role, even during a load: the panel shows the days off count of
    // its own load
    test('shows the days off count once a load reads them', async () => {
      const isAllowed = ref(false)
      let answerTime
      const loadAggregatedPersonDaysOff = vi.fn(() => [{ date: '2026-09-07' }])
      await mountPage(path, {
        actions: {
          loadAggregatedPersonDaysOff,
          loadAggregatedPersonTimeSpents: vi
            .fn(() => tasks)
            .mockReturnValueOnce(new Promise(resolve => (answerTime = resolve)))
        },
        getters: { canReadDaysOff: () => () => isAllowed.value }
      })
      const panel = wrapper.findComponent(PeopleTimesheetInfo)

      isAllowed.value = true
      answerTime(tasks)
      await flushPromises()

      expect(panel.props('withDaysOff')).toBe(false)
      expect(loadAggregatedPersonDaysOff).not.toHaveBeenCalled()

      await router.push(`/timesheets/month/2026/9/persons/${alice.id}`)
      await flushPromises()

      expect(panel.props()).toMatchObject({
        dayOffs: [{ date: '2026-09-07' }],
        withDaysOff: true
      })
    })

    // Zou refuses the days off of a person to some viewers
    test('shows the time of the period to a viewer refused the days off', async () => {
      const canReadDaysOff = vi.fn(() => false)
      const loadAggregatedPersonDaysOff = vi.fn(() =>
        Promise.reject(new Error('Forbidden'))
      )
      await mountPage(path, {
        actions: {
          loadAggregatedPersonDaysOff,
          loadAggregatedPersonTimeSpents: () => tasks
        },
        getters: { canReadDaysOff: () => canReadDaysOff }
      })

      expect(canReadDaysOff).toHaveBeenCalledWith(alice.id)
      expect(loadAggregatedPersonDaysOff).not.toHaveBeenCalled()
      expect(wrapper.findComponent(PeopleTimesheetInfo).props()).toMatchObject(
        {
          dayOffs: [],
          isLoadingError: false,
          tasks,
          withDaysOff: false
        }
      )
    })

    const twoPeople = {
      people: () => [alice, bob],
      personMap: () => new Map([alice, bob].map(person => [person.id, person]))
    }

    // a failed read would leave the days off of the person shown before
    test('drops the days off of the person shown before', async () => {
      const error = new Error('Server error')
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      try {
        await mountPage(path, {
          actions: {
            loadAggregatedPersonDaysOff: ({ personId }) =>
              personId === alice.id
                ? [{ date: '2026-10-05' }]
                : Promise.reject(error),
            loadAggregatedPersonTimeSpents: () => tasks
          },
          getters: twoPeople
        })
        const panel = wrapper.findComponent(PeopleTimesheetInfo)
        expect(panel.props('dayOffs')).toEqual([{ date: '2026-10-05' }])

        await router.push(`/timesheets/month/2026/10/persons/${bob.id}`)
        await flushPromises()

        expect(panel.props()).toMatchObject({
          dayOffs: [],
          isLoadingError: true
        })
        expect(consoleError).toHaveBeenCalledWith(error)
      } finally {
        consoleError.mockRestore()
      }
    })
  })
})

import { flushPromises, shallowMount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
// The browser download is where an export leaves the app.
vi.mock('@/lib/download', () => ({ downloadBlob: vi.fn() }))

import { downloadBlob } from '@/lib/download'

import Timesheets from '@/components/pages/Timesheets.vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const alice = { id: 'person-1', full_name: 'Alice', active: true }

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
    }
  ]
})

let wrapper

const mountPage = async path => {
  const store = createStore({
    getters: {
      firstTimesheetYear: () => 2024,
      isCurrentUserAdmin: () => false,
      organisation: () => ({ hours_by_day: 8 }),
      people: () => [alice],
      personMap: () => new Map([[alice.id, alice]]),
      productions: () => [],
      timesheet: () => ({ 1: { [alice.id]: 120 } })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
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
})

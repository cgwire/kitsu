import { shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createStore } from 'vuex'

import PeopleTimesheetList from '@/components/lists/PeopleTimesheetList.vue'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))

vi.mock('vue-router', async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () => ({ params: {}, query: {}, fullPath: '/' })
}))

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const mountList = props =>
  shallowMount(PeopleTimesheetList, {
    global: {
      plugins: [
        createStore({
          getters: {
            dateFormat: () => 'YYYY-MM-DD',
            dayOffMap: () => ({}),
            firstTimesheetYear: () => 2020,
            organisation: () => ({ hours_by_day: 8 }),
            use12HourClock: () => false
          }
        })
      ],
      stubs: { RouterLink: true }
    },
    props: {
      people: [{ id: 'person-1', name: 'John Doe' }],
      timesheet: { 3: { 'person-1': 120 } },
      ...props
    }
  })

const range = (first, last) =>
  Array.from({ length: last - first + 1 }, (_, index) => String(first + index))

describe('lists/PeopleTimesheetList', () => {
  // every level is mounted: a helper dropped from a branch of the template
  // by a refactor throws at render in that branch only. A past year spans
  // all its columns whatever today is, the year level alone runs up to
  // today; the page always passes a month, which the day range needs
  test.each([
    ['year', range(2020, new Date().getFullYear())],
    ['month', months],
    ['week', range(1, 52)],
    ['day', range(1, 31)]
  ])(
    'the %s level names its columns and mobile card chips',
    (detailLevel, labels) => {
      const wrapper = mountList({ detailLevel, year: 2025, month: 1 })

      const headers = wrapper.findAll('thead th.time, thead th.daytime')
      expect(headers).toHaveLength(labels.length)
      headers.forEach((th, index) => expect(th.text()).toContain(labels[index]))
      expect(
        wrapper
          .findAll('td.time, td.daytime')
          .map(td => td.attributes('data-label'))
      ).toEqual(labels)
    }
  )
})

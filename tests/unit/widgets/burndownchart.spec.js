import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'

import BurndownChart from '@/components/widgets/BurndownChart.vue'
import ToggleButton from '@/components/widgets/ToggleButton.vue'

import './setup'

// The real line-chart is registered globally by main.js.
const LineChart = {
  name: 'LineChart',
  props: { data: Array, library: Object },
  template: '<div />'
}

const store = createStore({
  getters: {
    isDarkTheme: () => false,
    organisation: () => ({ hours_by_day: 7 })
  }
})

const mountChart = burndown =>
  shallowMount(BurndownChart, {
    props: { burndown },
    global: {
      plugins: [i18n, store],
      components: { LineChart },
      stubs: { LineChart }
    }
  })

const projection = wrapper =>
  wrapper
    .findComponent(LineChart)
    .props('data')
    .find(series => series.name === i18n.global.t('burndown.projection')).data

// 20 tasks done over the 100 days up to today, 2 left, deadline in 9 days:
// at 0.2 task a day, 0.2 task is still open at the deadline.
const lateBurndown = {
  start_date: '2026-06-28',
  end_date: '2026-10-15',
  total: 22,
  total_estimation: 0,
  done_by_day: [
    { date: '2026-06-28', done: 10, done_estimation: 0 },
    { date: '2026-10-01', done: 10, done_estimation: 0 }
  ]
}

describe('BurndownChart', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-06T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('projects the remaining tasks from today at the observed velocity', () => {
    const wrapper = mountChart(lateBurndown)
    expect(projection(wrapper)['2026-10-06']).toBe(2)
  })

  it('keeps a fraction of a task left at the deadline as a task left', () => {
    const wrapper = mountChart(lateBurndown)
    expect(projection(wrapper)['2026-10-15']).toBe(1)
  })

  it('keeps a fraction of a tenth of a day left at the deadline', async () => {
    // 10,600 minutes done over 100 days, 960 left: 6 minutes are still open
    // at the deadline, under a twentieth of a 7-hour day.
    const wrapper = mountChart({
      ...lateBurndown,
      total_estimation: 11560,
      done_by_day: [
        { date: '2026-06-28', done: 10, done_estimation: 5300 },
        { date: '2026-10-01', done: 10, done_estimation: 5300 }
      ]
    })
    await wrapper.findComponent(ToggleButton).vm.$emit('update:modelValue', true)
    expect(projection(wrapper)['2026-10-15']).toBe(0.1)
  })

  it('rounds a tenth of a day left at the deadline to itself', async () => {
    // 294 minutes left at the deadline: 0.7 of a 7-hour day.
    const wrapper = mountChart({
      ...lateBurndown,
      total_estimation: 10758,
      done_by_day: [
        { date: '2026-06-28', done: 10, done_estimation: 4800 },
        { date: '2026-10-01', done: 10, done_estimation: 4800 }
      ]
    })
    await wrapper.findComponent(ToggleButton).vm.$emit('update:modelValue', true)
    expect(projection(wrapper)['2026-10-15']).toBe(0.7)
  })

  it('never draws the projection going up', async () => {
    // 860 minutes left today read 2 days, the 846 left at the deadline
    // tomorrow would round up to 2.1.
    const wrapper = mountChart({
      start_date: '2026-06-28',
      end_date: '2026-10-07',
      total: 5,
      total_estimation: 2260,
      done_by_day: [{ date: '2026-06-28', done: 4, done_estimation: 1400 }]
    })
    await wrapper.findComponent(ToggleButton).vm.$emit('update:modelValue', true)
    expect(projection(wrapper)).toEqual({ '2026-10-06': 2, '2026-10-07': 2 })
  })

  it('reaches zero on the day the work ends with estimations in hours', async () => {
    // Four tasks of 1.33 hours, 79.80000000000001 minutes each, one done 9
    // days ago: the other three end in 27 days.
    const wrapper = mountChart({
      start_date: '2026-09-27',
      end_date: '2026-12-31',
      total: 4,
      total_estimation: 319.20000000000005,
      done_by_day: [
        { date: '2026-09-27', done: 1, done_estimation: 79.80000000000001 }
      ]
    })
    await wrapper.findComponent(ToggleButton).vm.$emit('update:modelValue', true)
    expect(projection(wrapper)).toEqual({ '2026-10-06': 0.6, '2026-11-02': 0 })
  })

  it('keeps a forecast past the year 9999 at the deadline', () => {
    // 1 task done in 588 days, 5000 left: the work would end in the year
    // 10076, a date that sorts before 2026 as a string.
    const wrapper = mountChart({
      start_date: '2025-02-25',
      end_date: '2026-12-31',
      total: 5001,
      total_estimation: 0,
      done_by_day: [{ date: '2025-02-25', done: 1, done_estimation: 0 }]
    })
    expect(projection(wrapper)).toEqual({
      '2026-10-06': 5000,
      '2026-12-31': 5000
    })
  })

  it('reaches zero on the day the work ends', () => {
    // 1 task done over the 49 days up to today, 1 left: it ends in 49 days,
    // before the deadline.
    const wrapper = mountChart({
      start_date: '2026-08-18',
      end_date: '2026-12-05',
      total: 2,
      total_estimation: 0,
      done_by_day: [{ date: '2026-08-18', done: 1, done_estimation: 0 }]
    })
    expect(projection(wrapper)).toEqual({ '2026-10-06': 1, '2026-11-24': 0 })
  })

  it('keeps a whole task left at the deadline as one task', () => {
    // 7 tasks done over the 5 days up to today, 64 left, deadline in 45
    // days: 1 task is left at the deadline.
    const wrapper = mountChart({
      start_date: '2026-10-01',
      end_date: '2026-11-20',
      total: 71,
      total_estimation: 0,
      done_by_day: [
        { date: '2026-10-01', done: 3, done_estimation: 0 },
        { date: '2026-10-03', done: 4, done_estimation: 0 }
      ]
    })
    expect(projection(wrapper)).toEqual({ '2026-10-06': 64, '2026-11-20': 1 })
  })
})

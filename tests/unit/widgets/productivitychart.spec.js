import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'
import { today } from '@/lib/timesheet'

import ProductivityChart from '@/components/widgets/ProductivityChart.vue'

import './setup'

// The real column-chart is registered globally by main.js.
const ColumnChart = {
  name: 'ColumnChart',
  props: { data: Array, library: Object },
  template: '<div />'
}

const store = createStore({
  getters: {
    isDarkTheme: () => false
  }
})

// March of last year: a full past month of 31 days.
const year = today.year - 1
const rows = [
  { date: `${year}-03-03`, duration: 90, project_id: 'p1', task_type_id: 't1' },
  { date: `${year}-03-03`, duration: 60, project_id: 'p2', task_type_id: 't1' },
  {
    date: `${year}-03-05T10:00:00`,
    duration: 30,
    project_id: 'p1',
    task_type_id: 't2'
  }
]

const mountChart = props =>
  mount(ProductivityChart, {
    props: {
      level: 'day',
      year,
      month: 3,
      timeSpents: rows,
      ...props
    },
    global: {
      plugins: [i18n, store],
      components: { ColumnChart },
      stubs: { ColumnChart }
    }
  })

const chart = wrapper => wrapper.findComponent(ColumnChart)
const series = wrapper => chart(wrapper).props('data')[0]

describe('ProductivityChart', () => {
  it('draws one bar per day of a past month, in hours', () => {
    const wrapper = mountChart({ productionId: 'p1' })
    const { data } = series(wrapper)
    expect(data).toHaveLength(31)
    expect(data[0]).toEqual(['1', 0])
    expect(data[2]).toEqual(['3', 1.5])
    expect(data[4]).toEqual(['5', 0.5])
  })

  it('sums every production without a production filter', () => {
    const wrapper = mountChart()
    expect(series(wrapper).data[2]).toEqual(['3', 2.5])
  })

  it('filters the bars by task type', () => {
    const wrapper = mountChart({ taskTypeId: 't2' })
    expect(series(wrapper).data[2]).toEqual(['3', 0])
    expect(series(wrapper).data[4]).toEqual(['5', 0.5])
  })

  it('shows the total hours of the period', () => {
    const wrapper = mountChart({ productionId: 'p1' })
    expect(wrapper.find('.productivity-total').text()).toContain('2')
  })

  it('emits the column index of a clicked bar', () => {
    const wrapper = mountChart()
    chart(wrapper).props('library').onClick({}, [{ index: 2 }])
    expect(wrapper.emitted('column-selected')).toEqual([[3]])
  })

  it('emits nothing on a click outside the bars', () => {
    const wrapper = mountChart()
    chart(wrapper).props('library').onClick({}, [])
    expect(wrapper.emitted('column-selected')).toBeUndefined()
  })

  it('paints the selected bar apart from the others', () => {
    const wrapper = mountChart({ selectedIndex: 3 })
    const colors = series(wrapper).dataset.backgroundColor
    expect(colors[2]).toBe('#00b242')
    expect(colors[0]).toBe('rgba(0, 178, 66, 0.55)')
  })

  it('paints every bar alike without a selection', () => {
    const wrapper = mountChart()
    expect(series(wrapper).dataset.backgroundColor).toBe('#00b242')
  })

  it('emits the level of a clicked level button', async () => {
    const wrapper = mountChart()
    await wrapper.find('[data-level="week"]').trigger('click')
    expect(wrapper.emitted('level-changed')).toEqual([['week']])
  })

  it('marks the current level button', () => {
    const wrapper = mountChart({ level: 'month' })
    expect(wrapper.find('[data-level="month"]').classes()).toContain('is-on')
    expect(wrapper.find('[data-level="day"]').classes()).not.toContain('is-on')
  })

  it('shows the month selector in the day level only', () => {
    expect(mountChart().find('.month-combobox').exists()).toBe(true)
    const weekWrapper = mountChart({ level: 'week' })
    expect(weekWrapper.find('.month-combobox').exists()).toBe(false)
    expect(weekWrapper.find('.year-combobox').exists()).toBe(true)
  })

  it('offers the last five years', () => {
    const options = mountChart().findComponent('.year-combobox').props('options')
    expect(options.map(({ value }) => value)).toEqual(
      [4, 3, 2, 1, 0].map(delta => `${today.year - delta}`)
    )
  })

  it('emits the new period on a year change', async () => {
    const wrapper = mountChart()
    const yearCombo = wrapper.findComponent('.year-combobox')
    yearCombo.vm.$emit('update:model-value', `${today.year}`)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('period-changed')).toEqual([
      [{ year: today.year, month: 3 }]
    ])
  })

  it('emits the new period on a month change', async () => {
    const wrapper = mountChart()
    const monthCombo = wrapper.findComponent('.month-combobox')
    monthCombo.vm.$emit('update:model-value', '7')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('period-changed')).toEqual([[{ year, month: 7 }]])
  })

  it('shows a spinner while loading', () => {
    const wrapper = mountChart({ isLoading: true })
    expect(chart(wrapper).exists()).toBe(false)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })
})

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import i18n from '@/lib/i18n'
import { today } from '@/lib/timesheet'

import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
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
    isDarkTheme: () => false,
    organisation: () => ({ hours_by_day: 7 })
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

  it('ignores a click on the average line', () => {
    const wrapper = mountChart()
    chart(wrapper)
      .props('library')
      .onClick({}, [{ datasetIndex: 1, index: 2 }])
    expect(wrapper.emitted('column-selected')).toBeUndefined()
  })

  // before the first layout the chart has no area to lay a gradient on
  const barColor = (wrapper, dataIndex) =>
    series(wrapper).dataset.backgroundColor({
      chart: { chartArea: null },
      dataIndex
    })

  it('fades the bars around the selected one', () => {
    const wrapper = mountChart({ selectedIndex: 3 })
    expect(barColor(wrapper, 2)).toBe('#00b242')
    expect(barColor(wrapper, 0)).toBe('rgba(0, 178, 66, 0.25)')
  })

  // the colours are functions: without a new dataset the chart keeps the
  // previous selection painted
  it('repaints the bars when the selection moves', async () => {
    const wrapper = mountChart({ selectedIndex: 3 })
    const before = series(wrapper).dataset
    await wrapper.setProps({ selectedIndex: 5 })
    expect(series(wrapper).dataset).not.toBe(before)
    expect(barColor(wrapper, 2)).toBe('rgba(0, 178, 66, 0.25)')
    expect(barColor(wrapper, 4)).toBe('#00b242')
  })

  it('paints every bar alike without a selection', () => {
    const wrapper = mountChart()
    expect(barColor(wrapper, 0)).toBe('#00b242')
    expect(barColor(wrapper, 2)).toBe('#00b242')
  })

  // the studio hours per day, over the working days of each column
  const targetLine = wrapper => chart(wrapper).props('data')[1]

  it('draws the studio hours per working day as a dashed line', () => {
    const wrapper = mountChart()
    const line = targetLine(wrapper)
    expect(line.dataset.type).toBe('line')
    // one dashed stroke, bridged over the weekends
    expect(line.dataset.borderDash).toBeTruthy()
    expect(line.dataset.spanGaps).toBe(true)
    expect(line.dataset.stepped).toBeFalsy()
    const target = day =>
      line.data.find(([label]) => label === `${day}`)[1]
    // weekends have no target
    const weekday = day =>
      ![0, 6].includes(new Date(Date.UTC(year, 2, day)).getUTCDay())
    ;[1, 2, 3, 4, 5, 6, 7].forEach(day => {
      expect(target(day)).toBe(weekday(day) ? 7 : null)
    })
    expect(wrapper.find('.productivity-average').exists()).toBe(true)
  })

  it('sets a week target of five working days', () => {
    const line = targetLine(mountChart({ level: 'week' }))
    expect(line.data[0][1]).toBe(35)
  })

  it('draws no target line in the month view', () => {
    const wrapper = mountChart({ level: 'month' })
    expect(chart(wrapper).props('data')).toHaveLength(1)
  })

  it('names the week in the tooltip title', () => {
    const { title } = chart(mountChart({ level: 'week' })).props('library')
      .plugins.tooltip.callbacks
    expect(title([{ label: '41' }])).toBe('Week 41')
  })

  it('keeps the plain label in the day tooltip title', () => {
    const { title } = chart(mountChart()).props('library').plugins.tooltip
      .callbacks
    expect(title([{ label: '3' }])).toBe('3')
  })

  it('draws no target line for the quotas', () => {
    const wrapper = mountChart({ metric: 'quotas', quotas: [] })
    expect(chart(wrapper).props('data')).toHaveLength(1)
  })

  it('emits the level picked in the level combobox', async () => {
    const wrapper = mountChart()
    await wrapper
      .findComponent('.level-combobox')
      .vm.$emit('update:modelValue', 'week')
    expect(wrapper.emitted('level-changed')).toEqual([['week']])
  })

  it('shows the current level in the level combobox', () => {
    const wrapper = mountChart({ level: 'month' })
    expect(wrapper.findComponent('.level-combobox').props('modelValue')).toBe(
      'month'
    )
  })

  // the same order as the Quota page filters
  it('lays the combos out as on the Quota page', () => {
    const wrapper = mountChart({ metric: 'quotas' })
    const classes = wrapper
      .findAllComponents(ComboboxStyled)
      .map(combo => combo.classes().find(name => name.endsWith('-combobox')))
    expect(classes).toEqual([
      'metric-combobox',
      'level-combobox',
      'month-combobox',
      'year-combobox',
      'count-mode-combobox',
      'quota-mode-combobox'
    ])
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

  describe('week level scroll', () => {
    // jsdom lays nothing out: the wrapper overflows as on a phone
    const layout = (scrollWidth, clientWidth) => {
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
        scrollWidth
      )
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
        clientWidth
      )
    }
    const scrollLeft = wrapper =>
      wrapper.find('.chart-wrapper').element.scrollLeft

    afterEach(() => vi.restoreAllMocks())

    it('opens on the latest weeks when the chart overflows', async () => {
      layout(900, 300)
      const wrapper = mountChart({ level: 'week' })
      await nextTick()
      expect(scrollLeft(wrapper)).toBe(900)
    })

    it('scrolls once the loaded chart shows up', async () => {
      layout(900, 300)
      const wrapper = mountChart({ level: 'day', isLoading: true })
      await wrapper.setProps({ level: 'week' })
      expect(wrapper.find('.chart-wrapper').exists()).toBe(false)
      await wrapper.setProps({ isLoading: false })
      expect(scrollLeft(wrapper)).toBe(900)
    })

    it('leaves the other levels and a fitting chart alone', async () => {
      layout(900, 300)
      const dayWrapper = mountChart({ level: 'day' })
      await nextTick()
      expect(scrollLeft(dayWrapper)).toBe(0)
      layout(300, 300)
      const fittingWrapper = mountChart({ level: 'week' })
      await nextTick()
      expect(scrollLeft(fittingWrapper)).toBe(0)
    })
  })

  it('shows a spinner while loading', () => {
    const wrapper = mountChart({ isLoading: true })
    expect(chart(wrapper).exists()).toBe(false)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  describe('quotas metric', () => {
    const quotas = [
      {
        total: {
          day: {
            frames: { [`${year}-03-03`]: 12.4, [`${year}-03-05`]: 3 },
            seconds: { [`${year}-03-03`]: 0.52 }
          }
        },
        t1: { day: { frames: { [`${year}-03-03`]: 4 } } }
      },
      { total: { day: { frames: { [`${year}-03-03`]: 2 } } } }
    ]
    const mountQuotas = props =>
      mountChart({ metric: 'quotas', quotas, ...props })

    it('emits the metric picked in the metric combobox', async () => {
      const wrapper = mountChart()
      await wrapper
        .findComponent('.metric-combobox')
        .vm.$emit('update:modelValue', 'quotas')
      expect(wrapper.emitted('metric-changed')).toEqual([['quotas']])
    })

    it('shows the current metric in the metric combobox', () => {
      const wrapper = mountQuotas()
      expect(
        wrapper.findComponent('.metric-combobox').props('modelValue')
      ).toBe('quotas')
    })

    it('shows the quota combos in the quotas metric only', () => {
      const timeWrapper = mountChart()
      expect(timeWrapper.find('.quota-mode-combobox').exists()).toBe(false)
      expect(timeWrapper.find('.count-mode-combobox').exists()).toBe(false)
      const wrapper = mountQuotas()
      expect(wrapper.find('.quota-mode-combobox').exists()).toBe(true)
      expect(wrapper.find('.count-mode-combobox').exists()).toBe(true)
    })

    it('emits the new compute mode', async () => {
      const wrapper = mountQuotas()
      wrapper
        .findComponent('.quota-mode-combobox')
        .vm.$emit('update:model-value', 'done')
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('quota-mode-changed')).toEqual([['done']])
    })

    it('emits the new count mode', async () => {
      const wrapper = mountQuotas()
      wrapper
        .findComponent('.count-mode-combobox')
        .vm.$emit('update:model-value', 'seconds')
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('count-mode-changed')).toEqual([['seconds']])
    })

    it('offers the four compute modes', () => {
      const options = mountQuotas()
        .findComponent('.quota-mode-combobox')
        .props('options')
      expect(options.map(({ value }) => value)).toEqual([
        'weighted',
        'feedback',
        'weighteddone',
        'done'
      ])
    })

    it('offers frames, seconds and count outside paper productions', () => {
      const options = mountQuotas()
        .findComponent('.count-mode-combobox')
        .props('options')
      expect(options.map(({ value }) => value)).toEqual([
        'frames',
        'seconds',
        'count'
      ])
    })

    it('offers drawings and count in paper productions', () => {
      const options = mountQuotas({ isPaper: true, countMode: 'drawings' })
        .findComponent('.count-mode-combobox')
        .props('options')
      expect(options.map(({ value }) => value)).toEqual(['drawings', 'count'])
    })

    it('reads the bars from the quotas, frames rounded to units', () => {
      const { data } = series(mountQuotas())
      expect(data).toHaveLength(31)
      expect(data[0]).toEqual(['1', 0])
      expect(data[2]).toEqual(['3', 14])
      expect(data[4]).toEqual(['5', 3])
    })

    it('rounds seconds to one decimal', () => {
      const { data } = series(mountQuotas({ countMode: 'seconds' }))
      expect(data[2]).toEqual(['3', 0.5])
    })

    it('filters the quotas by task type', () => {
      const { data } = series(mountQuotas({ taskTypeId: 't1' }))
      expect(data[2]).toEqual(['3', 4])
      expect(data[4]).toEqual(['5', 0])
    })

    it('shows the total with the count unit', () => {
      const wrapper = mountQuotas()
      expect(wrapper.find('.productivity-total').text()).toBe('17 Frames')
      expect(series(wrapper).name).toBe('Frames')
    })

    it('keeps the chart colour', () => {
      expect(series(mountQuotas()).color).toBe('#00b242')
    })
  })
})

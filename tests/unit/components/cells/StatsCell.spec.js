import { shallowMount } from '@vue/test-utils'

import StatsCell from '@/components/cells/StatsCell.vue'
import StatsBar from '@/components/widgets/StatsBar.vue'
import StatsHeat from '@/components/widgets/StatsHeat.vue'

// The real pie-chart is registered globally by main.js.
const PieChart = {
  name: 'PieChart',
  props: { data: Array, colors: Array, dataset: Object, library: Object },
  template: '<div />'
}

const data = [
  ['done', 3, '#22d160', true],
  ['wip', 1, '#3273dc', false]
]

const mountCell = (props = {}) =>
  shallowMount(StatsCell, {
    props: { colors: ['#22d160', '#3273dc'], data, ...props },
    global: { components: { PieChart }, stubs: { PieChart } }
  })

describe('cells/StatsCell', () => {
  test('draws the pie slices with a thin outline', () => {
    const wrapper = mountCell({ displayMode: 'pie' })
    const pie = wrapper.findComponent(PieChart)
    expect(pie.props('data')).toEqual(data)
    expect(pie.props('dataset')).toEqual({ borderWidth: 1 })
  })

  // One shot left in retake out of 250 would be thinner than the outline of
  // its slice.
  test('draws a small share large enough to see, with its real value on hover', () => {
    const wrapper = mountCell({
      displayMode: 'pie',
      data: [
        ['retake', 1, '#ff3860', false],
        ['done', 249, '#22d160', true]
      ]
    })
    const pie = wrapper.findComponent(PieChart)
    expect(pie.props('data')).toEqual([
      ['retake', 7.5, '#ff3860', false],
      ['done', 249, '#22d160', true]
    ])
    const { label } = pie.props('library').plugins.tooltip.callbacks
    expect([0, 1].map(dataIndex => label({ dataIndex }))).toEqual(['1', '249'])
  })

  test('draws a stacked bar of the counted data in bars mode', () => {
    const framesData = [['done', 120, '#22d160', true]]
    const wrapper = mountCell({
      displayMode: 'bars',
      countMode: 'frames',
      framesData
    })
    expect(wrapper.findComponent(StatsBar).props('data')).toEqual(framesData)
    expect(wrapper.findComponent(PieChart).exists()).toBe(false)
  })

  // The episode stats tag a cell with its take number.
  test.each(['pie', 'count', 'bars', 'heatmap'])(
    'shows the label of the cell in %s mode',
    displayMode => {
      const wrapper = mountCell({ displayMode, label: 'Take 2' })
      expect(wrapper.findAll('.tag').map(tag => tag.text())).toEqual(['Take 2'])
    }
  )

  test('draws a heat tile of the counted data in heatmap mode', () => {
    const wrapper = mountCell({ displayMode: 'heatmap' })
    expect(wrapper.findComponent(StatsHeat).props('data')).toEqual(data)
    expect(wrapper.findComponent(PieChart).exists()).toBe(false)
  })
})

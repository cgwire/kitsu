import { shallowMount } from '@vue/test-utils'

import StatsCell from '@/components/cells/StatsCell.vue'
import StatsBar from '@/components/widgets/StatsBar.vue'
import StatsHeat from '@/components/widgets/StatsHeat.vue'

// The real pie-chart is registered globally by main.js.
const PieChart = {
  name: 'PieChart',
  props: { data: Array, colors: Array, dataset: Object },
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

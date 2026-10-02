import { shallowMount } from '@vue/test-utils'

import StatsCell from '@/components/cells/StatsCell.vue'

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
})

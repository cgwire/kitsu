import { mount, createLocalVue } from '@vue/test-utils'
import Chart from 'chart.js'
import StatsCell from '../../../src/components/cells/StatsCell'

describe('StatusCell', () => {

  let wrapper
  beforeEach(() => {
    wrapper = mount(StatsCell, {
      propsData: {
        displayMode: 'count',
        data: [['todo', 2], ['done', 3]],
        framesData: [['todo', 20], ['done', 30]],
        colors: ['red', 'blue']
      }
    })
  })

  describe('Mount', () => {
    test('Empty', () => {
      const emptyWrapper = mount(StatsCell, {
        propsData: {
          displayMode: 'count',
          data: [],
          framesData: [],
          colors: []
        }
      })
    })

    test('With data', () => {
      const name = wrapper.findAll('.stats-name')
      expect(name.at(0).text()).toEqual('todo')
      expect(name.at(1).text()).toEqual('done')
      const value = wrapper.findAll('.stats-value')
      expect(value.at(0).text()).toEqual('2 (40.00%)')
      wrapper.setProps({ countMode: 'frames' })
      expect(value.at(0).text()).toEqual('20 (40.00%)')
    })
  })

  describe('Getters', () => {
    test('selectedData', () => {
      expect(wrapper.vm.selectedData).toEqual(wrapper.vm.data)
      wrapper.setProps({ countMode: 'frames' })
      expect(wrapper.vm.selectedData).toEqual(wrapper.vm.framesData)
    })

    test('total', () => {
      expect(wrapper.vm.total).toEqual(5)
      wrapper.setProps({ countMode: 'frames' })
      expect(wrapper.vm.total).toEqual(50)
    })
  })

  describe('Methods', () => {
    test('percent', () => {
      expect(wrapper.vm.percent(1)).toEqual('20.00')
      wrapper.setProps({ countMode: 'frames' })
      expect(wrapper.vm.percent(1)).toEqual('2.00')
    })
  })
})

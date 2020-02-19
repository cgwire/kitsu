import Vue from 'Vue'
import { mount } from '@vue/test-utils'
import StatsCell from '../../../src/components/cells/StatsCell'

describe('StatsCell', () => {
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
      const name = emptyWrapper.findAll('.stats-name')
      expect(name).toHaveLength(0)
      const value = emptyWrapper.findAll('.stats-value')
      expect(value).toHaveLength(0)
    })

    test('With data', done => {
      const name = wrapper.findAll('.stats-name')
      expect(name.at(0).text()).toEqual('todo')
      expect(name.at(1).text()).toEqual('done')
      const value = wrapper.findAll('.stats-value')
      expect(value.at(0).text()).toEqual('2 (40.00%)')
      wrapper.setProps({ countMode: 'frames' })
      Vue.nextTick(() => {
        expect(value.at(0).text()).toEqual('20 (40.00%)')
        done()
      })
    })
  })

  describe('Getters', () => {
    test('selectedData', done => {
      expect(wrapper.vm.selectedData).toEqual(wrapper.vm.data)
      wrapper.setProps({ countMode: 'frames' })
      Vue.nextTick(() => {
        expect(wrapper.vm.selectedData).toEqual(wrapper.vm.framesData)
        done()
      })
    })

    test('total', done => {
      expect(wrapper.vm.total).toEqual(5)
      wrapper.setProps({ countMode: 'frames' })
      Vue.nextTick(() => {
        expect(wrapper.vm.total).toEqual(50)
        done()
      })
    })
  })

  describe('Methods', () => {
    test('percent', done => {
      expect(wrapper.vm.percent(1)).toEqual('20.00')
      wrapper.setProps({ countMode: 'frames' })
      Vue.nextTick(() => {
        expect(wrapper.vm.percent(1)).toEqual('2.00')
        done()
      })
    })
  })
})

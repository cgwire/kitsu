import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import Spinner from '../../../src/components/widgets/Spinner'

describe('Spinner', () => {
  const wrapper = shallowMount(Spinner, {
    propsData: {
      isWhite: undefined,
      size: undefined
    }
  })

  describe('Mount', () => {
    it('should be default', () => {
      expect(wrapper.element.style.width).toMatch('auto')
      expect(wrapper.element.children[0].src).toMatch(new RegExp('spinner.svg$'))
    })

    it('should be 30px wide', done => {
      wrapper.setProps({ size: 30 })
      Vue.nextTick(() => {
        expect(wrapper.element.style.width).toMatch('30px')
        done()
      })
    })

    it('should be white', done => {
      wrapper.setProps({ isWhite: true })
      Vue.nextTick(() => {
        expect(wrapper.element.children[0].src).toMatch(new RegExp('spinner-white.svg$'))
        done()
      })
    })
  })
})

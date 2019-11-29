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

    it('should be 30px wide', () => {
      wrapper.setProps({ size: 30 })
      expect(wrapper.element.style.width).toMatch('30px')
    })

    it('should be white', () => {
      wrapper.setProps({ isWhite: true })
      expect(wrapper.element.children[0].src).toMatch(new RegExp('spinner-white.svg$'))
    })
  })
})

import { mount } from '@vue/test-utils'
import Spinner from '../../../src/components/widgets/Spinner'

describe('Spinner', () => {
  const wrapper = mount(Spinner, {
    propsData: {
      isWhite: true,
      size: 30
    }
  })
  const defaultWrapper = mount(Spinner, {
    propsData: {
      isWhite: undefined,
      size: undefined
    }
  })

  describe('Mount', () => {
    it('should be default', () => {
      expect(defaultWrapper.element.style.width).toMatch('auto')
      expect(defaultWrapper.element.children[0].src).toMatch(new RegExp('spinner.svg$'))
    })

    it('should be 30px wide', () => {
      expect(wrapper.element.style.width).toMatch('30px')
    })

    it('should be white', () => {
      expect(wrapper.element.children[0].src).toMatch(new RegExp('spinner-white.svg$'))
    })
  })
})

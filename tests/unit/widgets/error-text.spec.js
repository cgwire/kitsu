import { shallowMount } from '@vue/test-utils'
import ErrorText from '../../../src/components/widgets/ErrorText'

describe('ErrorText', () => {
  const wrapper = shallowMount(ErrorText, {
    propsData: {
      text: 'This is an error',
      hidden: true,
      alignRight: true
    }
  })

  describe('Mount', () => {
    it('should display the text "This is an error"', () => {
      expect(wrapper.text()).toMatch('This is an error')
    })

    it('should be hidden', () => {
      expect(wrapper.classes('is-hidden')).toBe(true)
    })

    it('should have right aligned text', () => {
      expect(wrapper.classes('has-text-right')).toBe(true)
    })
  })
})

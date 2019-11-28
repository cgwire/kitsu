import { mount } from '@vue/test-utils'
import PageSubtitle from '../../../src/components/widgets/PageSubtitle'

describe('PageSubtitle', () => {
  const wrapper = mount(PageSubtitle, {
    propsData: {
      text: 'My subtitle'
    }
  })
  const emptyWrapper = mount(PageSubtitle, {
    propsData: {
      text: ''
    }
  })

  describe('Mount', () => {
    it('should be empty', () => {
      expect(emptyWrapper.text()).toBe('')
    })

    it('should display the title "My subtitle"', () => {
      expect(wrapper.text()).toBe('My subtitle')
    })
  })
})

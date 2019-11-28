import { mount } from '@vue/test-utils'
import PageTitle from '../../../src/components/widgets/PageTitle'

describe('PageTitle', () => {
  const wrapper = mount(PageTitle, {
    propsData: {
      text: 'My title'
    }
  })
  const emptyWrapper = mount(PageTitle, {
    propsData: {
      text: ''
    }
  })

  describe('Mount', () => {
    it('should be empty', () => {
      expect(emptyWrapper.text()).toBe('')
    })

    it('should display the title "My title"', () => {
      expect(wrapper.text()).toBe('My title')
    })
  })
})

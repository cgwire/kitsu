import { mount } from '@vue/test-utils'
import PeopleName from '../../../src/components/widgets/PeopleName'

describe('PeopleName', () => {
  const wrapper = mount(PeopleName, {
    propsData: {
      person: {
        first_name: 'John',
        last_name: 'Doe'
      }
    }
  })
  const emptyWrapper = mount(PeopleName, {
    propsData: {
      person: {
        first_name: '',
        last_name: ''
      }
    }
  })

  describe('Mount', () => {
    it('should be empty', () => {
      const name = emptyWrapper.findAll('.person-name')
      expect(name.at(0).text()).toBe('')
    })

    it('should display the name "John Doe"', () => {
      const name = wrapper.findAll('.person-name')
      expect(name.at(0).text()).toBe('John Doe')
    })
  })
})

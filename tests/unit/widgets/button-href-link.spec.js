import i18n from '../../../src/lib/i18n'
import { mount } from '@vue/test-utils'
import ButtonHrefLink from '../../../src/components/widgets/ButtonHrefLink'

describe('ButtonHrefLink', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ButtonHrefLink, {
      propsData: {
        icon: 'download',
        text: 'My Button',
        title: 'My Button title'
      }
    })
  })

  describe('Mount', () => {
    test('Empty props', () => {
      const emptyWrapper = mount(ButtonHrefLink, {
        propsData: {
        }
      })
      const buttons = emptyWrapper.findAll('.button')
      expect(buttons).toHaveLength(1)
    })

    test('Ensure button', () => {
      const buttons = wrapper.findAll('.button')
      expect(buttons).toHaveLength(1)
    })
  })

  describe('Methods', () => {
  })
})

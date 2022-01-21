import i18n from '../../../src/lib/i18n'
import { mount } from '@vue/test-utils'
import ButtonSimple from '../../../src/components/widgets/ButtonSimple'

describe('ButtonSimple', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ButtonSimple, {
      propsData: {
        icon: 'download',
        text: 'My Button',
        title: 'My Button title'
      }
    })
  })

  describe('Mount', () => {
    test('Empty props', () => {
      const emptyWrapper = mount(ButtonSimple, {
        propsData: {
        }
      })
      const buttons = emptyWrapper.findAll('.button')
      expect(buttons).toHaveLength(1)
    })

    test('Ensure button', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(1)
    })
  })

  describe('Methods', () => {
    test('iconClass', () => {
      let buttons = wrapper.findAll('.only-icon')
      expect(buttons).toHaveLength(0)
      const newWrapper = mount(ButtonSimple, {
        propsData: {
          icon: 'download',
          text: '',
          title: 'My Button title'
        }
      })
      buttons = newWrapper.findAll('.only-icon')
      expect(buttons).toHaveLength(1)
    })
  })
})

import i18n from '../../../src/lib/i18n'
import { mount, createLocalVue } from '@vue/test-utils'
import Combobox from '../../../src/components/widgets/Combobox'

const localVue = createLocalVue()

// Allow access to i18n object from vue instance.
localVue.prototype.$locale = {
  change (locale) {
    i18n.locale = locale
  },
  current () {
    return i18n.locale
  }
}

describe('Combobox', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Combobox, {
      propsData: {
        localeKeyPrefix: 'main.',
        options: [
          {
            label: 'yes',
            value: 'val1'
          },
          {
            label: 'no',
            value: 'val2'
          }
        ],
        value: 'val2'
      },
      localVue,
      i18n
    })
  })

  describe('Mount', () => {
    test('Empty list', () => {
      const emptyWrapper = mount(Combobox, {
        propsData: {
          options: [],
          value: ''
        }
      })
      let lines = emptyWrapper.findAll('option')
      expect(lines.length).toEqual(0)
    })

    test('Ensure list', () => {
      let lines = wrapper.findAll('option')
      expect(lines.length).toEqual(2)
    })
  })

  describe('Methods', () => {
    test('updateValue', () => {
      wrapper.vm.updateValue()
      expect(wrapper.emitted().input).toBeTruthy()
    })
    test('emitEnter', () => {
      wrapper.vm.emitEnter()
      expect(wrapper.emitted().enter).toBeTruthy()
    })
    test('getOptionLabel', () => {
      const label = wrapper.vm.getOptionLabel({
        label: 'yes',
        value: 'val1'
      })
      expect(label).toEqual('Yes')
    })
  })
})

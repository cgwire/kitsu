import i18n from '../../../src/lib/i18n'
import { mount, createLocalVue } from '@vue/test-utils'
import TableHeaderMenu from '../../../src/components/widgets/TableHeaderMenu'

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

describe('TableHeaderMenu', () => {
  const wrapper = mount(TableHeaderMenu, {
    propsData: {
      isMinimized: true,
      isCurrentUserAdmin: true
    },
    localVue,
    i18n
  })

  describe('Mount', () => {
    it('should be minimized', () => {
      const content = wrapper.findAll('div > div').at(0)
      expect(content.text()).toMatch('Maximize')
    })

    it('should be maximized', () => {
      const wrapper = mount(TableHeaderMenu, {
        propsData: {
          isMinimized: false
        },
        localVue,
        i18n
      })
      const content = wrapper.findAll('div > div').at(0)
      expect(content.text()).toMatch('Minimize')
    })

    test('UI should be displayed as Admin', () => {
      const admin = wrapper.find('.error')
      expect(admin.exists()).toBe(true)
    })
  })
})

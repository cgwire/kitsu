import i18n from '../../../src/lib/i18n'
import { mount, createLocalVue } from '@vue/test-utils'
import TableInfo from '../../../src/components/widgets/TableInfo'
import Spinner from '../../../src/components/widgets/Spinner'

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

describe('TableInfo', () => {
  const wrapperLoading = mount(TableInfo, {
    propsData: {
      isLoading: true,
      isError: false
    },
    localVue,
    i18n
  })
  const wrapperError = mount(TableInfo, {
    propsData: {
      isLoading: false,
      isError: true
    },
    localVue,
    i18n
  })
  const defaultWrapper = mount(TableInfo, {
    propsData: {
      isLoading: undefined,
      isError: undefined
    },
    localVue,
    i18n
  })

  describe('Mount', () => {
    it('should be empty', () => {
      expect(defaultWrapper.element.children).toHaveLength(0)
    })

    it('should display a spinner', () => {
      expect(wrapperLoading.contains(Spinner)).toBe(true)
    })

    it('should display an error', () => {
      const name = wrapperError.findAll('.table-info')
      expect(name.at(0).text()).toEqual('An error occured while loading data.')
    })
  })
})

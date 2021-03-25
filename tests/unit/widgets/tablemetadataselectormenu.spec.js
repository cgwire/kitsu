import i18n from '../../../src/lib/i18n'
import { mount, createLocalVue } from '@vue/test-utils'
import TableMetadataSelectorMenu from '../../../src/components/widgets/TableMetadataSelectorMenu'

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

describe('TableMetadataSelectorMenu', () => {
  describe('Mount', () => {
    it('emits the preferences saved in localStorage', () => {
      localStorage.setItem('metadataDisplayHeaders:shots', JSON.stringify({ key: true }))
      const component = mount(TableMetadataSelectorMenu, {
        propsData: {
          metadataDisplayHeaders: {},
          descriptors: [],
          namespace: 'shots'
        },
        localVue,
        i18n
      })
      const emitted = component.emitted()['update:metadataDisplayHeaders']
      expect(emitted).toHaveLength(1)
      expect(emitted[0]).toEqual([{ key: true }])
    })
    it('emits changes the preferences in localStorage', () => {
      localStorage.setItem('metadataDisplayHeaders:shots', JSON.stringify({ key: true }))
      const component = mount(TableMetadataSelectorMenu, {
        propsData: {
          metadataDisplayHeaders: { key: true },
          descriptors: [],
          namespace: 'shots'
        },
        localVue,
        i18n
      })
      component.vm.setMetadataDisplayValue('newKey', true)
      const emitted = component.emitted()['update:metadataDisplayHeaders']
      expect(emitted).toHaveLength(2)
      expect(emitted[1]).toEqual([{ key: true, newKey: true }])
      const stored = JSON.parse(localStorage.getItem('metadataDisplayHeaders:shots'))
      expect(stored).toEqual({ key: true, newKey: true })
    })
  })
})

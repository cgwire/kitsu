import i18n from '../../../../src/lib/i18n'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import AssetBlock from '../../../../src/components/pages/breakdown/AssetBlock'
import VueLazyLoad from 'vue-lazyload'

const localVue = createLocalVue()
localVue.use(VueLazyLoad)

localVue.prototype.$locale = {
  change (locale) {
    i18n.locale = locale
  },
  current () {
    return i18n.locale
  }
}

describe('AssetBlock', () => {
  const wrapper = shallowMount(AssetBlock, {
    propsData: {
      asset: {
        preview_file_id: 1337,
        label: 'fixed'
      },
      nbOccurences: 2,
      active: true
    },
    localVue,
    i18n
  })

  describe('Mount', () => {
    it('should be mounted', () => {
      const block = wrapper.findAll('.asset')
      expect(block).toHaveLength(1)
    })
    it('should display how many props there is', () => {
      const nb = wrapper.findAll('.nb-occurences')
      expect(nb.at(0).text()).toMatch('2')
    })
    it('should display a picture of the asset', () => {
      const picture = wrapper.findAll('.asset-picture > img')
      expect(picture.exists()).toBe(true)
    })
    it('should display the label of the asset', () => {
      const label = wrapper.findAll('.asset-label')
      expect(label.at(0).text()).toMatch('fixed')
    })
  })
})

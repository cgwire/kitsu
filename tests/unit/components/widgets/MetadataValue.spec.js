import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import MetadataValue from '@/components/widgets/MetadataValue.vue'

const descriptor = {
  id: 'descriptor-1',
  field_name: 'reference',
  data_type: 'url'
}

const mountValue = reference =>
  mount(MetadataValue, {
    props: { descriptor, entity: { id: 'asset-1', data: { reference } } },
    global: {
      plugins: [
        createStore({ getters: { personMap: () => new Map() } }),
        createI18n({ legacy: false, locale: 'en' })
      ]
    }
  })

describe('widgets/MetadataValue', () => {
  describe('url', () => {
    test('links the url in a new tab', () => {
      const link = mountValue('https://example.com/ref').find('a')
      expect(link.attributes()).toMatchObject({
        href: 'https://example.com/ref',
        target: '_blank',
        rel: 'noopener noreferrer'
      })
    })

    test('shows an unsafe scheme as text', () => {
      const wrapper = mountValue('javascript:alert(1)')
      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.text()).toBe('javascript:alert(1)')
    })
  })
})

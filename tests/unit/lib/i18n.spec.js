import { config, mount } from '@vue/test-utils'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'

import i18n from '@/lib/i18n'

// Mount with the app's real i18n: the global $t mock would mask it.
const mountWithI18n = component => {
  const globalT = config.global.mocks.$t
  delete config.global.mocks.$t
  try {
    return mount(component, { global: { plugins: [i18n] } })
  } finally {
    config.global.mocks.$t = globalT
  }
}

describe('lib/i18n', () => {
  test('t() from useI18n resolves at setup top level', () => {
    const wrapper = mountWithI18n({
      setup() {
        const { t } = useI18n()
        const label = t('main.unknown')
        return () => h('p', label)
      }
    })
    expect(wrapper.text()).toBe('Unknown')
  })

  test('$t stays available in templates', () => {
    const wrapper = mountWithI18n({ template: "<p>{{ $t('main.unknown') }}</p>" })
    expect(wrapper.text()).toBe('Unknown')
  })
})

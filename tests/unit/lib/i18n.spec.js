import { config, mount } from '@vue/test-utils'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'

import i18n, { loadLocaleMessages } from '@/lib/i18n'

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

  // vue-i18n 11 makes any decimal count plural, whatever the language: half a
  // day spent read "jours passés".
  describe('plurals', () => {
    afterEach(() => {
      i18n.global.locale.value = 'en'
    })

    test.each([
      [0, 'days spent'],
      [0.5, 'days spent'],
      [1, 'day spent'],
      [1.5, 'days spent'],
      [2, 'days spent']
    ])('reads a count of %s in English', (count, expected) => {
      expect(i18n.global.t('main.days_spent', { count })).toBe(expected)
    })

    test.each([
      [0, 'jours passés'],
      [0.5, 'jour passé'],
      [1, 'jour passé'],
      [1.5, 'jour passé'],
      [2, 'jours passés']
    ])(
      'reads a count of %s in French, a locale loaded later',
      async (count, expected) => {
        await loadLocaleMessages('fr')
        i18n.global.locale.value = 'fr'

        expect(i18n.global.t('main.days_spent', { count })).toBe(expected)
      }
    )

    test('reads a decimal count in English for an NFT production', () => {
      expect(
        i18n.global.t('shots.number', { count: 0.5 }, { locale: 'en_nft' })
      ).toBe('NFTs')
    })
  })
})

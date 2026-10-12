import { shallowMount } from '@vue/test-utils'
import { toValue } from 'vue'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import { useHead } from '@unhead/vue'

import i18n, { loadLocaleMessages } from '@/lib/i18n'

import Login2FA from '@/components/pages/Login2FA.vue'

const mountPage = () => {
  const store = createStore({
    getters: {
      isDarkTheme: () => false,
      user: () => ({ id: 'user-1', totp_enabled: false })
    }
  })
  return shallowMount(Login2FA, { global: { plugins: [i18n, store] } })
}

describe('pages/Login2FA', () => {
  afterEach(() => {
    i18n.global.locale.value = 'en'
  })

  test('titles the tab in the current language', async () => {
    mountPage()
    const { title } = useHead.mock.lastCall[0]
    expect(toValue(title)).toBe('Two-Factor Authentication - Kitsu')

    await loadLocaleMessages('fr')
    i18n.global.locale.value = 'fr'

    expect(toValue(title)).toBe('Authentification double facteur - Kitsu')
  })
})

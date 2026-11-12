import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import FirstConnection from '@/components/pages/FirstConnection.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

describe('pages/FirstConnection', () => {
  // No password is saved yet: the browser offers the address it knows.
  it('marks the email field as an email address', () => {
    const store = createStore({
      state: { login: { email: '' } },
      getters: { isDarkTheme: () => false }
    })
    const wrapper = shallowMount(FirstConnection, {
      global: { plugins: [i18n, store], stubs: { RouterLink: true } }
    })

    expect(wrapper.find('input[type="email"]').attributes('autocomplete')).toBe(
      'email'
    )
  })
})

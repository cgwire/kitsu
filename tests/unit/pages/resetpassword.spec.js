import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import ResetPassword from '@/components/pages/ResetPassword.vue'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

describe('pages/ResetPassword', () => {
  // The browser offers the email saved with the password of the account.
  it('marks the email field as the account username', () => {
    const wrapper = shallowMount(ResetPassword, {
      global: {
        plugins: [i18n, createStore({ state: { login: { email: '' } } })],
        stubs: { RouterLink: true }
      }
    })

    expect(wrapper.find('input[type="email"]').attributes('autocomplete')).toBe(
      'username'
    )
  })
})

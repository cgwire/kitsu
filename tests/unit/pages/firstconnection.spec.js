import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import FirstConnection from '@/components/pages/FirstConnection.vue'

import { pressEnter } from '../fixtures/keyboard'

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

  describe('sending', () => {
    let resetPassword
    let wrapper

    const mountPage = email => {
      resetPassword = vi.fn()
      const store = createStore({
        state: { login: { email } },
        getters: { isDarkTheme: () => false },
        actions: { resetPassword }
      })
      // Only an element of the document takes the focus.
      wrapper = shallowMount(FirstConnection, {
        attachTo: document.body,
        global: { plugins: [i18n, store], stubs: { RouterLink: true } }
      })
    }

    afterEach(() => {
      wrapper.unmount()
    })

    it('focuses the empty email field instead of sending the request', async () => {
      mountPage('')
      const button = wrapper.find('.main-button')
      // A click gives the focus to the button before its handler runs.
      button.element.focus()

      await button.trigger('click')

      expect(resetPassword).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(
        wrapper.find('input[type="email"]').element
      )
    })

    it('sends the request for the email filled in', async () => {
      mountPage('jane@example.com')

      await wrapper.find('.main-button').trigger('click')

      expect(resetPassword).toHaveBeenCalledWith(
        expect.anything(),
        'jane@example.com'
      )
    })

    it('sends the request on Enter in the email field', async () => {
      mountPage('jane@example.com')

      await pressEnter(wrapper.find('input[type="email"]'))

      expect(resetPassword).toHaveBeenCalledWith(
        expect.anything(),
        'jane@example.com'
      )
    })

    // The Enter that opened the page from a link ends on its field.
    it('sends nothing on the release of an Enter pressed before', async () => {
      mountPage('jane@example.com')

      await wrapper.find('input[type="email"]').trigger('keyup.enter')

      expect(resetPassword).not.toHaveBeenCalled()
    })

    it('ignores the Enter that confirms an IME composition', async () => {
      mountPage('jane@example.com')

      await pressEnter(wrapper.find('input[type="email"]'), { isComposing: true })

      expect(resetPassword).not.toHaveBeenCalled()
    })
  })
})

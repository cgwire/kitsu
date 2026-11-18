import { shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import ResetPassword from '@/components/pages/ResetPassword.vue'

import { pressEnter, pressSpace } from '../fixtures/keyboard'

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

  describe('sending', () => {
    let resetPassword
    let wrapper

    const mountPage = (email, answer) => {
      resetPassword = vi.fn(answer)
      const store = createStore({
        state: { login: { email } },
        actions: { resetPassword }
      })
      // Only an element of the document takes the focus.
      wrapper = shallowMount(ResetPassword, {
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

    // The Enter that opened the page from the login page ends on its field.
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

    // Each request sends an email.
    it.each([
      ['Enter', pressEnter],
      ['Space', pressSpace]
    ])('sends the request once while %s is held on the button', async (key, press) => {
      mountPage('jane@example.com', () => new Promise(() => {}))
      const button = wrapper.find('.main-button')

      await press(button)
      expect(resetPassword).toHaveBeenCalledTimes(1)
      await press(button, { repeat: true })

      expect(resetPassword).toHaveBeenCalledTimes(1)
    })
  })
})

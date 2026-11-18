import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

import i18n from '@/lib/i18n'

import Login from '@/components/pages/Login.vue'

import { pressEnter } from '../fixtures/keyboard'

const mountPage = (email, logIn = vi.fn(), password = '') => {
  const store = createStore({
    state: { login: { email, password } },
    getters: {
      isAuthenticated: () => false,
      isDarkTheme: () => false,
      isLoginError: () => false,
      isLoginLoading: () => false,
      mainConfig: () => ({})
    },
    actions: { logIn }
  })
  // Only an element of the document takes the focus.
  return shallowMount(Login, {
    attachTo: document.body,
    global: { plugins: [i18n, store], stubs: { RouterLink: true } }
  })
}

describe('pages/Login', () => {
  let wrapper

  afterEach(() => {
    wrapper.unmount()
    vi.useRealTimers()
  })

  test('starts on the email field', () => {
    wrapper = mountPage('')

    expect(document.activeElement).toBe(
      wrapper.find('input[type="email"]').element
    )
  })

  test('starts on the password field when the email is filled in', () => {
    wrapper = mountPage('jane@example.com')

    expect(document.activeElement).toBe(
      wrapper.find('input[type="password"]').element
    )
  })

  test('focuses the empty email field instead of logging in', async () => {
    const logIn = vi.fn()
    wrapper = mountPage('', logIn)
    const button = wrapper.find('.main-button')
    // A click gives the focus to the button before its handler runs.
    button.element.focus()

    await button.trigger('click')

    expect(logIn).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(
      wrapper.find('input[type="email"]').element
    )
  })

  // A Zou set up without passwords logs people in with an empty one.
  test('logs in from the button with the password left empty', async () => {
    // A login that goes through opens the next page after a fade.
    vi.useFakeTimers()
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn)

    await wrapper.find('.main-button').trigger('click')

    expect(logIn).toHaveBeenCalledTimes(1)
  })

  test('moves on to the empty password field on Enter in the email field', async () => {
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn)
    const emailField = wrapper.find('input[type="email"]')
    emailField.element.focus()

    await pressEnter(emailField)

    expect(logIn).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(
      wrapper.find('input[type="password"]').element
    )
  })

  test('logs in on Enter in the email field with the password filled in', async () => {
    vi.useFakeTimers()
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn, 'secret')

    await pressEnter(wrapper.find('input[type="email"]'))

    expect(logIn).toHaveBeenCalledTimes(1)
  })

  test('stays on the empty email field on Enter', async () => {
    const logIn = vi.fn()
    wrapper = mountPage('', logIn)
    const emailField = wrapper.find('input[type="email"]')

    await pressEnter(emailField)

    expect(logIn).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(emailField.element)
  })

  test('logs in on Enter in the password field', async () => {
    vi.useFakeTimers()
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn, 'secret')

    await pressEnter(wrapper.find('input[type="password"]'))

    expect(logIn).toHaveBeenCalledTimes(1)
  })

  // The Enter that opened the page from a link ends on its focused field.
  test('sends nothing on the release of an Enter pressed before', async () => {
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn, 'secret')

    await wrapper.find('input[type="email"]').trigger('keyup.enter')
    await wrapper.find('input[type="password"]').trigger('keyup.enter')

    expect(logIn).not.toHaveBeenCalled()
  })

  test('ignores the Enter that confirms an IME composition', async () => {
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn, 'secret')

    await pressEnter(wrapper.find('input[type="email"]'), { isComposing: true })
    await pressEnter(wrapper.find('input[type="password"]'), { isComposing: true })

    expect(logIn).not.toHaveBeenCalled()
  })

  // Held down, the Enter that moved on repeats in the password field.
  test('keeps a held Enter from logging in without a password', async () => {
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn)
    const emailField = wrapper.find('input[type="email"]')
    emailField.element.focus()

    await pressEnter(emailField)
    await pressEnter(wrapper.find('input[type="password"]'), { repeat: true })

    expect(logIn).not.toHaveBeenCalled()
  })
})

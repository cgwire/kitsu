import { flushPromises, shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

import i18n from '@/lib/i18n'

import Login from '@/components/pages/Login.vue'
import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

import { pressEnter, pressSpace } from '../fixtures/keyboard'

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

  // Five failed logins in a row lock the account for a minute.
  test.each([
    ['Enter', pressEnter],
    ['Space', pressSpace]
  ])('logs in once while %s is held on the button', async (key, press) => {
    const logIn = vi.fn(() => new Promise(() => {}))
    wrapper = mountPage('jane@example.com', logIn, 'secret')
    const button = wrapper.find('.main-button')

    await press(button)
    expect(logIn).toHaveBeenCalledTimes(1)
    await press(button, { repeat: true })

    expect(logIn).toHaveBeenCalledTimes(1)
  })

  // Each check of a code mounted the step again: a method chosen went back to
  // the preferred one, and an email account was sent a new code.
  describe('two-factor step', () => {
    const missingOTP = {
      missing_OTP: true,
      preferred_two_factor_authentication: 'totp',
      two_factor_authentication_enabled: ['totp', 'recovery_code']
    }

    const openStep = async logIn => {
      wrapper = mountPage('jane@example.com', logIn, 'secret')
      await wrapper.find('.main-button').trigger('click')
      await flushPromises()
      return wrapper.findComponent(TwoFactorAuthentication)
    }

    const sendCode = async (step, payload) => {
      step.vm.$emit('validate', payload)
      await flushPromises()
    }

    const findStep = () => wrapper.findComponent(TwoFactorAuthentication)

    test('stays while its code is checked', async () => {
      const logIn = vi
        .fn()
        .mockRejectedValueOnce(missingOTP)
        .mockReturnValueOnce(new Promise(() => {}))
      const step = await openStep(logIn)

      await sendCode(step, { totp: '123456' })

      expect(findStep().exists()).toBe(true)
      expect(findStep().element).toBe(step.element)
      expect(wrapper.find('form').exists()).toBe(false)
    })

    test('stays after a refused code', async () => {
      const logIn = vi
        .fn()
        .mockRejectedValueOnce(missingOTP)
        .mockRejectedValueOnce({ wrong_OTP: true })
      const step = await openStep(logIn)

      await sendCode(step, { recovery_code: 'K7PZ2QW9AB' })

      expect(findStep().element).toBe(step.element)
      expect(findStep().props('isWrongOtp')).toBe(true)
    })

    test('stays when another method is chosen after a refused code', async () => {
      const logIn = vi
        .fn()
        .mockRejectedValueOnce(missingOTP)
        .mockRejectedValueOnce({ wrong_OTP: true })
      const step = await openStep(logIn)
      await sendCode(step, { totp: '000000' })

      step.vm.$emit('changed-two-fa', 'recovery_code')
      await flushPromises()

      expect(findStep().element).toBe(step.element)
      expect(findStep().props('isWrongOtp')).toBe(false)
      expect(wrapper.find('form').exists()).toBe(false)
    })

    // Zou checks the password before the code: a password changed meanwhile
    // is refused without a word about the code.
    test('goes back to the password when Zou refuses it', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logIn = vi
        .fn()
        .mockRejectedValueOnce(missingOTP)
        .mockRejectedValueOnce({ message: 'Bad credentials' })
      const step = await openStep(logIn)

      await sendCode(step, { totp: '123456' })

      expect(findStep().exists()).toBe(false)
      expect(wrapper.find('form').exists()).toBe(true)
      expect(error).toHaveBeenCalledWith({ message: 'Bad credentials' })
      error.mockRestore()
    })

    test.each([
      ['too_many_failed_login_attemps', 'login.too_many_failed_login_attemps'],
      ['unactive', 'login.login_inactive'],
      ['server_error', 'login.login_server_failed']
    ])('stays with the error of the page after %s', async (flag, key) => {
      const logIn = vi
        .fn()
        .mockRejectedValueOnce(missingOTP)
        .mockRejectedValueOnce({ [flag]: true })
      const step = await openStep(logIn)

      await sendCode(step, { totp: '123456' })

      expect(findStep().element).toBe(step.element)
      expect(wrapper.text()).toContain(key)
    })

    // Disabled meanwhile, the method of the code sent says nothing more: the
    // step starts again on the method that Zou now names.
    test('starts again when Zou asks for another method', async () => {
      const logIn = vi
        .fn()
        .mockRejectedValueOnce(missingOTP)
        .mockRejectedValueOnce({
          ...missingOTP,
          preferred_two_factor_authentication: 'email_otp',
          two_factor_authentication_enabled: ['email_otp', 'recovery_code']
        })
      const step = await openStep(logIn)

      await sendCode(step, { totp: '123456' })

      expect(findStep().element).not.toBe(step.element)
      expect(findStep().props('preferredTwoFa')).toBe('email_otp')
    })
  })
})

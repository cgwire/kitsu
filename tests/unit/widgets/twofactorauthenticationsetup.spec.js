import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'
import TwoFactorAuthenticationSetup from '@/components/widgets/TwoFactorAuthenticationSetup.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const mountSetup = (user, actions = {}) => {
  const store = createStore({
    getters: {
      user: () => ({
        email: 'ada@example.com',
        preferred_two_factor_authentication: null,
        ...user
      })
    },
    actions: {
      preEnableTOTP: () => ({
        totp_provisionning_uri: 'otpauth://totp/Kitsu:ada?secret=ABC',
        otp_secret: 'ABC'
      }),
      ...actions
    }
  })
  return mount(TwoFactorAuthenticationSetup, {
    global: {
      plugins: [store, i18n],
      stubs: { QrcodeVue: true, TextField: true, TwoFactorAuthentication: true }
    }
  })
}

const label = key => `profile.two_factor_authentication.${key}`

const findButton = (wrapper, text) =>
  wrapper.findAll('button').find(button => button.text() === text)

// The method buttons and the recovery codes one, not those of an open flow.
const actionStates = wrapper =>
  wrapper
    .findAll('.two-fa-card-actions button, .two-fa-button')
    .map(button => [button.text(), button.element.disabled])

// The grayed look only stopped the mouse: Tab and Enter started a second
// action in the middle of the first one.
describe('widgets/TwoFactorAuthenticationSetup', () => {
  it.each([
    {
      name: 'a TOTP setup',
      user: {},
      open: 'totp.button_enable',
      others: ['email_otp.button_enable', 'fido.button_register']
    },
    {
      name: 'a FIDO registration',
      user: {},
      open: 'fido.button_register',
      others: ['totp.button_enable', 'email_otp.button_enable']
    },
    {
      name: 'a TOTP removal',
      user: {
        totp_enabled: true,
        preferred_two_factor_authentication: 'totp'
      },
      open: 'totp.button_disable',
      others: [
        'email_otp.button_enable',
        'fido.button_register',
        'recovery_codes.button_new'
      ]
    },
    {
      name: 'a FIDO registration next to the OTPs',
      user: {
        totp_enabled: true,
        email_otp_enabled: true,
        preferred_two_factor_authentication: 'totp'
      },
      open: 'fido.button_register',
      others: [
        'totp.button_disable',
        'email_otp.button_disable',
        'recovery_codes.button_new'
      ]
    }
  ])('disables the other actions during $name', async ({ user, open, others }) => {
    const wrapper = mountSetup(user)

    await findButton(wrapper, label(open)).trigger('click')
    await flushPromises()

    expect(actionStates(wrapper)).toEqual(others.map(key => [label(key), true]))
  })

  it('enables them again once the setup is canceled', async () => {
    const wrapper = mountSetup({})
    await findButton(wrapper, label('totp.button_enable')).trigger('click')
    await flushPromises()

    await findButton(wrapper, 'main.cancel').trigger('click')

    expect(actionStates(wrapper)).toEqual([
      [label('totp.button_enable'), false],
      [label('email_otp.button_enable'), false],
      [label('fido.button_register'), false]
    ])
  })

  // The release of Enter on Enable TOTP lands in the code field when the
  // server answers before it.
  it('checks no empty setup code', async () => {
    const enableTOTP = vi.fn()
    const wrapper = mountSetup({}, { enableTOTP })
    await findButton(wrapper, label('totp.button_enable')).trigger('click')
    await flushPromises()

    await wrapper.find('.otp-input').trigger('keyup', { key: 'Enter' })

    expect(enableTOTP).not.toHaveBeenCalled()
  })

  describe('while a request runs', () => {
    // Spinners only stop the mouse: Enter in a field, or on a focused
    // button, reached the handlers again.
    const pending = () => new Promise(() => {})

    it.each([
      {
        name: 'the TOTP code',
        open: 'totp.button_enable',
        action: 'enableTOTP',
        value: '123456'
      },
      {
        name: 'the email code',
        open: 'email_otp.button_enable',
        action: 'enableEmailOTP',
        value: '123456'
      },
      {
        name: 'the FIDO device',
        open: 'fido.button_register',
        action: 'preRegisterFIDO',
        value: 'Yubikey'
      }
    ])('sends $name once', async ({ open, action, value }) => {
      const request = vi.fn(pending)
      const wrapper = mountSetup(
        {},
        { preEnableEmailOTP: () => {}, [action]: request }
      )
      await findButton(wrapper, label(open)).trigger('click')
      await flushPromises()
      const field = wrapper.find('.otp-input')
      await field.setValue(value)

      await field.trigger('keyup', { key: 'Enter' })
      await field.trigger('keyup', { key: 'Enter' })

      expect(request).toHaveBeenCalledTimes(1)
    })

    it.each([
      { name: 'TOTP', open: 'totp.button_enable', action: 'preEnableTOTP' },
      {
        name: 'OTP via email',
        open: 'email_otp.button_enable',
        action: 'preEnableEmailOTP'
      }
    ])('starts the $name setup once', async ({ open, action }) => {
      const request = vi.fn(pending)
      const wrapper = mountSetup({}, { [action]: request })
      const button = findButton(wrapper, label(open))

      await button.trigger('click')
      await button.trigger('click')

      expect(request).toHaveBeenCalledTimes(1)
    })
  })

  // Zou asks for a factor already enabled before it adds a method.
  describe('with a method already enabled', () => {
    const twoFactorPayload = { recovery_code: 'abcd' }
    const findCodeCheck = wrapper =>
      wrapper.findComponent(TwoFactorAuthentication)

    const fillSetup = async (wrapper, open, value) => {
      await findButton(wrapper, label(open)).trigger('click')
      await flushPromises()
      const field = wrapper.find('.otp-input')
      await field.setValue(value)
      await field.trigger('keyup', { key: 'Enter' })
    }

    afterEach(() => vi.unstubAllGlobals())

    it.each([
      {
        name: 'TOTP',
        user: { email_otp_enabled: true },
        open: 'totp.button_enable',
        action: 'enableTOTP',
        sent: { totp: '123456' }
      },
      {
        name: 'OTP via email',
        user: { totp_enabled: true },
        open: 'email_otp.button_enable',
        action: 'enableEmailOTP',
        sent: { otp: '123456' }
      }
    ])('asks for its code before it enables $name', async scenario => {
      const { user, open, action, sent } = scenario
      const enable = vi.fn()
      const wrapper = mountSetup(user, {
        preEnableEmailOTP: () => {},
        [action]: enable
      })

      await fillSetup(wrapper, open, '123456')

      expect(enable).not.toHaveBeenCalled()
      expect(findCodeCheck(wrapper).props('textValidateButton')).toBe(
        label(open.replace('button_enable', 'button_validate'))
      )

      findCodeCheck(wrapper).vm.$emit('validate', twoFactorPayload)
      await flushPromises()

      expect(enable.mock.calls[0][1]).toEqual({ ...sent, twoFactorPayload })
      expect(findCodeCheck(wrapper).exists()).toBe(false)
    })

    it('asks for its code before it registers a FIDO device', async () => {
      vi.stubGlobal('navigator', {
        credentials: { create: () => Promise.resolve('credential') }
      })
      const preRegisterFIDO = vi.fn(() => 'publicKey')
      const registerFIDO = vi.fn()
      const wrapper = mountSetup(
        { totp_enabled: true },
        { preRegisterFIDO, registerFIDO }
      )

      await fillSetup(wrapper, 'fido.button_register', 'Yubikey')

      expect(preRegisterFIDO).not.toHaveBeenCalled()

      findCodeCheck(wrapper).vm.$emit('validate', twoFactorPayload)
      await flushPromises()

      expect(registerFIDO.mock.calls[0][1]).toEqual({
        registrationResponse: 'credential',
        deviceName: 'Yubikey',
        twoFactorPayload
      })
      expect(findCodeCheck(wrapper).exists()).toBe(false)
    })

    // Zou tells which of the two codes it refused: only that one is wrong.
    it.each([
      { name: 'new code', flag: 'wrong_OTP', isNewCodeWrong: true },
      { name: 'enabled factor', flag: 'wrong_existing_OTP' }
    ])('keeps the setup open when the $name is refused', async scenario => {
      const { flag, isNewCodeWrong = false } = scenario
      const enableTOTP = vi.fn(() => Promise.reject({ body: { [flag]: true } }))
      const wrapper = mountSetup({ email_otp_enabled: true }, { enableTOTP })
      await fillSetup(wrapper, 'totp.button_enable', '123456')

      findCodeCheck(wrapper).vm.$emit('validate', twoFactorPayload)
      await flushPromises()

      expect(wrapper.find('.two-fa-flow > .show-message-2fa').exists()).toBe(
        isNewCodeWrong
      )
      expect(findCodeCheck(wrapper).props('isWrongOtp')).toBe(!isNewCodeWrong)
      expect(wrapper.find('.otp-input').element.value).toBe('123456')
    })

    it('keeps a FIDO registration open when the factor is refused', async () => {
      vi.stubGlobal('navigator', {
        credentials: { create: () => Promise.resolve('credential') }
      })
      const registerFIDO = vi.fn(() =>
        Promise.reject({ body: { wrong_existing_OTP: true } })
      )
      const wrapper = mountSetup(
        { totp_enabled: true },
        { preRegisterFIDO: () => 'publicKey', registerFIDO }
      )
      await fillSetup(wrapper, 'fido.button_register', 'Yubikey')

      findCodeCheck(wrapper).vm.$emit('validate', twoFactorPayload)
      await flushPromises()

      expect(findCodeCheck(wrapper).props('isWrongOtp')).toBe(true)
      expect(wrapper.find('.otp-input').element.value).toBe('Yubikey')
    })

    // The setup that loads opens next to the removal: the code typed for
    // the removal must not enable the method being set up.
    it('removes a method while the setup of another one loads', async () => {
      let openSetup = null
      const preEnableTOTP = () =>
        new Promise(resolve => {
          openSetup = resolve
        })
      const enableTOTP = vi.fn()
      const disableEmailOTP = vi.fn()
      const wrapper = mountSetup(
        { email_otp_enabled: true },
        { preEnableTOTP, enableTOTP, disableEmailOTP }
      )
      await findButton(wrapper, label('totp.button_enable')).trigger('click')
      await findButton(wrapper, label('email_otp.button_disable')).trigger(
        'click'
      )
      openSetup({ totp_provisionning_uri: 'otpauth://x', otp_secret: 'ABC' })
      await flushPromises()

      findCodeCheck(wrapper).vm.$emit('validate', twoFactorPayload)
      await flushPromises()

      expect(enableTOTP).not.toHaveBeenCalled()
      expect(disableEmailOTP.mock.calls[0][1]).toEqual(twoFactorPayload)
    })
  })

  // Zou checks a 2FA code before it removes a key.
  describe('FIDO key removal', () => {
    const user = {
      fido_enabled: true,
      fido_devices: ['Yubikey', 'Phone'],
      totp_enabled: true,
      preferred_two_factor_authentication: 'totp'
    }

    const findTrash = (wrapper, device) =>
      wrapper
        .findAll('ul li')
        .find(item => item.text() === device)
        .find('.action-icon')

    const findCodeCheck = wrapper => wrapper.findComponent(TwoFactorAuthentication)

    it('removes a key with the 2FA code typed for it', async () => {
      const unregisterFIDO = vi.fn()
      const wrapper = mountSetup(user, { unregisterFIDO })

      await findTrash(wrapper, 'Yubikey').trigger('click')
      await findTrash(wrapper, 'Yubikey').trigger('click')

      expect(unregisterFIDO).not.toHaveBeenCalled()
      expect(findCodeCheck(wrapper).props('textValidateButton')).toBe(
        label('fido.button_unregister')
      )

      findCodeCheck(wrapper).vm.$emit('validate', { totp: '123456' })
      await flushPromises()

      expect(unregisterFIDO).toHaveBeenCalledTimes(1)
      expect(unregisterFIDO.mock.calls[0][1]).toEqual({
        deviceName: 'Yubikey',
        twoFactorPayload: { totp: '123456' }
      })
      expect(findCodeCheck(wrapper).exists()).toBe(false)
    })

    it('disables the other actions while the code is asked', async () => {
      const unregisterFIDO = vi.fn()
      const wrapper = mountSetup(user, { unregisterFIDO })

      await findTrash(wrapper, 'Yubikey').trigger('click')
      await findTrash(wrapper, 'Phone').trigger('click')

      expect(actionStates(wrapper)).toEqual([
        [label('totp.button_disable'), true],
        [label('email_otp.button_enable'), true],
        [label('fido.button_register'), true],
        [label('recovery_codes.button_new'), true]
      ])
      const phone = findTrash(wrapper, 'Phone')
      expect(phone.attributes('aria-disabled')).toBe('true')
      expect(phone.attributes('tabindex')).toBe('-1')

      findCodeCheck(wrapper).vm.$emit('validate', { totp: '123456' })
      await flushPromises()

      expect(unregisterFIDO.mock.calls[0][1].deviceName).toBe('Yubikey')
    })

    it('keeps the key when the removal is canceled', async () => {
      const unregisterFIDO = vi.fn()
      const wrapper = mountSetup(user, { unregisterFIDO })
      await findTrash(wrapper, 'Yubikey').trigger('click')

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await flushPromises()

      expect(findCodeCheck(wrapper).exists()).toBe(false)
      expect(findTrash(wrapper, 'Yubikey').attributes('tabindex')).toBe('0')
      expect(unregisterFIDO).not.toHaveBeenCalled()
    })
  })
})

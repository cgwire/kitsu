import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

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
})

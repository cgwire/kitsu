import { flushPromises, mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

// The user store imports it, and it imports the whole app store.
vi.mock('@/lib/auth', () => ({ default: {} }))
vi.mock('@/store/api/people', () => ({
  default: { sendEmailOTP: vi.fn() }
}))

import lang from '@/lib/lang'
import peopleApi from '@/store/api/people'
import userStore from '@/store/modules/user'
import { USER_EMAIL_OTP_SENT } from '@/store/mutation-types'

import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

import { mountWithI18n } from '../fixtures/i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

// The codes sent by email are counted by the user store, as in the app.
const createUserStore = (actions = {}) =>
  createStore({
    state: () => ({ emailOTPCodesSent: {} }),
    getters: { emailOTPCodesSent: userStore.getters.emailOTPCodesSent },
    mutations: {
      [USER_EMAIL_OTP_SENT]: userStore.mutations[USER_EMAIL_OTP_SENT]
    },
    actions: { sendEmailOTP: userStore.actions.sendEmailOTP, ...actions }
  })

const mountWidget = (props = {}, actions = {}, store = null) =>
  mount(TwoFactorAuthentication, {
    props: {
      preferredTwoFa: 'totp',
      twoFasEnabled: ['totp', 'recovery_code'],
      email: 'ada@example.com',
      ...props
    },
    global: { plugins: [store || createUserStore(actions), i18n] }
  })

describe('widgets/TwoFactorAuthentication', () => {
  // The release of the key that showed the field lands in it.
  it('validates nothing without a code', async () => {
    const wrapper = mountWidget()

    await wrapper.find('input').trigger('keyup', { key: 'Enter' })
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('validate')).toBeUndefined()
  })

  it('validates the typed code', async () => {
    const wrapper = mountWidget()

    await wrapper.find('input').setValue('123456')
    await wrapper.find('input').trigger('keyup', { key: 'Enter' })

    expect(wrapper.emitted('validate')).toEqual([[{ totp: '123456' }]])
  })

  // The spinner only stops the mouse.
  it('validates nothing while the code is checked', async () => {
    const wrapper = mountWidget({ isLoading: true })
    await wrapper.find('input').setValue('123456')

    await wrapper.find('input').trigger('keyup', { key: 'Enter' })
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('validate')).toBeUndefined()
  })

  // Every parent clears the error of a refused code on a method change: told
  // at the opening, the login page hid its code step again.
  it('tells its parent only of a method picked in it', async () => {
    const wrapper = mountWidget()
    await flushPromises()

    expect(wrapper.emitted('changed-two-fa')).toBeUndefined()

    await wrapper
      .findAll('a')
      .find(link => link.text() === 'login.choose_recovery_code')
      .trigger('click')

    expect(wrapper.emitted('changed-two-fa')).toEqual([['recovery_code']])
  })

  // Safari then offers the code that Mail received, or the one its Passwords
  // app generates.
  it.each(['totp', 'email_otp'])(
    'marks the %s field as a one-time code',
    method => {
      const wrapper = mountWidget(
        { preferredTwoFa: method, twoFasEnabled: [method] },
        { sendEmailOTP: () => {} }
      )

      expect(wrapper.find('input').attributes('autocomplete')).toBe(
        'one-time-code'
      )
    }
  )

  // Each email makes Zou refuse the codes of the earlier ones: after a click
  // on "Resend OTP by email", the code of the first email was refused with
  // nothing to say why.
  describe('codes sent by email', () => {
    const notice = 'profile.two_factor_authentication.email_otp.new_code_sent'
    const emailProps = {
      preferredTwoFa: 'email_otp',
      twoFasEnabled: ['email_otp', 'recovery_code']
    }
    const helpLine = wrapper => {
      const id = wrapper.find('input').attributes('aria-describedby')
      return wrapper.find(`[id="${id}"]`)
    }
    const clickLink = (wrapper, text) =>
      wrapper
        .findAll('a')
        .find(link => link.text() === text)
        .trigger('click')
    const resend = wrapper => clickLink(wrapper, 'login.send_email_otp')
    // The hidden status line holds texts too: read the shown errors only.
    const errors = wrapper => wrapper.findAll('.error').map(error => error.text())

    beforeEach(() => {
      peopleApi.sendEmailOTP.mockReset()
      peopleApi.sendEmailOTP.mockResolvedValue({ success: true })
    })

    it('says that only the latest email code works once a new one is sent', async () => {
      const wrapper = mountWidget(emailProps)
      await flushPromises()

      expect(helpLine(wrapper).text()).toBe('login.information_email_otp')

      await resend(wrapper)
      await flushPromises()

      expect(peopleApi.sendEmailOTP).toHaveBeenCalledTimes(2)
      expect(helpLine(wrapper).text()).toBe(notice)
    })

    // Zou keeps only the code of the latest email.
    it('sends no new email while a code is checked', async () => {
      const wrapper = mountWidget({ ...emailProps, isLoading: true })
      await flushPromises()
      const link = wrapper
        .findAll('a')
        .find(item => item.text() === 'login.send_email_otp')

      await link.trigger('click')
      await link.trigger('keydown', { key: 'Enter' })
      await link.trigger('keydown', { key: ' ' })
      await flushPromises()

      expect(link.attributes('aria-disabled')).toBe('true')
      expect(peopleApi.sendEmailOTP).toHaveBeenCalledTimes(1)
    })

    // Cancel and Escape close the step of the 2FA settings, and the login
    // page mounts its step again after a refused code: each opening sends a
    // new code, and the count started over.
    it('keeps counting the codes when the step opens again', async () => {
      const store = createUserStore()
      const first = mountWidget(emailProps, {}, store)
      await flushPromises()
      first.unmount()

      const second = mountWidget(emailProps, {}, store)
      await flushPromises()

      expect(helpLine(second).text()).toBe(notice)
    })

    it('counts no code when the sending fails', async () => {
      peopleApi.sendEmailOTP.mockRejectedValueOnce(new Error('down'))
      const wrapper = mountWidget(emailProps)
      await flushPromises()

      await resend(wrapper)
      await flushPromises()

      expect(helpLine(wrapper).text()).toBe('login.information_email_otp')
    })

    // The error of a refused code hid the one of the sending.
    it('shows the sending error next to a refused code', async () => {
      const wrapper = mountWidget({ ...emailProps, isWrongOtp: true })
      await flushPromises()
      peopleApi.sendEmailOTP.mockRejectedValue(new Error('down'))

      await resend(wrapper)
      await flushPromises()

      expect(errors(wrapper)).toEqual([
        'login.wrong_email_otp',
        'login.error_sending_email'
      ])
    })

    // The notice said a new code was sent, next to the error of its sending.
    it('hides the notice while the sending fails', async () => {
      const wrapper = mountWidget(emailProps)
      await flushPromises()
      await resend(wrapper)
      await flushPromises()
      peopleApi.sendEmailOTP.mockRejectedValue(new Error('down'))

      await resend(wrapper)
      await flushPromises()

      expect(errors(wrapper)).toEqual(['login.error_sending_email'])
      expect(helpLine(wrapper).text()).toBe('login.information_email_otp')
    })

    // The focus stays on the resend link, and a status region speaks only
    // when its text changes: the second resend said nothing.
    describe('status for screen readers', () => {
      const status = wrapper => wrapper.find('[role="status"]').text()

      it('announces each new code', async () => {
        const wrapper = mountWidget(emailProps)
        await flushPromises()

        expect(status(wrapper)).toBe('')

        await resend(wrapper)
        await flushPromises()

        expect(status(wrapper)).toBe(notice)

        let answer = null
        peopleApi.sendEmailOTP.mockReturnValue(
          new Promise(resolve => {
            answer = resolve
          })
        )
        await resend(wrapper)

        expect(status(wrapper)).toBe('')

        answer({ success: true })
        await flushPromises()

        expect(status(wrapper)).toBe(notice)
      })

      it('announces a failed sending', async () => {
        const wrapper = mountWidget(emailProps)
        await flushPromises()
        peopleApi.sendEmailOTP.mockRejectedValue(new Error('down'))

        await resend(wrapper)
        await flushPromises()

        expect(status(wrapper)).toBe('login.error_sending_email')
      })

      // With one code sent, a resend that worked said nothing.
      it('announces a resend that works after a failed opening', async () => {
        peopleApi.sendEmailOTP.mockRejectedValueOnce(new Error('down'))
        const wrapper = mountWidget(emailProps)
        await flushPromises()

        expect(status(wrapper)).toBe('login.error_sending_email')

        await resend(wrapper)
        await flushPromises()

        expect(status(wrapper)).toBe('login.information_email_otp')
      })

      // The field takes the focus at the opening, before the code is sent:
      // it read the help line as it was then.
      describe('at the opening of the step', () => {
        const openSteps = async count => {
          const store = createUserStore()
          let wrapper = null
          for (let opening = 0; opening < count; opening++) {
            wrapper?.unmount()
            wrapper = mountWidget(emailProps, {}, store)
            await flushPromises()
          }
          return wrapper
        }

        it('announces the notice its code brings', async () => {
          expect(status(await openSteps(2))).toBe(notice)
        })

        it('announces nothing when its code changes nothing', async () => {
          expect(status(await openSteps(1))).toBe('')
          expect(status(await openSteps(3))).toBe('')
        })
      })

      it('empties the status when the method changes', async () => {
        const wrapper = mountWidget(emailProps)
        await flushPromises()
        await resend(wrapper)
        await flushPromises()

        await clickLink(wrapper, 'login.choose_recovery_code')

        expect(status(wrapper)).toBe('')
      })

      it('drops the result of a sending once the method changed', async () => {
        const wrapper = mountWidget(emailProps)
        await flushPromises()
        let fail = null
        peopleApi.sendEmailOTP.mockReturnValue(
          new Promise((resolve, reject) => {
            fail = reject
          })
        )
        await resend(wrapper)

        await clickLink(wrapper, 'login.choose_recovery_code')
        fail(new Error('down'))
        await flushPromises()

        expect(status(wrapper)).toBe('')
        expect(wrapper.text()).not.toContain('login.error_sending_email')
      })

      // Two quick resends: the first one fails once the second one sent its
      // code, which is the one that counts.
      it('drops the result of a sending a newer one overtook', async () => {
        const wrapper = mountWidget(emailProps)
        await flushPromises()
        let fail = null
        peopleApi.sendEmailOTP.mockReturnValueOnce(
          new Promise((resolve, reject) => {
            fail = reject
          })
        )
        await resend(wrapper)
        await resend(wrapper)
        await flushPromises()

        fail(new Error('down'))
        await flushPromises()

        expect(errors(wrapper)).toEqual([])
        expect(status(wrapper)).toBe(notice)
      })
    })
  })

  // After "Use a recovery code", the refused TOTP code went again under its
  // own name, and the profile then blamed a recovery code.
  it('empties the code typed for the method left', async () => {
    const wrapper = mountWidget()
    await wrapper.find('input').setValue('123456')

    await wrapper
      .findAll('a')
      .find(link => link.text() === 'login.choose_recovery_code')
      .trigger('click')
    await wrapper.find('button').trigger('click')

    expect(wrapper.find('input').element.value).toBe('')
    expect(wrapper.emitted('validate')).toBeUndefined()

    await wrapper.find('input').setValue('K7PZ2QW9AB')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('validate')).toEqual([
      [{ recovery_code: 'K7PZ2QW9AB' }]
    ])
  })

  // A refusal arriving after a switch read as one for the method chosen.
  it('keeps its method while the code is checked', async () => {
    const wrapper = mountWidget({ isLoading: true })
    const link = wrapper
      .findAll('a')
      .find(item => item.text() === 'login.choose_recovery_code')

    await link.trigger('click')
    await link.trigger('keydown', { key: 'Enter' })
    await link.trigger('keydown', { key: ' ' })

    expect(link.attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('input').attributes('placeholder')).toBe(
      'login.fields.totp'
    )
    expect(wrapper.emitted('changed-two-fa')).toBeUndefined()
  })

  // The code step of the login page sits under the language list.
  describe('validation label', () => {
    let wrapper = null

    const mountLabel = async props => {
      wrapper = mountWithI18n(TwoFactorAuthentication, {
        props: {
          preferredTwoFa: 'totp',
          twoFasEnabled: ['totp'],
          email: 'ada@example.com',
          ...props
        },
        global: { plugins: [createStore({})] }
      })
      await flushPromises()
    }

    afterEach(async () => {
      wrapper.unmount()
      await lang.setLocale('en_US')
      localStorage.removeItem('locale')
    })

    it('follows the language of the page', async () => {
      await mountLabel()
      expect(wrapper.find('button').text()).toBe('Verify')

      await lang.setLocale('fr_FR')
      await flushPromises()

      expect(wrapper.find('button').text()).toBe('Vérifier')
    })

    it('leaves the label its parent gives', async () => {
      await mountLabel({ textValidateButton: 'Enable' })

      expect(wrapper.find('button').text()).toBe('Enable')
    })
  })

  describe('with a FIDO device', () => {
    const response = { id: 'credential-1' }

    beforeEach(() => {
      Object.defineProperty(window.navigator, 'credentials', {
        configurable: true,
        value: { get: () => Promise.resolve(response) }
      })
    })

    afterEach(() => {
      delete window.navigator.credentials
    })

    it('validates the device response, which needs no code', async () => {
      const wrapper = mountWidget(
        { preferredTwoFa: 'fido', twoFasEnabled: ['fido'] },
        { getFIDOChallenge: () => ({ challenge: 'abc' }) }
      )
      await flushPromises()

      expect(wrapper.emitted('validate')).toEqual([
        [{ fido_authentication_response: response }]
      ])
    })

    it('asks the device nothing more while its response is checked', async () => {
      const getFIDOChallenge = vi.fn(() => ({ challenge: 'abc' }))
      const wrapper = mountWidget(
        { preferredTwoFa: 'fido', twoFasEnabled: ['fido'], isLoading: true },
        { getFIDOChallenge }
      )
      await flushPromises()
      const link = wrapper
        .findAll('a')
        .find(item => item.text() === 'login.retry_fido_challenge')

      await link.trigger('click')
      await link.trigger('keydown', { key: 'Enter' })
      await link.trigger('keydown', { key: ' ' })
      await flushPromises()

      expect(link.attributes('aria-disabled')).toBe('true')
      expect(getFIDOChallenge).toHaveBeenCalledTimes(1)
    })

    // A code method chosen next sent that response again on Verify.
    it('drops the device response when a code method is chosen', async () => {
      const wrapper = mountWidget(
        { preferredTwoFa: 'fido', twoFasEnabled: ['fido', 'totp'] },
        { getFIDOChallenge: () => ({ challenge: 'abc' }) }
      )
      await flushPromises()

      await wrapper
        .findAll('a')
        .find(link => link.text() === 'login.choose_totp')
        .trigger('click')
      await wrapper.find('button').trigger('click')

      expect(wrapper.emitted('validate')).toEqual([
        [{ fido_authentication_response: response }]
      ])
    })
  })
})

import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

import TwoFactorAuthentication from '@/components/widgets/TwoFactorAuthentication.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const mountWidget = (props = {}, actions = {}) =>
  mount(TwoFactorAuthentication, {
    props: {
      preferredTwoFa: 'totp',
      twoFasEnabled: ['totp', 'recovery_code'],
      email: 'ada@example.com',
      ...props
    },
    global: { plugins: [createStore({ actions }), i18n] }
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
  })
})

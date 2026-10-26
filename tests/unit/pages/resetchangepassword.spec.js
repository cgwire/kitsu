import { flushPromises, shallowMount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { email: 'jane@example.com', token: 'token-1' } }),
  useRouter: () => ({ push: vi.fn() })
}))

import ResetChangePassword from '@/components/pages/ResetChangePassword.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {},
  missingWarn: false,
  fallbackWarn: false
})

const mountPage = resetChangePassword => {
  const store = createStore({
    actions: { resetChangePassword },
    mutations: { LOGIN_SUCCESS: () => {} }
  })
  return shallowMount(ResetChangePassword, {
    global: { plugins: [i18n, store], stubs: { RouterLink: true } }
  })
}

const fillPasswords = async wrapper => {
  const [password, password2] = wrapper.findAll('input[type="password"]')
  await password.setValue('a strong password')
  await password2.setValue('a strong password')
}

describe('pages/ResetChangePassword', () => {
  it('sends the new password once while the request runs', async () => {
    const resetChangePassword = vi.fn(() => new Promise(() => {}))
    const wrapper = mountPage(resetChangePassword)
    await fillPasswords(wrapper)
    const submit = wrapper.find('a.main-button')

    await submit.trigger('click')
    // The spinner of is-loading is a Bulma .button rule.
    expect(submit.classes()).toEqual(
      expect.arrayContaining(['button', 'is-loading'])
    )
    await submit.trigger('click')
    await wrapper.find('input[type="password"]').trigger('keyup.enter')

    expect(resetChangePassword).toHaveBeenCalledTimes(1)
  })

  it('sends it again after a failure', async () => {
    const resetChangePassword = vi.fn(() => Promise.reject(new Error('down')))
    const wrapper = mountPage(resetChangePassword)
    await fillPasswords(wrapper)
    const submit = wrapper.find('a.main-button')

    await submit.trigger('click')
    await flushPromises()
    await submit.trigger('click')

    expect(resetChangePassword).toHaveBeenCalledTimes(2)
  })

  it('sends nothing more once the password is set', async () => {
    // Zou spends the token on the first success.
    const resetChangePassword = vi
      .fn()
      .mockResolvedValueOnce()
      .mockRejectedValue({ body: { message: 'Wrong or expired token.' } })
    const wrapper = mountPage(resetChangePassword)
    await fillPasswords(wrapper)
    const password = wrapper.find('input[type="password"]')

    await password.trigger('keyup.enter')
    await flushPromises()
    await password.trigger('keyup.enter')
    await flushPromises()

    expect(resetChangePassword).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.success').exists()).toBe(true)
    expect(wrapper.find('.error').exists()).toBe(false)
    wrapper.unmount()
  })
})

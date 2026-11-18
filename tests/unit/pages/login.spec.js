import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

import i18n from '@/lib/i18n'

import Login from '@/components/pages/Login.vue'

const mountPage = (email, logIn = vi.fn()) => {
  const store = createStore({
    state: { login: { email, password: '' } },
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

  test('logs in with the email filled in', async () => {
    // A login that goes through opens the next page after a fade.
    vi.useFakeTimers()
    const logIn = vi.fn()
    wrapper = mountPage('jane@example.com', logIn)

    await wrapper.find('.main-button').trigger('click')

    expect(logIn).toHaveBeenCalledTimes(1)
  })
})

import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))

import i18n from '@/lib/i18n'

import Login from '@/components/pages/Login.vue'

const mountPage = email => {
  const store = createStore({
    state: { login: { email, password: '' } },
    getters: {
      isAuthenticated: () => false,
      isDarkTheme: () => false,
      isLoginError: () => false,
      isLoginLoading: () => false,
      mainConfig: () => ({})
    }
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
})

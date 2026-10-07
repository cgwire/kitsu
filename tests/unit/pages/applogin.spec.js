import { flushPromises, mount } from '@vue/test-utils'
import { createStore } from 'vuex'

const h = vi.hoisted(() => ({ query: {} }))

vi.mock('@unhead/vue', () => ({ useHead: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: key => key }) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: h.query }) }))
vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/store/api/client', () => ({ default: { ppost: vi.fn() } }))

import client from '@/store/api/client'

import AppLogin from '@/components/pages/AppLogin.vue'

const CHALLENGE = 'a'.repeat(43)
const VALID_QUERY = { port: '8765', code_challenge: CHALLENGE, state: 's t' }

const originalLocation = window.location

const mountPage = query => {
  h.query = query
  const store = createStore({
    getters: {
      isDarkTheme: () => false,
      user: () => ({ full_name: 'Jane Doe' })
    }
  })
  return mount(AppLogin, {
    global: {
      mocks: {
        $t: (key, params = {}) => [key, ...Object.values(params)].join(' ')
      },
      plugins: [store]
    }
  })
}

const buttons = wrapper => wrapper.findAll('button')

describe('pages/AppLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete window.location
    window.location = { assign: vi.fn() }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.location = originalLocation
  })

  test.each([
    ['no port', { ...VALID_QUERY, port: undefined }],
    ['a privileged port', { ...VALID_QUERY, port: '80' }],
    ['a port out of range', { ...VALID_QUERY, port: '65536' }],
    ['a port that is not an integer', { ...VALID_QUERY, port: '80.5' }],
    ['a short challenge', { ...VALID_QUERY, code_challenge: 'abc' }],
    ['a challenge with padding', { ...VALID_QUERY, code_challenge: `${'a'.repeat(42)}=` }],
    ['no state', { ...VALID_QUERY, state: '' }],
    ['a repeated state', { ...VALID_QUERY, state: ['a', 'b'] }]
  ])('shows no button for %s', (_, query) => {
    const wrapper = mountPage(query)
    expect(buttons(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toContain('app_login.invalid_request')
  })

  test('shows no button inside a frame', () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({})
    const wrapper = mountPage(VALID_QUERY)
    expect(buttons(wrapper)).toHaveLength(0)
  })

  test('sends the code to the loopback listener on authorize', async () => {
    client.ppost.mockResolvedValue({ code: 'c/d&e' })
    const wrapper = mountPage(VALID_QUERY)
    await buttons(wrapper)[0].trigger('click')
    await flushPromises()
    expect(client.ppost).toHaveBeenCalledWith('/api/auth/app-login/code', {
      code_challenge: CHALLENGE
    })
    expect(window.location.assign).toHaveBeenCalledWith(
      'http://127.0.0.1:8765/?code=c%2Fd%26e&state=s%20t'
    )
  })

  test('tells the app the user refused on cancel', async () => {
    const wrapper = mountPage(VALID_QUERY)
    await buttons(wrapper)[1].trigger('click')
    expect(client.ppost).not.toHaveBeenCalled()
    expect(window.location.assign).toHaveBeenCalledWith(
      'http://127.0.0.1:8765/?error=access_denied&state=s%20t'
    )
  })

  test('shows an error and no button when the code cannot be made', async () => {
    client.ppost.mockRejectedValue(Object.assign(new Error(), { status: 403 }))
    const wrapper = mountPage(VALID_QUERY)
    await buttons(wrapper)[0].trigger('click')
    await flushPromises()
    expect(window.location.assign).not.toHaveBeenCalled()
    expect(buttons(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toContain('app_login.error_2fa_setup')
  })

  test('shows the app name as a truncated label', () => {
    const wrapper = mountPage({ ...VALID_QUERY, app_name: 'x'.repeat(60) })
    expect(wrapper.text()).toContain(
      `app_login.consent_named ${'x'.repeat(50)} Jane Doe`
    )
  })
})

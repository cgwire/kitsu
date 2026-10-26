// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/lib/auth', () => ({
  default: { logIn: vi.fn(), logout: vi.fn(), resetChangePassword: vi.fn() }
}))

import auth from '@/lib/auth'
import loginStore from '@/store/modules/login'

describe('Login store', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('logIn action', () => {
    test('commits LOGIN_SUCCESS and resolves when auth succeeds', async () => {
      auth.logIn.mockResolvedValue({ id: 'u1' })
      const commit = vi.fn()
      const state = { email: 'user@studio.com', password: 'secret' }

      // No payload = plain login without 2FA (the common case).
      await loginStore.actions.logIn({ commit, state }, undefined)

      expect(auth.logIn).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@studio.com' })
      )
      const committed = commit.mock.calls.map(c => c[0])
      expect(committed).toContain('LOGIN_RUN')
      expect(committed).toContain('LOGIN_SUCCESS')
    })

    test('commits LOGIN_FAILURE and rethrows when auth fails', async () => {
      const failure = new Error('bad credentials')
      auth.logIn.mockRejectedValue(failure)
      const commit = vi.fn()
      const state = { email: 'user@studio.com', password: 'secret' }

      await expect(
        loginStore.actions.logIn({ commit, state }, {})
      ).rejects.toBe(failure)

      const committed = commit.mock.calls.map(c => c[0])
      expect(committed).toContain('LOGIN_FAILURE')
      expect(committed).not.toContain('LOGIN_SUCCESS')
    })
  })

  describe('resetChangePassword action', () => {
    test('fills in the login email once the password is set', async () => {
      auth.resetChangePassword.mockResolvedValue({ success: true })
      const commit = vi.fn()

      await loginStore.actions.resetChangePassword(
        { commit },
        {
          email: 'jane@studio.com',
          token: 'token-1',
          password: 'a strong password',
          password2: 'a strong password'
        }
      )

      expect(commit).toHaveBeenCalledWith('CHANGE_EMAIL', 'jane@studio.com')
    })
  })

  describe('LOGIN_SUCCESS mutation', () => {
    test('clears the password from the store', () => {
      const state = { isLoginLoading: true, isLoginError: false, password: 's' }
      loginStore.mutations.LOGIN_SUCCESS(state)
      expect(state.password).toBe('')
    })
  })

  describe('logout actions', () => {
    const store = { $socket: { disconnect: vi.fn() } }
    let page

    beforeEach(() => {
      page = new EventTarget()
      page.location = { reload: vi.fn() }
      vi.stubGlobal('window', page)
      vi.stubGlobal('navigator', { onLine: true })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    test('reload the tab once logged out', async () => {
      auth.logout.mockResolvedValue()
      const commit = vi.fn()

      await loginStore.actions.logout.call(store, { commit })

      expect(store.$socket.disconnect).toHaveBeenCalled()
      expect(commit).toHaveBeenCalledWith('RESET_ALL')
      expect(page.location.reload).toHaveBeenCalled()
    })

    test('reload the tab even when the logout request fails', async () => {
      const failure = new Error('Request has been terminated')
      auth.logout.mockRejectedValue(failure)
      const commit = vi.fn()

      await expect(
        loginStore.actions.logout.call(store, { commit })
      ).rejects.toBe(failure)

      expect(commit).toHaveBeenCalledWith('RESET_ALL')
      expect(page.location.reload).toHaveBeenCalled()
    })

    test('reload the tab when another tab logged out', () => {
      const commit = vi.fn()

      loginStore.actions.logoutLocal.call(store, { commit })

      expect(commit).toHaveBeenCalledWith('USER_LOGOUT')
      expect(commit).toHaveBeenCalledWith('RESET_ALL')
      expect(page.location.reload).toHaveBeenCalled()
    })

    // Offline, the reload would show the error page of the browser, and the
    // session would stay open on Zou.
    describe('offline', () => {
      const context = () => {
        const commit = vi.fn()
        const dispatch = vi.fn(name =>
          loginStore.actions[name].call(store, { commit, dispatch })
        )
        return { commit, dispatch }
      }

      const goOnline = () => {
        navigator.onLine = true
        page.dispatchEvent(new Event('online'))
      }

      beforeEach(() => {
        navigator.onLine = false
      })

      test('log out again once the network is back, then reload', async () => {
        const failure = new Error('Request has been terminated')
        auth.logout.mockRejectedValueOnce(failure).mockResolvedValueOnce()
        const { commit, dispatch } = context()

        await expect(
          loginStore.actions.logout.call(store, { commit, dispatch })
        ).rejects.toBe(failure)

        expect(commit).toHaveBeenCalledWith('RESET_ALL')
        expect(page.location.reload).not.toHaveBeenCalled()

        goOnline()
        await dispatch.mock.results[0].value

        expect(auth.logout).toHaveBeenCalledTimes(2)
        expect(page.location.reload).toHaveBeenCalledTimes(1)
      })

      test('log out once the network is back when another tab logged out', async () => {
        auth.logout.mockResolvedValue()
        const { commit, dispatch } = context()

        loginStore.actions.logoutLocal.call(store, { commit, dispatch })

        expect(commit).toHaveBeenCalledWith('RESET_ALL')
        expect(page.location.reload).not.toHaveBeenCalled()

        goOnline()
        await dispatch.mock.results[0].value

        expect(auth.logout).toHaveBeenCalledTimes(1)
        expect(page.location.reload).toHaveBeenCalledTimes(1)
      })
    })
  })
})

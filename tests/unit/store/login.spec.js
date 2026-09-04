// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store', () => ({ default: {} }))
vi.mock('@/lib/auth', () => ({ default: { logIn: vi.fn() } }))

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

  describe('LOGIN_SUCCESS mutation', () => {
    test('clears the password from the store', () => {
      const state = { isLoginLoading: true, isLoginError: false, password: 's' }
      loginStore.mutations.LOGIN_SUCCESS(state)
      expect(state.password).toBe('')
    })
  })
})

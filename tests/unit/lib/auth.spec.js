// @vitest-environment node

import { vi } from 'vitest'

vi.mock('@/store', () => ({
  default: {
    commit: vi.fn(),
    state: { user: { user: null, isAuthenticated: false } }
  }
}))
vi.mock('superagent', () => ({ default: { get: vi.fn() } }))

import superagent from 'superagent'

import auth from '@/lib/auth'
import store from '@/store'
import {
  DATA_LOADING_START,
  DATA_LOADING_END,
  USER_LOGIN_FAIL
} from '@/store/mutation-types.js'

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('isPasswordValid', () => {
    expect(auth.isPasswordValid('', '')).toBeFalsy()
    expect(auth.isPasswordValid('abc', 'abc')).toBeFalsy()
    expect(auth.isPasswordValid('abcdefgh', 'abc')).toBeFalsy()
    expect(auth.isPasswordValid('abcdefgh', 'abcdefgh')).toBeTruthy()
  })

  describe('isServerLoggedIn', () => {
    const answerWith = error =>
      superagent.get.mockReturnValue({
        timeout: vi.fn().mockRejectedValue(error)
      })

    // No answer says nothing about the session. A check still in flight
    // when the app reopens a page must not empty the user under it.
    test.each([
      ['a timeout', { timeout: 20000 }],
      ['a network error', { crossDomain: true }],
      ['a gateway error', { status: 502 }]
    ])('keeps the session on %s', async (_, fields) => {
      const error = Object.assign(new Error('unreachable'), fields)
      answerWith(error)
      await expect(auth.isServerLoggedIn()).rejects.toBe(error)
      expect(store.commit.mock.calls).toEqual([])
    })

    test.each([401, 422])('ends the session on a %i answer', async status => {
      answerWith(Object.assign(new Error('refused'), { status }))
      await expect(auth.isServerLoggedIn()).resolves.toBeUndefined()
      expect(store.commit.mock.calls).toEqual([[USER_LOGIN_FAIL]])
    })
  })

  describe('requireAuth', () => {
    test('commits DATA_LOADING_END before redirecting to server-down', async () => {
      // Cold load against an unreachable server: without the END commit the
      // ServerDown page stays hidden behind the loading spinner.
      vi.spyOn(auth, 'isServerLoggedIn').mockRejectedValue(
        new Error('unreachable')
      )
      const result = await auth.requireAuth({ fullPath: '/target' }, {})
      expect(result).toEqual({
        name: 'server-down',
        query: { redirect: '/target' }
      })
      expect(store.commit.mock.calls).toEqual([
        [DATA_LOADING_START],
        [DATA_LOADING_END]
      ])
    })
  })
})

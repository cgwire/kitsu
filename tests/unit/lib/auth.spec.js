import { vi } from 'vitest'

vi.mock('@/store', () => ({
  default: {
    commit: vi.fn(),
    state: { user: { user: null, isAuthenticated: false } }
  }
}))

import auth from '@/lib/auth'
import store from '@/store'
import {
  DATA_LOADING_START,
  DATA_LOADING_END
} from '@/store/mutation-types.js'

describe('auth', () => {
  test('isPasswordValid', () => {
    expect(auth.isPasswordValid('', '')).toBeFalsy()
    expect(auth.isPasswordValid('abc', 'abc')).toBeFalsy()
    expect(auth.isPasswordValid('abcdefgh', 'abc')).toBeFalsy()
    expect(auth.isPasswordValid('abcdefgh', 'abcdefgh')).toBeTruthy()
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

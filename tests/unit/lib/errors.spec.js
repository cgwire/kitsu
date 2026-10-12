 
import { describe, it, expect, vi, beforeEach } from 'vitest'

import errors from '@/lib/errors'

describe('errors', () => {
  beforeEach(() => {
    delete window.location
    window.location = {
      pathname: '/',
      replace: vi.fn()
    }
  })

  it('calls replace with /login when not on the login page', () => {
    window.location.pathname = '/productions'
    errors.backToLogin()
    expect(window.location.replace).toHaveBeenCalledWith('/login')
  })

  it('does not call replace when already on /login', () => {
    window.location.pathname = '/login'
    errors.backToLogin()
    expect(window.location.replace).not.toHaveBeenCalled()
  })

  // The API client marks the failures it reports.
  describe('request failures', () => {
    it('knows the failures the API client marked', () => {
      const failure = new Error('Request has been terminated')
      errors.markRequestFailure(failure)
      expect(errors.isRequestFailure(failure)).toBe(true)
      expect(
        errors.isRequestFailure(new Error('Request has been terminated'))
      ).toBe(false)
      expect(errors.isRequestFailure(undefined)).toBe(false)
      expect(errors.isRequestFailure('Request has been terminated')).toBe(false)
    })

    it('ignores a failure that is not an object', () => {
      expect(() =>
        errors.markRequestFailure('Request has been terminated')
      ).not.toThrow()
    })

    it('logs a request failure and lets anything else through', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const failure = new Error('Request has been terminated')
      const bug = new TypeError('Cannot read properties of undefined')
      errors.markRequestFailure(failure)

      errors.logRequestFailure(failure)
      expect(() => errors.logRequestFailure(bug)).toThrow(bug)

      expect(consoleError.mock.calls).toEqual([[failure]])
      consoleError.mockRestore()
    })
  })
})

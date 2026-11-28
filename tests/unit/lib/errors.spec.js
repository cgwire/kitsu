 
import { describe, it, expect, vi, beforeEach } from 'vitest'

import errors, { isMissingEntity, isUnreadablePicture } from '@/lib/errors'

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

  it('takes a deleted, refused, or malformed entity for a missing one', () => {
    expect([400, 403, 404].map(status => isMissingEntity({ status }))).toEqual(
      [true, true, true]
    )
    expect(isMissingEntity({ status: 500 })).toBe(false)
    expect(isMissingEntity(new Error('Request has been terminated'))).toBe(
      false
    )
    expect(isMissingEntity(new TypeError('x is undefined'))).toBe(false)
  })

  describe('unreadable picture', () => {
    const refusal = (status, body) =>
      Object.assign(new Error(`${status}`), { status, body })
    const message = 'Uploaded file is not a readable picture.'

    it('knows the refusal of a picture Zou cannot read', () => {
      expect(isUnreadablePicture(refusal(400, { message }))).toBe(true)
    })

    it('tells it from the other failures', () => {
      expect(
        isUnreadablePicture(
          refusal(400, { message: 'Wrong file format, extension: exr' })
        )
      ).toBe(false)
      expect(isUnreadablePicture(refusal(500, { message }))).toBe(false)
      // The API client sets an empty body when the answer has none.
      expect(isUnreadablePicture(refusal(400, ''))).toBe(false)
      expect(
        isUnreadablePicture(new Error('Request has been terminated'))
      ).toBe(false)
      expect(isUnreadablePicture(undefined)).toBe(false)
    })
  })
})

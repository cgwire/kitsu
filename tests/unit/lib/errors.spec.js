/* eslint-disable no-undef */
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
})

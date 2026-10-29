// @vitest-environment node

import { vi } from 'vitest'

import { createSocket } from '@/lib/socket'

describe('socket', () => {
  let socket = null

  beforeEach(() => {
    vi.stubGlobal('location', new URL('http://localhost/'))
  })

  afterEach(() => {
    socket?.close()
    socket = null
    vi.unstubAllGlobals()
  })

  it('waits for the main layout to connect', () => {
    socket = createSocket()
    expect(socket.active).toBe(false)
  })
})

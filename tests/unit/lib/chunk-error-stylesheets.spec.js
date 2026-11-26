import { vi } from 'vitest'

import { setupStylesheetRetry } from '@/lib/chunk-error'

// What a stylesheet that does not load leaves in the page: its link, and an
// error event that does not bubble.
const addStylesheet = (href, rel = 'stylesheet') => {
  const link = document.createElement('link')
  link.rel = rel
  link.href = href
  document.head.appendChild(link)
  return link
}

const fail = link => link.dispatchEvent(new Event('error'))

const findStylesheet = href =>
  [...document.head.querySelectorAll('link')].find(
    link => link.getAttribute('href') === href
  )

const expectRetryAfter = (href, delay) => {
  const link = findStylesheet(href)
  fail(link)
  vi.advanceTimersByTime(delay - 1)
  expect(findStylesheet(href)).toBe(link)
  vi.advanceTimersByTime(1)
  expect(findStylesheet(href)).not.toBe(link)
}

describe('lib/chunk-error', () => {
  describe('setupStylesheetRetry', () => {
    // The tries of a URL count for the life of the module: each test uses
    // URLs of its own.
    beforeAll(() => {
      setupStylesheetRetry()
    })

    beforeEach(() => {
      vi.useFakeTimers()
      document.head.innerHTML = ''
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
    })

    test('loads again a stylesheet that failed, at its place', () => {
      const before = addStylesheet('/assets/before.css')
      const link = addStylesheet('/assets/retry.css')
      const after = addStylesheet('/assets/after.css')
      fail(link)
      expect(findStylesheet('/assets/retry.css')).toBe(link)

      vi.advanceTimersByTime(5000)
      const fresh = findStylesheet('/assets/retry.css')
      expect(fresh).not.toBe(link)
      expect(fresh.rel).toBe('stylesheet')
      expect(link.isConnected).toBe(false)
      expect([...document.head.children]).toEqual([before, fresh, after])
    })

    test('tries again after 5 s, 30 s, and 2 min, then stops', () => {
      addStylesheet('/assets/gone.css')
      expectRetryAfter('/assets/gone.css', 5000)
      expectRetryAfter('/assets/gone.css', 30000)
      expectRetryAfter('/assets/gone.css', 120000)

      const last = findStylesheet('/assets/gone.css')
      fail(last)
      expect(vi.getTimerCount()).toBe(0)
      vi.advanceTimersByTime(600000)
      expect(findStylesheet('/assets/gone.css')).toBe(last)
    })

    test('waits for the network when offline', () => {
      const onLine = vi
        .spyOn(navigator, 'onLine', 'get')
        .mockReturnValue(false)
      const link = addStylesheet('/assets/offline.css')
      fail(link)
      vi.advanceTimersByTime(600000)
      expect(findStylesheet('/assets/offline.css')).toBe(link)
      expect(vi.getTimerCount()).toBe(0)

      onLine.mockReturnValue(true)
      window.dispatchEvent(new Event('online'))
      expect(findStylesheet('/assets/offline.css')).not.toBe(link)
    })

    test('waits for the network when it goes away before the try', () => {
      const link = addStylesheet('/assets/dropped.css')
      fail(link)
      const onLine = vi
        .spyOn(navigator, 'onLine', 'get')
        .mockReturnValue(false)
      vi.advanceTimersByTime(600000)
      expect(findStylesheet('/assets/dropped.css')).toBe(link)

      onLine.mockReturnValue(true)
      window.dispatchEvent(new Event('online'))
      expect(findStylesheet('/assets/dropped.css')).not.toBe(link)
    })

    test('leaves scripts and the stylesheets of other sites alone', () => {
      const script = addStylesheet('/assets/page.js', 'modulepreload')
      const widget = addStylesheet('https://client.example.com/widget.css')
      fail(script)
      fail(widget)
      expect(vi.getTimerCount()).toBe(0)
      vi.advanceTimersByTime(600000)
      expect(findStylesheet('/assets/page.js')).toBe(script)
      expect(
        findStylesheet('https://client.example.com/widget.css')
      ).toBe(widget)
    })
  })
})

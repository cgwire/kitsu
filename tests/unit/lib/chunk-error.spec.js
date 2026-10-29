// @vitest-environment node

import { vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

// The module listens to the page on import: stub the page first.
const page = vi.hoisted(() => {
  const page = new EventTarget()
  page.location = { assign: vi.fn() }
  vi.stubGlobal('window', page)
  vi.stubGlobal('navigator', { onLine: true })
  return page
})

import { setupChunkErrorHandler } from '@/lib/chunk-error'

const Page = {}

// What the preload helper of a Vite build does when a chunk does not load:
// it tells the page, then rejects the import.
const missingChunk = () => {
  const error = new TypeError('Failed to fetch dynamically imported module')
  const event = new Event('vite:preloadError', { cancelable: true })
  event.payload = error
  page.dispatchEvent(event)
  return Promise.reject(error)
}

describe('lib/chunk-error', () => {
  describe('setupChunkErrorHandler', () => {
    let router

    const openLazyPage = () => router.push('/lazy').catch(() => {})

    beforeEach(async () => {
      sessionStorage.clear()
      page.location.assign.mockClear()
      navigator.onLine = true
      router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: Page },
          { path: '/lazy', component: missingChunk }
        ]
      })
      await router.push('/')
      await setupChunkErrorHandler(router)
    })

    afterAll(() => {
      vi.unstubAllGlobals()
    })

    test('reloads the page whose chunk did not load', async () => {
      await openLazyPage()
      expect(page.location.assign).toHaveBeenCalledWith('/lazy')
    })

    test('reloads once only', async () => {
      await openLazyPage()
      await openLazyPage()
      expect(page.location.assign).toHaveBeenCalledTimes(1)
    })

    // Offline, the reload would show the error page of the browser.
    test('waits for the network before reloading', async () => {
      navigator.onLine = false
      await openLazyPage()
      expect(page.location.assign).not.toHaveBeenCalled()
      expect(router.currentRoute.value.path).toBe('/')

      navigator.onLine = true
      await openLazyPage()
      expect(page.location.assign).toHaveBeenCalledWith('/lazy')
    })
  })
})

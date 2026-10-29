// @vitest-environment node

import { vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { followLostRedirects } from '@/lib/navigation-failure'

const NativeError = Error
const Page = {}

// What the script of the page put in place of window.Error: a plain function
// whose prototype is not the one of the errors it returns.
function new_constructor(message) {
  return new NativeError(message)
}

const tick = () => new Promise(resolve => setTimeout(resolve))

// A guard that answers in a later task, like one that awaits a request.
const later = value => () => tick().then(() => value)

describe('lib/navigation-failure', () => {
  describe('followLostRedirects', () => {
    let router

    const createTestRouter = routes => {
      router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: Page },
          { path: '/login', name: 'login', component: Page },
          ...routes
        ]
      })
      followLostRedirects(router)
    }

    // vue-router reads window.Error at each call: replace it for the time of
    // the navigation and of the redirects that follow.
    const pushWithReplacedError = async (location, ticks = 1) => {
      vi.stubGlobal('Error', new_constructor)
      try {
        await router.push(location).catch(() => {})
        for (let i = 0; i < ticks; i++) await tick()
      } finally {
        vi.unstubAllGlobals()
      }
    }

    test('follows the redirect of a guard', async () => {
      createTestRouter([
        {
          path: '/private',
          component: Page,
          beforeEnter: () => ({ name: 'login' })
        }
      ])
      await pushWithReplacedError('/private')
      expect(router.currentRoute.value.name).toBe('login')
    })

    test('leaves the aborts and the errors of the guards alone', async () => {
      const abort = vi.fn(() => false)
      const bug = vi.fn(() => {
        throw new TypeError('x is undefined')
      })
      createTestRouter([
        { path: '/aborted', component: Page, beforeEnter: abort },
        { path: '/broken', component: Page, beforeEnter: bug }
      ])
      await router.push('/')
      await pushWithReplacedError('/aborted')
      await pushWithReplacedError('/broken')
      expect(abort).toHaveBeenCalledTimes(1)
      expect(bug).toHaveBeenCalledTimes(1)
      expect(router.currentRoute.value.path).toBe('/')
    })

    test('stops after ten redirects in a row', async () => {
      const toB = vi.fn(later('/b'))
      const toA = vi.fn(later('/a'))
      createTestRouter([
        { path: '/a', component: Page, beforeEnter: toB },
        { path: '/b', component: Page, beforeEnter: toA }
      ])
      await pushWithReplacedError('/a', 40)
      // The first visit of /a, then the ten redirects followed, five to each.
      expect(toB).toHaveBeenCalledTimes(6)
      expect(toA).toHaveBeenCalledTimes(5)
    })

    test('follows again once a navigation succeeded', async () => {
      createTestRouter([
        { path: '/home', component: Page },
        {
          path: '/private',
          component: Page,
          beforeEnter: () => ({ name: 'login' })
        }
      ])
      // One redirect more than the limit, each from a page that opened.
      for (let i = 0; i <= 10; i++) {
        await router.push('/home')
        await pushWithReplacedError('/private')
        expect(router.currentRoute.value.name).toBe('login')
      }
    })

    // Sentry hears of the router errors through the handler it adds later.
    test('lets the next handlers run on a redirect to an unknown route', async () => {
      createTestRouter([
        {
          path: '/private',
          component: Page,
          beforeEnter: () => ({ name: 'nowhere' })
        }
      ])
      const nextHandler = vi.fn()
      router.onError(nextHandler)
      await pushWithReplacedError('/private')
      expect(nextHandler).toHaveBeenCalledTimes(1)
      expect(nextHandler.mock.calls[0][0]).toMatchObject({
        type: 2,
        to: { name: 'nowhere' }
      })
    })
  })
})

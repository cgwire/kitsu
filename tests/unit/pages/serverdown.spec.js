import { flushPromises, mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('@/lib/auth', () => ({ default: { isServerLoggedIn: vi.fn() } }))

import auth from '@/lib/auth'

import ServerDown from '@/components/pages/ServerDown.vue'

import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

const TARGET = '/productions/production-1/sequences'

const Page = { template: '<div />' }

let showPage
let wrapper

const mountPage = async ({ beforeEnter } = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Page },
      { path: '/server-down', name: 'server-down', component: ServerDown },
      {
        path: '/productions/:production_id/sequences',
        name: 'sequences',
        component: Page,
        beforeEnter
      }
    ]
  })
  await router.push({ name: 'server-down', query: { redirect: TARGET } })
  await router.isReady()
  showPage = ref(true)
  wrapper = mount(
    { template: '<router-view v-if="showPage" />', setup: () => ({ showPage }) },
    { global: { plugins: [router] } }
  )
  return router
}

// What App.vue does around the loading screen of a guard: the router view
// goes away, then comes back on the route still current, as a new copy.
const swapForLoadingScreen = async () => {
  showPage.value = false
  await nextTick()
  showPage.value = true
  await flushPromises()
}

describe('pages/ServerDown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  test('opens the requested page once the server answers', async () => {
    auth.isServerLoggedIn.mockResolvedValue()
    const router = await mountPage()
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe(TARGET)
  })

  test('stays on the page while the server is down', async () => {
    auth.isServerLoggedIn.mockRejectedValue(new Error('unreachable'))
    const router = await mountPage()
    await flushPromises()
    expect(router.currentRoute.value.name).toBe('server-down')
  })

  // The redirect runs the / guard, whose loading screen brings a new copy of
  // the page while the navigation waits, for the page chunk for instance. A
  // check from that copy would push the redirect anew and restart the
  // guard, once more on every answer.
  test('checks the server once while its redirect is pending', async () => {
    auth.isServerLoggedIn.mockResolvedValue()
    let openPage
    const router = await mountPage({
      beforeEnter: () =>
        new Promise(resolve => {
          openPage = resolve
        })
    })
    await flushPromises()
    await swapForLoadingScreen()
    expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(1)
    openPage()
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe(TARGET)
  })

  test('checks the server again once its redirect is over', async () => {
    auth.isServerLoggedIn.mockResolvedValue()
    // The / guard could not load the app data: back to this page.
    await mountPage({ beforeEnter: () => ({ name: 'server-down' }) })
    await flushPromises()
    await swapForLoadingScreen()
    expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
  })

  // A navigation the page did not start can open the requested page while
  // the check is in flight. The route then holds no redirect: pushing would
  // send the user home.
  test('leaves the app alone when its answer comes after the redirect', async () => {
    let answer
    auth.isServerLoggedIn.mockReturnValue(
      new Promise(resolve => {
        answer = resolve
      })
    )
    const router = await mountPage()
    await router.push(TARGET)
    answer()
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe(TARGET)
  })

  test('tells that Kitsu keeps trying to reach the server', async () => {
    auth.isServerLoggedIn.mockRejectedValue(new Error('unreachable'))
    await mountPage()
    expect(wrapper.text()).toContain('server_down.retrying')
  })

  describe('while the server stays down', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      auth.isServerLoggedIn.mockRejectedValue(new Error('unreachable'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    // Quick checks catch a restart, then one a minute is enough.
    test('checks again later, less and less often', async () => {
      await mountPage()
      await flushPromises()
      const delays = [5000, 10000, 20000, 40000, 60000, 60000]
      for (const [index, delay] of delays.entries()) {
        await vi.advanceTimersByTimeAsync(delay - 1)
        expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(index + 1)
        await vi.advanceTimersByTimeAsync(1)
        expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(index + 2)
      }
    })

    test('starts a new outage with quick checks again', async () => {
      await mountPage()
      await flushPromises()
      await vi.advanceTimersByTimeAsync(5000 + 10000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(3)
      wrapper.unmount()
      await mountPage()
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(4)
      await vi.advanceTimersByTimeAsync(5000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(5)
    })

    test('opens the requested page once the server answers again', async () => {
      const router = await mountPage()
      await flushPromises()
      auth.isServerLoggedIn.mockResolvedValue()
      await vi.advanceTimersByTimeAsync(5000)
      await flushPromises()
      expect(router.currentRoute.value.fullPath).toBe(TARGET)
    })

    test('checks at once when the browser goes back online', async () => {
      await mountPage()
      await flushPromises()
      window.dispatchEvent(new Event('online'))
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
    })

    test('checks at once when the tab shows again', async () => {
      const visibility = vi.spyOn(document, 'visibilityState', 'get')
      await mountPage()
      await flushPromises()
      visibility.mockReturnValue('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(1)
      visibility.mockReturnValue('visible')
      document.dispatchEvent(new Event('visibilitychange'))
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
      visibility.mockRestore()
    })

    // A check can last until its 20 s timeout.
    test('never runs two checks at once', async () => {
      await mountPage()
      await flushPromises()
      let fail
      auth.isServerLoggedIn.mockReturnValueOnce(
        new Promise((resolve, reject) => {
          fail = reject
        })
      )
      window.dispatchEvent(new Event('online'))
      await vi.advanceTimersByTimeAsync(5000)
      window.dispatchEvent(new Event('online'))
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
      fail(new Error('unreachable'))
      await vi.advanceTimersByTimeAsync(10000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(3)
    })

    test('stops checking once the page is gone', async () => {
      await mountPage()
      await flushPromises()
      wrapper.unmount()
      wrapper = null
      await vi.advanceTimersByTimeAsync(60000)
      window.dispatchEvent(new Event('online'))
      document.dispatchEvent(new Event('visibilitychange'))
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(1)
    })

    test('plans no check once the page is gone during one', async () => {
      let fail
      auth.isServerLoggedIn.mockReturnValueOnce(
        new Promise((resolve, reject) => {
          fail = reject
        })
      )
      await mountPage()
      wrapper.unmount()
      wrapper = null
      fail(new Error('unreachable'))
      await vi.advanceTimersByTimeAsync(60000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(1)
    })
  })

  // The / guard sends back to this page when the server went down again.
  describe('when the redirect comes back to the page', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      auth.isServerLoggedIn.mockResolvedValue()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test('checks again from the copy of its loading screen', async () => {
      let closeGuard
      await mountPage({
        beforeEnter: () =>
          new Promise(resolve => {
            closeGuard = resolve
          })
      })
      await flushPromises()
      await swapForLoadingScreen()
      closeGuard({ name: 'server-down', query: { redirect: TARGET } })
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(1)
      // Down again: no new redirect left pending for the next test.
      auth.isServerLoggedIn.mockRejectedValue(new Error('unreachable'))
      await vi.advanceTimersByTimeAsync(5000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
    })

    // The server answers but the app data does not load: each redirect
    // brings a new copy, which must not start the delays over.
    test('waits longer after each redirect the guard sends back', async () => {
      let closeGuard
      await mountPage({
        beforeEnter: () =>
          new Promise(resolve => {
            closeGuard = resolve
          })
      })
      const sendBack = async () => {
        await swapForLoadingScreen()
        closeGuard({ name: 'server-down', query: { redirect: TARGET } })
        await flushPromises()
      }
      await flushPromises()
      await sendBack()
      await vi.advanceTimersByTimeAsync(5000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
      await sendBack()
      // Down again: no new redirect left pending for the next test.
      auth.isServerLoggedIn.mockRejectedValue(new Error('unreachable'))
      await vi.advanceTimersByTimeAsync(9999)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
      await vi.advanceTimersByTimeAsync(1)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(3)
    })

    test('checks again when the page stayed mounted', async () => {
      await mountPage({
        beforeEnter: () => ({ name: 'server-down', query: { redirect: TARGET } })
      })
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(5000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
    })
  })

  // The server answers, but a guard throws on the redirect: a bug, which the
  // router reports, and which another redirect would only run again.
  describe('when the redirect hits a bug', () => {
    const bug = new TypeError("Cannot read properties of null (reading 'forEach')")

    beforeEach(() => {
      vi.useFakeTimers()
      auth.isServerLoggedIn.mockResolvedValue()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    // The copy of the loading screen plans a check in case the guard sends
    // back here, then the guard throws.
    const failRedirect = async () => {
      let failGuard
      let textBeforeBug
      const reportError = vi.fn()
      const rejections = await recordUnhandledRejections(async () => {
        const router = await mountPage({
          beforeEnter: () =>
            new Promise((resolve, reject) => {
              failGuard = reject
            })
        })
        router.onError(reportError)
        await flushPromises()
        await swapForLoadingScreen()
        textBeforeBug = wrapper.text()
        failGuard(bug)
        await flushPromises()
      })
      return { rejections, reportError, textBeforeBug }
    }

    // Sentry captures the error the router reports, then skips the same
    // error once left unhandled.
    test('leaves the bug to Sentry once', async () => {
      const { rejections, reportError } = await failRedirect()
      expect(reportError).toHaveBeenCalledTimes(1)
      expect(reportError.mock.calls[0][0]).toBe(bug)
      expect(rejections).toHaveLength(1)
      expect(rejections[0]).toBe(bug)
    })

    test('stops checking the server', async () => {
      await failRedirect()
      expect(vi.getTimerCount()).toBe(1)
      await vi.advanceTimersByTimeAsync(60000)
      window.dispatchEvent(new Event('online'))
      await flushPromises()
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(1)
    })

    test('stops telling that Kitsu keeps trying', async () => {
      const { textBeforeBug } = await failRedirect()
      expect(textBeforeBug).toContain('server_down.retrying')
      expect(wrapper.text()).toContain('server_down.title')
      expect(wrapper.text()).not.toContain('server_down.retrying')
    })

    test('checks again on the next outage', async () => {
      await failRedirect()
      wrapper.unmount()
      auth.isServerLoggedIn.mockRejectedValue(new Error('unreachable'))
      await mountPage()
      await flushPromises()
      expect(wrapper.text()).toContain('server_down.retrying')
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(2)
      await vi.advanceTimersByTimeAsync(5000)
      expect(auth.isServerLoggedIn).toHaveBeenCalledTimes(3)
    })
  })
})

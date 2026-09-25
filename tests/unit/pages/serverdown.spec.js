import { flushPromises, mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('@/lib/auth', () => ({ default: { isServerLoggedIn: vi.fn() } }))

import auth from '@/lib/auth'

import ServerDown from '@/components/pages/ServerDown.vue'

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
})

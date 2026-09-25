import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('@/lib/auth', () => ({ default: { isServerLoggedIn: vi.fn() } }))

import auth from '@/lib/auth'

import ServerDown from '@/components/pages/ServerDown.vue'

const TARGET = '/productions/production-1/sequences'

const Page = { template: '<div />' }

let wrapper

const mountPage = async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: Page },
      { path: '/server-down', name: 'server-down', component: ServerDown },
      {
        path: '/productions/:production_id/sequences',
        name: 'sequences',
        component: Page
      }
    ]
  })
  await router.push({ name: 'server-down', query: { redirect: TARGET } })
  await router.isReady()
  wrapper = mount(
    { template: '<router-view />' },
    { global: { plugins: [router] } }
  )
  return router
}

describe('pages/ServerDown', () => {
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

  // App.vue mounts the page a second time while the redirect loads its
  // data. That copy answers once the requested page is open, and its route
  // then holds no redirect: pushing would send the user home.
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

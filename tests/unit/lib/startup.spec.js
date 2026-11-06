import { flushPromises } from '@vue/test-utils'
import { createApp, h as render, Teleport } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'
import { vi } from 'vitest'

import { startApp } from '@/lib/startup'

import { recordUnhandledRejections } from '../fixtures/unhandled-rejections'

const h = vi.hoisted(() => ({ load: null }))

// A chunk loads once: each test starts in a language of its own.
vi.mock('@/locales', async importOriginal => ({
  ...(await importOriginal()),
  localeLoaders: {
    de: () => h.load(),
    es: () => h.load(),
    fr: () => h.load()
  }
}))

const messages = { default: { default: { main: { cancel: 'Translated' } } } }

const Page = {
  render: () =>
    render(Teleport, { to: '#popups' }, [render('p', { class: 'popup' })])
}

const App = {
  render: () => [
    render(RouterView),
    render('div', { id: 'popups', class: 'root' })
  ]
}

describe('app start', () => {
  let app = null
  let router = null

  const isMounted = () => document.querySelector('.root') !== null

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
    app = createApp(App)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: Page }]
    })
  })

  afterEach(() => {
    app.unmount()
    vi.restoreAllMocks()
    localStorage.removeItem('locale')
  })

  test('mounts the app once the translations are in place', async () => {
    let land = null
    h.load = () =>
      new Promise(resolve => {
        land = () => resolve(messages)
      })
    localStorage.setItem('locale', 'fr_FR')

    const started = startApp(app, router)
    await flushPromises()
    expect(isMounted()).toBe(false)

    land()
    await started

    expect(isMounted()).toBe(true)
  })

  // A navigation ending first would render the page in the first pass of the
  // app, out of the document: its teleport would find no target, and leaving
  // the page would crash.
  test('renders the first page after the elements of the app', async () => {
    let land = null
    h.load = () =>
      new Promise(resolve => {
        land = () => resolve(messages)
      })
    localStorage.setItem('locale', 'de_DE')

    const started = startApp(app, router)
    await flushPromises()
    land()
    await started
    await router.isReady()
    await flushPromises()

    expect(document.querySelector('#popups .popup')).not.toBeNull()
  })

  test('mounts the app when the chunk fails', async () => {
    const failure = new Error('Failed to fetch dynamically imported module')
    h.load = () => Promise.reject(failure)
    localStorage.setItem('locale', 'es_ES')

    const rejections = await recordUnhandledRejections(() =>
      startApp(app, router)
    )

    expect(rejections).toEqual([failure])
    expect(isMounted()).toBe(true)
  })

  test('mounts the app when the storage fails', async () => {
    const failure = new Error('The operation is insecure.')
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw failure
    })

    await expect(startApp(app, router)).rejects.toBe(failure)

    expect(isMounted()).toBe(true)
  })
})

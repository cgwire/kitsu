import { createApp, h } from 'vue'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'

import { resetPluginPages } from '@/lib/plugins/navigation'
import { SHARED_GLOBAL } from '@/lib/plugins/shared'
import {
  activatePlugin,
  ensurePlugin,
  installPluginRuntime,
  parseDevUrls,
  resetPluginRuntime
} from '@/lib/plugins/runtime'
import { pluginStates, setHost } from '@/lib/plugins/state'

const Parent = { render: () => h('div') }

const buildHost = (plugins = []) => {
  const store = createStore({
    state: () => ({ plugins }),
    getters: {
      plugins: state => state.plugins
    }
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/plugins/:plugin_id',
        name: 'plugin',
        component: Parent
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: Parent
      }
    ]
  })

  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        main: { loading: 'Loading...' },
        plugins: {
          load_error: 'The {name} plugin could not be loaded.',
          page_not_found: 'This page does not exist in the {name} plugin.'
        }
      }
    }
  })

  const app = createApp({ render: () => h('div') })
  app.use(store)
  app.use(i18n)

  return { app, router, store, i18n, head: {} }
}

describe('plugin runtime', () => {
  afterEach(() => {
    resetPluginRuntime()
    resetPluginPages()
    setHost(null)
    delete globalThis[SHARED_GLOBAL]
  })

  test('parseDevUrls expands ports and origins to the default Vite entry', () => {
    expect(
      parseDevUrls(
        'tickets=5173,other=https://127.0.0.1:5175,custom=5176/src/main.js'
      )
    ).toEqual({
      tickets: 'http://127.0.0.1:5173/src/plugin.js',
      other: 'https://127.0.0.1:5175/src/plugin.js',
      custom: 'http://127.0.0.1:5176/src/main.js'
    })
  })

  test('ensurePlugin is a no-op when the plugin is not injected', async () => {
    const host = buildHost([
      { plugin_id: 'legacy', name: 'Legacy', injected: false }
    ])
    installPluginRuntime(host)

    await ensurePlugin(host.store.getters.plugins[0])

    expect(pluginStates.legacy).toBeUndefined()
    expect(globalThis[SHARED_GLOBAL]).toBeTruthy()
  })

  test('activatePlugin registers routes from the plugin definition', async () => {
    const host = buildHost([
      { plugin_id: 'tickets', name: 'Tickets', injected: true, version: '1' }
    ])
    installPluginRuntime(host)

    await activatePlugin(host.store.getters.plugins[0], {
      default: {
        activate: async context => {
          context.addRoutes({
            studio: [{ path: '', name: 'list', component: Parent }]
          })
        }
      }
    })

    expect(pluginStates.tickets).toEqual({ status: 'active', error: null })
    expect(host.router.hasRoute('tickets-plugin-list')).toBe(true)
  })

  test('activatePlugin records an error when activate throws', async () => {
    const host = buildHost([
      { plugin_id: 'broken', name: 'Broken', injected: true }
    ])
    installPluginRuntime(host)

    await activatePlugin(host.store.getters.plugins[0], {
      default: {
        activate: async () => {
          throw new Error('boom')
        }
      }
    })

    expect(pluginStates.broken).toEqual({ status: 'error', error: 'boom' })
  })
})

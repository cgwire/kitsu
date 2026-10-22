import { registerMessages, unregisterMessages } from '@/lib/plugins/i18n'
import {
  PLUGIN_PAGE_META_KEY,
  collectPluginPages,
  pickHostParams,
  registerPluginPages
} from '@/lib/plugins/navigation'
import {
  PLUGIN_SCOPE_PARENTS,
  pluginRouteName
} from '@/lib/plugins/route-names'

/** Stamped on every route the host registers for a plugin (kit-compatible). */
export const PLUGIN_CONTEXT_META_KEY = 'kitsuPlugin'

const asArray = value =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

const remapRoute = (record, pluginId, scope) => {
  const mapped = { ...record }

  // Empty-path children of a named parent need a name so Kitsu parent links
  // can redirect there, and to silence Vue Router's warning.
  const name = record.name ?? (record.path === '' ? 'index' : null)
  if (name) {
    mapped.name = pluginRouteName(pluginId, scope, name)
    mapped.meta = { ...mapped.meta, [PLUGIN_PAGE_META_KEY]: name }
  }

  // Named redirects must keep production_id / episode_id and refuse to
  // hijack a sibling plugin's URL (parent :plugin_id is a wildcard).
  const redirect = record.redirect
  if (typeof redirect === 'object' && redirect?.name) {
    const target = pluginRouteName(pluginId, scope, redirect.name)
    const parent = PLUGIN_SCOPE_PARENTS[scope]
    mapped.redirect = to =>
      to.params.plugin_id === pluginId
        ? {
            ...redirect,
            name: target,
            params: {
              ...pickHostParams(to.params),
              ...(redirect.params || {})
            }
          }
        : { name: parent, params: pickHostParams(to.params) }
  }

  if (record.children) {
    mapped.children = record.children.map(child =>
      remapRoute(child, pluginId, scope)
    )
  }

  return mapped
}

const scopeToPlugin = (record, pluginId, parent) => ({
  ...record,
  beforeEnter: [
    to =>
      to.params.plugin_id === pluginId
        ? undefined
        : {
            name: parent,
            params: pickHostParams(to.params),
            replace: true
          },
    ...asArray(record.beforeEnter)
  ]
})

export const createPluginContext = (host, plugin) => {
  const pluginId = plugin.plugin_id
  const cleanups = []
  let storeModuleName = null

  const context = {
    pluginId,
    manifest: plugin,
    app: host.app,
    router: host.router,
    store: host.store,
    i18n: host.i18n,
    head: host.head,

    get productionId() {
      return host.router.currentRoute.value.params.production_id ?? null
    },

    get episodeId() {
      return host.router.currentRoute.value.params.episode_id ?? null
    },

    get storeModuleName() {
      return storeModuleName
    },

    onCleanup: cleanup => {
      cleanups.push(cleanup)
    },

    addMessages: messages => {
      registerMessages(host.i18n, pluginId, messages)
      cleanups.push(() => unregisterMessages(pluginId))
    },

    registerStoreModule: (name, module) => {
      const wrapped = {
        ...module,
        namespaced: true,
        getters: {
          ...module.getters,
          pluginId: () => pluginId
        }
      }
      storeModuleName = name
      if (host.store.hasModule(name)) host.store.unregisterModule(name)
      host.store.registerModule(name, wrapped)
      cleanups.push(() => {
        if (storeModuleName === name) storeModuleName = null
        if (host.store.hasModule(name)) host.store.unregisterModule(name)
      })
    },

    addRoutes: routes => {
      const scopes = { ...routes }
      scopes.episode ??= scopes.production

      const pages = new Set()
      for (const records of Object.values(scopes)) {
        collectPluginPages(records, pages)
      }
      cleanups.push(registerPluginPages(pluginId, pages))

      for (const [scope, records] of Object.entries(scopes)) {
        const parent = PLUGIN_SCOPE_PARENTS[scope]
        if (!parent) {
          throw new Error(`Unknown plugin route scope "${scope}"`)
        }
        if (!host.router.hasRoute(parent)) continue

        for (const record of records ?? []) {
          const mapped = scopeToPlugin(
            remapRoute(record, pluginId, scope),
            pluginId,
            parent
          )
          mapped.meta = {
            ...mapped.meta,
            [PLUGIN_CONTEXT_META_KEY]: context
          }
          cleanups.push(host.router.addRoute(parent, mapped))
        }
      }
    }
  }

  const dispose = async () => {
    for (const cleanup of [...cleanups].reverse()) {
      try {
        await cleanup()
      } catch (error) {
        console.error(`[plugins] "${pluginId}" cleanup failed:`, error)
      }
    }
    cleanups.length = 0
  }

  return { context, dispose }
}

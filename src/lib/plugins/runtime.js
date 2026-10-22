import { watch } from 'vue'

import {
  PLUGIN_CONTEXT_META_KEY,
  createPluginContext
} from '@/lib/plugins/context'
import { installI18n } from '@/lib/plugins/i18n'
import {
  installPluginNavigation,
  paramsForNamedRoute
} from '@/lib/plugins/navigation'
import {
  PLUGIN_SCOPE_PARENTS,
  pluginRouteName
} from '@/lib/plugins/route-names'
import { publishSharedModules } from '@/lib/plugins/shared'
import {
  findPlugin,
  getHost,
  listInjectedPlugins,
  pluginStates,
  setHost
} from '@/lib/plugins/state'

import PluginPending from '@/components/pages/plugins/PluginPending.vue'

/** Dev Vite URLs that are down must not freeze the host router forever. */
const IMPORT_TIMEOUT_MS = 4_000

const active = new Map()
const inFlight = new Map()

/**
 * Default Vite serve entry when DEV_URLS gives only a port or an origin.
 * Matches `defineKitsuPluginConfig({ entry })` default (`src/plugin.js`).
 */
export const DEFAULT_DEV_ENTRY = '/src/plugin.js'

const DEFAULT_DEV_HOST = '127.0.0.1'

/** Bare port (`5175`) or `5175/src/custom.js`. */
const PORT_SPEC_RE = /^(\d+)(\/.*)?$/

/**
 * Normalize a DEV_URLS value to a full import URL:
 * - `5175` → `http://127.0.0.1:5175/src/plugin.js`
 * - `https://127.0.0.1:5175` → keeps the given scheme, adds default entry if needed
 * - full URL with path → left alone
 */
export const normalizeDevUrl = value => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return trimmed

  const portMatch = trimmed.match(PORT_SPEC_RE)
  if (portMatch) {
    const path = portMatch[2] || DEFAULT_DEV_ENTRY
    const pathname = path.startsWith('/') ? path : `/${path}`
    return `http://${DEFAULT_DEV_HOST}:${portMatch[1]}${pathname}`
  }

  try {
    const url = new URL(trimmed)
    if (url.pathname === '' || url.pathname === '/') {
      url.pathname = DEFAULT_DEV_ENTRY
    }
    return url.href
  } catch {
    return trimmed
  }
}

/** `my-plugin=5175` or `my-plugin=http://127.0.0.1:5173,...` → map */
export const parseDevUrls = spec => {
  const urls = {}
  for (const item of String(spec || '').split(',')) {
    const trimmed = item.trim()
    if (!trimmed) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    urls[trimmed.slice(0, separator)] = normalizeDevUrl(
      trimmed.slice(separator + 1)
    )
  }
  return urls
}

// Injected by vite.config.js from KITSU_PLUGIN_DEV_URLS (empty string when unset).
const DEV_URLS = parseDevUrls(
  typeof __KITSU_PLUGIN_DEV_URLS__ !== 'undefined'
    ? __KITSU_PLUGIN_DEV_URLS__
    : ''
)

const withTimeout = (promise, ms, message) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    )
  })

const importPluginModule = plugin => {
  const fromUrl = DEV_URLS[plugin.plugin_id]
  if (fromUrl) {
    return withTimeout(
      import(/* @vite-ignore */ fromUrl),
      IMPORT_TIMEOUT_MS,
      `dev server did not answer at ${fromUrl} within ${IMPORT_TIMEOUT_MS}ms`
    )
  }

  const version = encodeURIComponent(plugin.version ?? '')
  return withTimeout(
    import(
      /* @vite-ignore */
      `/api/plugins/${plugin.plugin_id}/frontend/plugin.js?v=${version}`
    ),
    IMPORT_TIMEOUT_MS,
    `plugin bundle at /api/plugins/${plugin.plugin_id}/frontend/plugin.js did not load`
  )
}

export const activatePlugin = async (plugin, module) => {
  const pluginId = plugin.plugin_id
  const host = getHost()
  if (!host) return

  pluginStates[pluginId] = { status: 'loading', error: null }

  try {
    const loaded = module ?? (await importPluginModule(plugin))
    const definition = loaded?.default

    if (typeof definition?.activate !== 'function') {
      throw new Error('the bundle does not default-export a plugin definition')
    }

    const handle = createPluginContext(host, plugin)
    try {
      await definition.activate(handle.context)
    } catch (error) {
      await handle.dispose()
      throw error
    }

    active.set(pluginId, { definition, ...handle })
    pluginStates[pluginId] = { status: 'active', error: null }
  } catch (error) {
    console.error(`[plugins] "${pluginId}" failed to activate:`, error)
    pluginStates[pluginId] = {
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Activates one injected plugin if needed. Concurrent calls share the same
 * in-flight promise. Failed loads are not retried until cleared (HMR).
 */
export const ensurePlugin = plugin => {
  const pluginId = plugin.plugin_id
  if (!plugin.injected) return Promise.resolve()
  if (active.has(pluginId)) return Promise.resolve()
  if (pluginStates[pluginId]?.status === 'error') return Promise.resolve()

  let pending = inFlight.get(pluginId)
  if (!pending) {
    pending = activatePlugin(plugin).finally(() => {
      inFlight.delete(pluginId)
    })
    inFlight.set(pluginId, pending)
  }
  return pending
}

const deactivatePlugin = async pluginId => {
  const entry = active.get(pluginId)
  if (!entry) return

  active.delete(pluginId)
  try {
    await entry.definition.deactivate?.(entry.context)
  } catch (error) {
    console.error(`[plugins] "${pluginId}" failed to deactivate:`, error)
  }
  await entry.dispose()

  document
    .querySelectorAll(`style[data-kitsu-plugin="${pluginId}"]`)
    .forEach(node => node.remove())

  delete pluginStates[pluginId]
}

export const activatePlugins = () => {
  for (const plugin of listInjectedPlugins()) {
    void ensurePlugin(plugin)
  }
}

const PARENT_NAMES = Object.values(PLUGIN_SCOPE_PARENTS)

const SCOPE_BY_PARENT = Object.fromEntries(
  Object.entries(PLUGIN_SCOPE_PARENTS).map(([scope, name]) => [name, scope])
)

const PENDING_SUFFIX = '-pending'

const isPendingName = name =>
  typeof name === 'string' && name.endsWith(PENDING_SUFFIX)

const PLUGIN_PATH_RE = /\/plugins\/([^/]+)(?:\/|$)/

const pluginIdOf = to => {
  const fromParams = to.params.plugin_id
  if (typeof fromParams === 'string' && fromParams) return fromParams
  if (Array.isArray(fromParams) && typeof fromParams[0] === 'string') {
    return fromParams[0]
  }
  return to.path.match(PLUGIN_PATH_RE)?.[1] ?? null
}

const ownerOf = location =>
  location.meta?.[PLUGIN_CONTEXT_META_KEY]?.pluginId ?? null

const ownedEmptyChildName = (host, pluginId, parent) => {
  const parentRecord = host.router
    .getRoutes()
    .find(route => route.name === parent)
  if (!parentRecord) return null

  for (const route of host.router.getRoutes()) {
    if (ownerOf(route) !== pluginId) continue
    if (!route.name || isPendingName(route.name)) continue
    if (route.path === parentRecord.path) return String(route.name)
  }
  return null
}

const defaultPluginLocation = (host, pluginId, to) => {
  const scope = SCOPE_BY_PARENT[String(to.name)]
  if (!scope) return null

  const parent = PLUGIN_SCOPE_PARENTS[scope]
  const indexName = pluginRouteName(pluginId, scope, 'index')
  const targetName = host.router.hasRoute(indexName)
    ? indexName
    : ownedEmptyChildName(host, pluginId, parent)
  if (!targetName) return null

  const record = host.router
    .getRoutes()
    .find(route => route.name === targetName)
  const redirect = record?.redirect
  if (typeof redirect === 'function') {
    const dest = redirect(to, to)
    if (dest && typeof dest === 'object') {
      return { ...dest, replace: true, force: true }
    }
  } else if (typeof redirect === 'string') {
    return { path: redirect, replace: true, force: true }
  } else if (redirect && typeof redirect === 'object') {
    return { ...redirect, replace: true, force: true }
  }

  return {
    name: targetName,
    params: paramsForNamedRoute(host.router, targetName, to.params)
  }
}

const installRoutes = host => {
  for (const parent of PARENT_NAMES) {
    if (!host.router.hasRoute(parent)) continue
    const pendingName = `${parent}${PENDING_SUFFIX}`
    if (host.router.hasRoute(pendingName)) continue
    host.router.addRoute(parent, {
      path: ':pluginPath(.*)+',
      name: pendingName,
      component: PluginPending
    })
  }
}

const installGuard = host => {
  host.router.beforeResolve(async to => {
    const pluginId = pluginIdOf(to)
    if (!pluginId) return true

    installRoutes(host)

    if (to.name === 'not-found') {
      const recovered = host.router.resolve(to.fullPath)
      if (recovered.name !== 'not-found') {
        return { path: to.fullPath, replace: true, force: true }
      }
      return true
    }

    const plugin = findPlugin(pluginId)
    if (!plugin?.injected) return true

    await ensurePlugin(plugin)

    const fromParent = defaultPluginLocation(host, pluginId, to)
    if (fromParent) return fromParent

    const resolved = host.router.resolve(to.fullPath)
    if (
      resolved.name &&
      resolved.name !== to.name &&
      resolved.name !== 'not-found' &&
      !isPendingName(resolved.name) &&
      (ownerOf(resolved) ?? pluginId) === pluginId
    ) {
      return { path: to.fullPath, replace: true, force: true }
    }

    return true
  })
}

/**
 * Wires the plugin runtime into Kitsu. Call before `app.use(router)` so the
 * catch-all deep-link children exist for the initial navigation.
 */
export const installPluginRuntime = host => {
  setHost(host)

  publishSharedModules()
  installI18n(host.i18n)
  installPluginNavigation(host.router)
  installRoutes(host)
  installGuard(host)

  watch(
    () => host.store.getters.plugins,
    () => {
      activatePlugins()
    },
    { immediate: true }
  )
}

if (import.meta.hot) {
  globalThis.__KITSU_PLUGIN_RELOAD__ = async (pluginId, module) => {
    const host = getHost()
    const plugin = findPlugin(pluginId)
    if (!plugin || !host) return

    const { fullPath } = host.router.currentRoute.value
    await deactivatePlugin(pluginId)
    delete pluginStates[pluginId]
    await activatePlugin(plugin, module)
    await host.router.replace({ path: fullPath, force: true })
  }
}

/** Test helpers */
export const resetPluginRuntime = () => {
  active.clear()
  inFlight.clear()
  for (const key of Object.keys(pluginStates)) {
    delete pluginStates[key]
  }
}

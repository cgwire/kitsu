import { pluginRouteName } from '@/lib/plugins/route-names'

/** Short page name declared by the plugin, stamped on the matched record. */
export const PLUGIN_PAGE_META_KEY = 'pluginPage'

const pagesByPlugin = new Map()

const isFilled = value => typeof value === 'string' && value.length > 0

const paramOf = (params, key) => {
  const value = params?.[key]
  if (isFilled(value)) return value
  if (Array.isArray(value) && isFilled(value[0])) return value[0]
  return undefined
}

const asParamBag = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

/**
 * Params owned by Kitsu plugin parents — keep them across short-name
 * navigations. Do not copy plugin page params (ticketId, …): Vue Router 5
 * discards keys that are not in the target path (VUE_ROUTER_R0100).
 */
export const HOST_PARAM_KEYS = ['plugin_id', 'production_id', 'episode_id']

const PATH_PARAM_RE = /:([A-Za-z0-9_]+)/g

export const pickHostParams = params => {
  const source = asParamBag(params)
  const next = {}
  for (const key of HOST_PARAM_KEYS) {
    if (source[key] != null) next[key] = source[key]
  }
  return next
}

export const pathParamNames = path => {
  const keys = new Set()
  if (typeof path !== 'string') return keys
  PATH_PARAM_RE.lastIndex = 0
  let match
  while ((match = PATH_PARAM_RE.exec(path))) {
    keys.add(match[1])
  }
  return keys
}

/**
 * Keep only params declared on the named route's path (parents included in
 * the normalized absolute path Vue Router exposes on the record).
 */
export const paramsForNamedRoute = (router, name, params) => {
  const source = asParamBag(params)
  if (typeof router?.getRoutes !== 'function') return source
  const record = router.getRoutes().find(route => route.name === name)
  if (!record?.path) return source
  const allowed = pathParamNames(record.path)
  if (allowed.size === 0) return {}
  const next = {}
  for (const [key, value] of Object.entries(source)) {
    if (allowed.has(key)) next[key] = value
  }
  return next
}

const inheritHostParams = (currentParams, targetParams) => {
  const next = { ...targetParams }
  for (const key of HOST_PARAM_KEYS) {
    if (next[key] == null && currentParams[key] != null) {
      next[key] = currentParams[key]
    }
  }
  return next
}

export const inferScope = params => {
  if (isFilled(paramOf(params, 'episode_id'))) return 'episode'
  if (isFilled(paramOf(params, 'production_id'))) return 'production'
  return 'studio'
}

const shortNameOf = record => {
  if (typeof record.name === 'string' && record.name) return record.name
  return record.path === '' ? 'index' : null
}

export const collectPluginPages = (records, into = new Set()) => {
  for (const record of records ?? []) {
    const name = shortNameOf(record)
    if (name) into.add(name)
    if (record.children) collectPluginPages(record.children, into)
  }
  return into
}

export const registerPluginPages = (pluginId, pages) => {
  let set = pagesByPlugin.get(pluginId)
  if (!set) {
    set = new Set()
    pagesByPlugin.set(pluginId, set)
  }
  const added = []
  for (const page of pages) {
    if (!set.has(page)) {
      set.add(page)
      added.push(page)
    }
  }
  return () => {
    const current = pagesByPlugin.get(pluginId)
    if (!current) return
    for (const page of added) current.delete(page)
    if (current.size === 0) pagesByPlugin.delete(pluginId)
  }
}

export const rewriteLocation = (router, to, currentLocation) => {
  if (typeof to !== 'object' || to === null) return to
  if (!('name' in to) || to.name == null) return to
  if ('path' in to && to.path) return to

  const name = to.name
  if (typeof name !== 'string') return to
  if (router.hasRoute(name)) return to

  const currentParams = asParamBag(
    currentLocation?.params ?? router.currentRoute.value.params
  )
  const targetParams = asParamBag('params' in to ? to.params : undefined)
  const merged = inheritHostParams(currentParams, targetParams)
  const pluginId = paramOf(merged, 'plugin_id')
  if (!pluginId) return to

  const pages = pagesByPlugin.get(pluginId)
  if (!pages?.has(name)) return to

  const scope = inferScope(merged)
  const routeName = pluginRouteName(pluginId, scope, name)
  return {
    ...to,
    name: routeName,
    params: paramsForNamedRoute(router, routeName, {
      ...merged,
      plugin_id: pluginId
    })
  }
}

/**
 * `createRouter()` closes push/replace over an internal resolve, so patching
 * `resolve` alone would leave `router.push` unrewritten. Wrap all three.
 */
export const installPluginNavigation = router => {
  const resolve = router.resolve.bind(router)
  const push = router.push.bind(router)
  const replace = router.replace.bind(router)

  router.resolve = (to, currentLocation) =>
    resolve(rewriteLocation(router, to, currentLocation), currentLocation)

  router.push = to => push(rewriteLocation(router, to))

  router.replace = to => replace(rewriteLocation(router, to))
}

/** Clears page registrations (tests). */
export const resetPluginPages = () => {
  pagesByPlugin.clear()
}

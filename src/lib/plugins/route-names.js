/**
 * Kitsu route each plugin scope hangs from. Keep in sync with the matching
 * `name`s in `src/router/routes.js`.
 */
export const PLUGIN_SCOPE_PARENTS = {
  studio: 'plugin',
  production: 'production-plugin',
  episode: 'episode-production-plugin'
}

/**
 * Global name for a plugin route declared as `name` in `scope`, e.g.
 * ('my-plugin', 'production', 'bank') -> my-plugin-production-plugin-bank.
 */
export const pluginRouteName = (pluginId, scope, name) => {
  const parent = PLUGIN_SCOPE_PARENTS[scope]
  if (!parent) {
    throw new Error(`Unknown Kitsu plugin route scope "${scope}".`)
  }
  return `${pluginId}-${parent}-${name}`
}

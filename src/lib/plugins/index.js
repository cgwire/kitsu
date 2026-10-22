/**
 * Injected frontend plugins: share the host Vue / Vuex / vue-router /
 * vue-i18n instances via the versioned `globalThis.__KITSU_SHARED__` contract
 * (prefer an import map longer term), register routes for deep links, and
 * fall back to the iframe when Zou reports `injected: false` (host-integration
 * bundle not detected).
 *
 * Install before `app.use(router)` so catch-all deep-link children exist for
 * the initial navigation.
 */
import { installPluginRuntime } from '@/lib/plugins/runtime'

export {
  PLUGIN_SCOPE_PARENTS,
  pluginRouteName
} from '@/lib/plugins/route-names'
export { SHARED_GLOBAL, publishSharedModules } from '@/lib/plugins/shared'

export { default as PluginHost } from '@/components/pages/plugins/PluginHost.vue'

export const installPlugins = (app, options) => {
  installPluginRuntime({ app, ...options })
}

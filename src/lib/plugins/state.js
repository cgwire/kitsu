import { reactive } from 'vue'

/** Reactive load status per plugin id, consumed by PluginHost / PluginPending. */
export const pluginStates = reactive({})

let host = null

export const setHost = value => {
  host = value
}

export const getHost = () => host

export const listInjectedPlugins = () =>
  (host?.store.getters.plugins ?? []).filter(plugin => plugin.injected)

export const findPlugin = pluginId =>
  (host?.store.getters.plugins ?? []).find(
    plugin => plugin.plugin_id === pluginId
  )

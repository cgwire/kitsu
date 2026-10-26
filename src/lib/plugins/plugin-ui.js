import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { findPlugin, getHost } from '@/lib/plugins/state'

export const usePluginId = () => {
  const route = useRoute()
  return computed(() => String(route.params.plugin_id ?? ''))
}

export const translate = (key, name) => {
  const t = getHost()?.i18n?.global?.t
  return t ? t(key, { name }) : key
}

export const pluginName = pluginId => findPlugin(pluginId)?.name ?? pluginId

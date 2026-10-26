<template>
  <!-- injected: Zou detected frontend/dist/plugin.js (host-integration bundle) -->
  <plugin-host v-if="plugin?.injected" class="plugin-page-host" />
  <div v-else-if="plugin" class="plugin-page page fixed-page">
    <iframe
      class="plugin-iframe"
      :src="pluginUrl"
      frameborder="0"
      allowfullscreen
      referrerpolicy="same-origin"
    ></iframe>
  </div>
  <p v-else class="has-text-centered mt2">
    {{ t('main.loading') }}
  </p>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

import PluginHost from '@/components/pages/plugins/PluginHost.vue'

// Composables
// --------------------------------------------------------------------------
const { t } = useI18n()
const route = useRoute()
const store = useStore()

// Computed
// --------------------------------------------------------------------------
const plugins = computed(() => store.getters.plugins || [])
const productionId = computed(() => route.params.production_id || '')
const episodeId = computed(() =>
  store.getters.isTVShow && productionId.value
    ? store.getters.currentEpisode?.id
    : ''
)
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const userLocale = computed(() => {
  const locale = store.state.user.user?.locale || 'en'
  return locale.substring(0, 2)
})

const pluginUrl = computed(() => {
  const baseUrl = `/api/plugins/${route.params.plugin_id}/frontend/`
  const params = new URLSearchParams()

  if (productionId.value) {
    params.append('production_id', productionId.value)
  }
  if (episodeId.value) {
    params.append('episode_id', episodeId.value)
  }
  if (isDarkTheme.value) {
    params.append('dark_theme', isDarkTheme.value)
  }
  if (userLocale.value) {
    params.append('locale', userLocale.value)
  }

  return `${baseUrl}?${params.toString()}`
})

const plugin = computed(() =>
  plugins.value.find(entry => entry.plugin_id === route.params.plugin_id)
)

// Head
// --------------------------------------------------------------------------
useHead({
  title: computed(() => {
    if (plugin.value) {
      return `Kitsu | ${plugin.value.name}`
    }
    return 'Kitsu | Plugin'
  })
})
</script>

<style lang="scss" scoped>
.plugin-page {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}

.plugin-page-host {
  padding: 5rem 1rem;
}

.plugin-iframe {
  background-color: $white;
  flex: 1;
  width: 100%;
  border: none;
  padding: 0;
  margin: 0;
}
</style>

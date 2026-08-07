<template>
  <div class="plugin-page page fixed-page">
    <iframe
      class="plugin-iframe"
      :src="pluginUrl"
      frameborder="0"
      allowfullscreen
      referrerpolicy="same-origin"
    ></iframe>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { computed } from 'vue'
import { useHead } from '@unhead/vue'

const route = useRoute()
const store = useStore()

const plugins = computed(() => store.getters.studioPlugins || [])
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

const plugin = computed(() => {
  return plugins.value.find(
    plugin => plugin.plugin_id === route.params.plugin_id
  )
})

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

.plugin-iframe {
  background-color: $white;
  flex: 1;
  width: 100%;
  border: none;
  padding: 0;
  margin: 0;
}
</style>

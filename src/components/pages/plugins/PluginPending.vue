<template>
  <p v-if="isSettled" class="plugin-pending-message">
    {{ translate('plugins.page_not_found', name) }}
  </p>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'

import { pluginName, translate, usePluginId } from '@/lib/plugins/plugin-ui'
import { pluginStates } from '@/lib/plugins/state'

// Composables
// --------------------------------------------------------------------------
const pluginId = usePluginId()

// Computed
// --------------------------------------------------------------------------
const isSettled = computed(
  () => pluginStates[pluginId.value]?.status !== 'loading'
)
const name = computed(() => pluginName(pluginId.value))
</script>

<style lang="scss" scoped>
.plugin-pending-message {
  color: var(--text);
  padding: 1em 0;
}
</style>

<template>
  <div class="plugin-host">
    <p v-if="state?.status === 'error'" class="plugin-host-message is-error">
      {{ translate('plugins.load_error', name) }}
      <span class="plugin-host-detail">{{ state.error ?? '' }}</span>
    </p>
    <p v-else-if="state?.status !== 'active'" class="plugin-host-message">
      {{ translate('main.loading', name) }}
    </p>
    <router-view v-else />
  </div>
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
const state = computed(() => pluginStates[pluginId.value])
const name = computed(() => pluginName(pluginId.value))
</script>

<style lang="scss" scoped>
.plugin-host-message {
  color: var(--text);
  padding: 1em 0;

  &.is-error {
    color: $red;
  }
}

.plugin-host-detail {
  color: var(--text-alt);
  display: block;
  font-size: 0.9em;
  margin-top: 0.3em;
}
</style>

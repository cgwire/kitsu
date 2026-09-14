<template>
  <div class="has-text-centered pa05">
    {{ activeAssets.length }}
    {{ $t('assets.number', { count: activeAssets.length }) }}
    <template v-if="timeSpent > 0 || estimation > 0">
      ({{ formatDuration(timeSpent) }}
      {{
        $t(isDurationInHours ? 'main.hours_spent' : 'main.days_spent', {
          count: formatDuration(timeSpent, false)
        })
      }},
      {{ formatDuration(estimation) }}
      {{
        $t(isDurationInHours ? 'main.hours_estimated' : 'main.man_days', {
          count: formatDuration(estimation, false)
        })
      }})
    </template>
  </div>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'

import { useFormat } from '@/composables/format'

const { formatDuration, isDurationInHours } = useFormat()

// Props
// --------------------------------------------------------------------------
const props = defineProps({
  assets: { type: Array, default: () => [] }
})

// Computed
// --------------------------------------------------------------------------
const activeAssets = computed(() =>
  props.assets.flat().filter(asset => !asset.canceled)
)

const timeSpent = computed(() =>
  activeAssets.value.reduce((acc, asset) => acc + (asset.timeSpent || 0), 0)
)

const estimation = computed(() =>
  activeAssets.value.reduce((acc, asset) => acc + (asset.estimation || 0), 0)
)
</script>

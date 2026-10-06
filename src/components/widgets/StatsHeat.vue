<template>
  <div
    class="stats-heat"
    :style="{ '--heat': intensity }"
    :title="`${done} / ${total}`"
    v-if="total > 0"
  >
    <span class="share">{{ roundPercent(ratio) }}%</span>
  </div>
</template>

<script setup>
/**
 * Progress of a statistics cell as a heatmap tile: the share of done statuses,
 * on a background that gets more intense as that share grows.
 * Data format: [['name', value, 'color', isDone], ...]
 */
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'

import { getDoneRatio, roundPercent } from '@/lib/stats'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  data: { type: Array, default: () => [] }
})

// Computed
// --------------------------------------------------------------------------
const total = computed(() =>
  props.data.reduce((sum, row) => sum + (row[1] || 0), 0)
)

const ratio = computed(() => getDoneRatio(props.data))

const done = computed(() => Math.round(ratio.value * total.value))

// Never fully transparent nor fully opaque: a 0% tile stays visible and the
// text stays readable on a 100% one, in both themes.
const intensity = computed(() => 0.1 + 0.7 * ratio.value)
</script>

<style lang="scss" scoped>
.stats-heat {
  border-radius: 4px;
  color: var(--text);
  font-weight: bold;
  padding: 0.6em 0;
  position: relative;
  text-align: center;

  // The tint sits on its own layer so its opacity does not fade the text.
  &::before {
    background: $green;
    border-radius: inherit;
    bottom: 0;
    content: '';
    left: 0;
    opacity: var(--heat);
    position: absolute;
    right: 0;
    top: 0;
  }
}

.share {
  position: relative;
}
</style>

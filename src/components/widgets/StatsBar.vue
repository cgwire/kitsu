<template>
  <div class="stats-bar flexrow" v-if="segments.length > 0">
    <div class="bar" role="img" :aria-label="summary">
      <span
        class="segment"
        :key="index"
        :style="{ flexGrow: segment.value, backgroundColor: segment.color }"
        :title="segment.title"
        v-for="(segment, index) in segments"
      ></span>
    </div>
    <span class="done-share">{{ donePercent }}%</span>
  </div>
</template>

<script setup>
/**
 * Status split of a statistics cell as a 100% stacked bar, with the share of
 * done statuses written next to it.
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

const segments = computed(() =>
  props.data
    .filter(row => row[1] > 0)
    .map(([name, value, color]) => ({
      value,
      color,
      title: `${name}: ${value} (${roundPercent(value / total.value)}%)`
    }))
)

const summary = computed(() =>
  segments.value.map(segment => segment.title).join(', ')
)

const donePercent = computed(() => roundPercent(getDoneRatio(props.data)))
</script>

<style lang="scss" scoped>
.bar {
  display: flex;
  flex: 1;
  gap: 2px;
  height: 12px;
  border-radius: 4px;
  overflow: hidden;
}

.segment {
  flex-basis: 0;
  min-width: 2px;
}

.done-share {
  color: var(--text);
  font-size: 0.9em;
  margin-left: 0.5em;
  min-width: 2.8em;
  text-align: right;
}
</style>

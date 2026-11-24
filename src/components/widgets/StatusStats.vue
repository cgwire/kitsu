<template>
  <ul class="status-stats">
    <li
      class="stat"
      :key="stat.name"
      :title="`${stat.name}: ${stat.value}`"
      v-for="stat in stats"
    >
      <validation-tag
        class="stat-name"
        is-static
        :is-priority="false"
        :task="{ task_status_id: stat.status.id }"
      />
      <span class="stat-value">{{ stat.value }}</span>
      <span class="stat-track">
        <span
          class="stat-bar"
          :style="{
            background: stat.color,
            width: `${(stat.value / statMax) * 100}%`
          }"
        ></span>
      </span>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'

import ValidationTag from '@/components/widgets/ValidationTag.vue'

const props = defineProps({
  stats: { type: Array, default: () => [] }
})

const statMax = computed(() =>
  props.stats.reduce((max, stat) => Math.max(stat.value, max), 0)
)
</script>

<style lang="scss" scoped>
.status-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  // a global ul rule indents lists by 14px
  margin: 0;
  text-align: left;
  width: 100%;
}

.stat {
  align-items: center;
  display: grid;
  gap: 6px 8px;
  grid-template-columns: 1fr auto;
}

.stat-name {
  justify-self: start;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  color: var(--text-strong);
  font-size: 0.9em;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.stat-track {
  background: var(--background);
  border-radius: 3px;
  grid-column: 1 / -1;
  height: 6px;
  overflow: hidden;
}

.stat-bar {
  border-radius: 3px;
  display: block;
  height: 100%;
}
</style>

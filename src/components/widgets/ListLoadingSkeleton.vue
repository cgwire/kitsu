<template>
  <div class="list-loading-skeleton">
    <div
      class="skeleton-row"
      :style="{
        '--row-index': i - 1,
        '--fadeout-delay': `${fadeoutDelayMs}ms`,
        '--peak-opacity': peakOpacity(i)
      }"
      :key="`skeleton-row-${cycle}-${i}`"
      v-for="i in rows"
    >
      <span class="skeleton-block thumbnail" v-if="withThumbnail" />
      <span class="skeleton-block name" />
      <span
        class="skeleton-block cell"
        :class="{ big: bigCells }"
        :key="`c-${i}-${j}`"
        v-for="j in cells"
      />
      <span class="skeleton-block actions" v-if="withActions" />
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'

import { useSkeletonCycle } from '@/composables/skeleton'

const props = defineProps({
  rows: { type: Number, default: 8 },
  cells: { type: Number, default: 6 },
  withThumbnail: { type: Boolean, default: true },
  withActions: { type: Boolean, default: true },
  bigCells: { type: Boolean, default: false }
})

const { cycle, fadeoutDelayMs } = useSkeletonCycle(toRef(props, 'rows'))

const peakOpacity = i => {
  const fromEnd = props.rows - i
  if (fromEnd === 0) return 0.25
  if (fromEnd === 1) return 0.5
  if (fromEnd === 2) return 0.75
  return 1
}
</script>

<style lang="scss" scoped>
.list-loading-skeleton {
  display: flex;
  flex-direction: column;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.4);
  opacity: 0;
  animation:
    skeleton-row-in 0.4s ease-out forwards,
    skeleton-row-out 0.35s ease-in forwards;
  animation-delay: calc(var(--row-index) * 150ms), var(--fadeout-delay);
}

.skeleton-block {
  display: inline-block;
  height: 12px;
  border-radius: 8px;
  background: rgba(var(--skeleton-rgb), 0.45);

  &.thumbnail {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  &.name {
    width: 220px;
    flex-shrink: 0;
  }

  &.cell {
    width: 100px;
    flex-shrink: 0;

    &.big {
      width: 130px;
      height: 22px;
    }
  }

  &.actions {
    width: 60px;
    margin-left: auto;
    flex-shrink: 0;
  }
}

@keyframes skeleton-row-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: var(--peak-opacity, 1);
    transform: translateY(0);
  }
}

@keyframes skeleton-row-out {
  from {
    opacity: var(--peak-opacity, 1);
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-row {
    animation: none;
    opacity: 1;
  }
}
</style>

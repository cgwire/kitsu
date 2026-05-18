<template>
  <div class="kanban-loading-skeleton">
    <div
      class="skeleton-column"
      :key="`skeleton-col-${cycle}-${c}`"
      v-for="c in columns"
    >
      <span class="skeleton-block column-header" />
      <div
        class="skeleton-card"
        :style="{
          '--row-index': i - 1,
          '--fadeout-delay': `${fadeoutDelayMs}ms`,
          '--peak-opacity': peakOpacity(i)
        }"
        :key="`skeleton-card-${cycle}-${c}-${i}`"
        v-for="i in cards"
      >
        <div class="card-header">
          <span class="skeleton-block avatar" />
          <span class="skeleton-block name" />
        </div>
        <span class="skeleton-block desc" />
        <span class="skeleton-block badge" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'

import { useSkeletonCycle } from '@/composables/skeleton'

const props = defineProps({
  columns: { type: Number, default: 4 },
  cards: { type: Number, default: 3 }
})

const { cycle, fadeoutDelayMs } = useSkeletonCycle(toRef(props, 'cards'))

const peakOpacity = i => {
  const fromEnd = props.cards - i
  if (fromEnd === 0) return 0.5
  if (fromEnd === 1) return 0.75
  return 1
}
</script>

<style lang="scss" scoped>
.kanban-loading-skeleton {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: flex-start;
}

.skeleton-column {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--border-rgb), 0.15);
  border-radius: 8px;
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(var(--border-rgb), 0.2);
  opacity: 0;
  animation:
    skeleton-card-in 0.4s ease-out forwards,
    skeleton-card-out 0.35s ease-in forwards;
  animation-delay: calc(var(--row-index) * 150ms), var(--fadeout-delay);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-block {
  display: inline-block;
  height: 12px;
  border-radius: 8px;
  background: rgba(var(--skeleton-rgb), 0.45);

  &.column-header {
    width: 60%;
    margin-bottom: 4px;
  }

  &.avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.name {
    flex: 1;
    height: 10px;
  }

  &.desc {
    width: 80%;
    height: 8px;
  }

  &.badge {
    width: 50px;
    height: 14px;
  }
}

@keyframes skeleton-card-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: var(--peak-opacity, 1);
    transform: translateY(0);
  }
}

@keyframes skeleton-card-out {
  from {
    opacity: var(--peak-opacity, 1);
  }
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card {
    animation: none;
    opacity: 1;
  }
}
</style>

<template>
  <div class="loading-skeleton">
    <div
      class="skeleton-card timeline-entry"
      :style="{
        '--row-index': i - 1,
        '--fadeout-delay': `${fadeoutDelayMs}ms`
      }"
      :key="`skeleton-${cycle}-${i}`"
      v-for="i in rows"
    >
      <span class="dot"></span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { useSkeletonCycle } from '@/composables/skeleton'

const props = defineProps({
  rows: { type: Number, default: 6 }
})

const { cycle, fadeoutDelayMs } = useSkeletonCycle(ref(props.rows))
</script>

<style lang="scss" scoped>
.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  margin-top: 2em;
  padding-top: 1em;
}

.skeleton-card {
  animation:
    skeleton-card-in 0.4s ease-out forwards,
    skeleton-card-out 0.35s ease-in forwards;
  animation-delay: calc(var(--row-index) * 150ms), var(--fadeout-delay);
  background: rgba(var(--skeleton-rgb), 0.45);
  border-radius: 0.5em;
  height: 48px;
  opacity: 0;
  position: relative;
}

.skeleton-card .dot {
  background: $blue-light;
  border-radius: 4px;
  height: 9px;
  left: -34px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 9px;
}

.dark .skeleton-card {
  background: rgba(var(--skeleton-rgb), 0.15);
}

.dark .skeleton-card .dot {
  background: $blue;
}

@keyframes skeleton-card-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeleton-card-out {
  from {
    opacity: 1;
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

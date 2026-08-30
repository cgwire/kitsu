<template>
  <p class="has-text-centered nb-tasks">
    {{ stats.total }}
    {{ $t('tasks.number', { count: stats.total }) }}
    ({{ formatDuration(stats.total_duration) }}
    {{
      isDurationInHours
        ? $t('main.hours_spent', {
            count: formatDuration(stats.total_duration, false)
          })
        : $t('main.days_spent', {
            count: formatDuration(stats.total_duration, false)
          })
    }}
    /
    {{ formatDuration(stats.total_estimation) }}
    {{
      isDurationInHours
        ? $t('main.hours_estimated', {
            count: formatDuration(stats.total_estimation, false)
          })
        : $t('main.days_estimated', {
            count: formatDuration(stats.total_estimation, false)
          })
    }})
  </p>
</template>

<script setup>
import { useFormat } from '@/composables/format'

// Composables
const { formatDuration, isDurationInHours } = useFormat()

// Props
defineProps({
  stats: {
    type: Object,
    default: () => ({ total: 0, total_duration: 0, total_estimation: 0 })
  }
})
</script>

<style lang="scss" scoped>
.nb-tasks {
  padding: 0.5em;
}
</style>

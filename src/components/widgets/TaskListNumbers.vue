<template>
  <p class="has-text-centered nb-tasks">
    {{ tasks.length }} {{ $t('tasks.number', { count: tasks.length }) }} ({{
      formatDuration(timeEstimated)
    }}
    {{
      isDurationInHours
        ? $t('main.hours_estimated', {
            count: formatDuration(timeEstimated, false)
          })
        : $t('main.days_estimated', {
            count: formatDuration(timeEstimated, false)
          })
    }},
    {{ formatDuration(timeSpent) }}
    {{
      isDurationInHours
        ? $t('main.hours_spent', { count: formatDuration(timeSpent, false) })
        : $t('main.days_spent', { count: formatDuration(timeSpent, false) })
    }}<span v-if="isShots && !isPaperProduction"
      >, {{ nbFrames }} {{ $t('main.nb_frames', { count: nbFrames }) }}</span
    >
    <span v-if="isShots && isPaperProduction"
      >, {{ nbDrawings }}
      {{ $t('main.nb_drawings', { count: nbDrawings }) }}</span
    >)
  </p>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { minutesToDays } from '@/lib/time'
import shotStore from '@/store/modules/shots'

const store = useStore()

const props = defineProps({
  isShots: {
    default: false,
    type: Boolean
  },
  tasks: {
    default: () => [],
    type: Array
  }
})

const isPaperProduction = computed(() => store.getters.isPaperProduction)
const organisation = computed(() => store.getters.organisation)

const isDurationInHours = computed(() => {
  return organisation.value.format_duration_in_hours
})

const formatDuration = (minutes, toLocale = true) => {
  if (!minutes) {
    return 0
  }

  const duration = organisation.value.format_duration_in_hours
    ? minutes / 60
    : minutesToDays(organisation.value, minutes)

  if (toLocale) {
    return duration.toLocaleString('fullwide', {
      maximumFractionDigits: 2
    })
  }
  return Math.round(duration * 100) / 100
}

const shotMap = computed(() => {
  return shotStore.cache.shotMap
})

const timeSpent = computed(() => {
  return props.tasks.reduce((acc, task) => acc + task.duration, 0)
})

const timeEstimated = computed(() => {
  return props.tasks.reduce((acc, task) => acc + task.estimation, 0)
})

const nbFrames = computed(() => {
  return props.tasks.reduce((acc, task) => {
    const entity = shotMap.value.get(task.entity.id)
    if (entity && entity.nb_frames) acc += entity.nb_frames
    return acc
  }, 0)
})

const nbDrawings = computed(() => {
  return props.tasks.reduce((acc, task) => acc + task.nb_drawings, 0)
})
</script>

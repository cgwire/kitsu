<template>
  <p class="has-text-centered nb-tasks">
    {{ tasks.length }} {{ $tc('tasks.number', tasks.length) }} ({{
      formatDuration(timeEstimated)
    }}
    {{
      isDurationInHours
        ? $tc('main.hours_estimated', formatDuration(timeEstimated, false))
        : $tc('main.days_estimated', formatDuration(timeEstimated, false))
    }},
    {{ formatDuration(timeSpent) }}
    {{
      isDurationInHours
        ? $tc('main.hours_spent', formatDuration(timeSpent, false))
        : $tc('main.days_spent', formatDuration(timeSpent, false))
    }}<span v-if="isShots && !isPaperProduction"
      >, {{ nbFrames }} {{ $tc('main.nb_frames', nbFrames) }}</span
    >
    <span v-if="isShots && isPaperProduction"
      >, {{ nbDrawings }} {{ $tc('main.nb_drawings', nbDrawings) }}</span
    >)
  </p>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatListMixin } from '@/components/mixins/format'
import shotStore from '@/store/modules/shots'

export default {
  name: 'checkbox',

  mixins: [formatListMixin],

  props: {
    isShots: {
      default: false,
      type: Boolean
    },
    tasks: {
      default: () => [],
      type: Array
    }
  },

  data() {
    return {}
  },

  computed: {
    ...mapGetters(['isPaperProduction']),

    shotMap() {
      return shotStore.cache.shotMap
    },

    timeSpent() {
      return this.tasks.reduce((acc, task) => acc + task.duration, 0)
    },

    timeEstimated() {
      return this.tasks.reduce((acc, task) => acc + task.estimation, 0)
    },

    isTimeSpentPlural() {
      return this.timeSpent
    },

    isTimeEstimatedPlural() {
      return this.timeEstimated
    },

    nbFrames() {
      return this.tasks.reduce((acc, task) => {
        const entity = this.shotMap.get(task.entity.id)
        if (entity && entity.nb_frames) acc += entity.nb_frames
        return acc
      }, 0)
    },

    nbDrawings() {
      return this.tasks.reduce((acc, task) => acc + task.nb_drawings, 0)
    }
  },

  methods: {}
}
</script>

<style scoped></style>

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
    }}<span v-if="isShots"
      >, {{ nbFrames }} {{ $tc('main.nb_frames', nbFrames) }}</span
    >)
  </p>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatListMixin } from '@/components/mixins/format'

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

  mounted() {},

  computed: {
    ...mapGetters(['shotMap']),

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
      let total = 0
      this.tasks.forEach(task => {
        const entity = this.shotMap.get(task.entity.id)
        if (entity && entity.nb_frames) total += entity.nb_frames
      })
      return total
    },

    nbDrawings() {
      return this.tasks.reduce((acc, task) => acc + task.nb_drawings, 0)
    }
  },

  methods: {}
}
</script>

<style scoped></style>

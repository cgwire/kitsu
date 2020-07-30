<template>
<router-link
  :to="taskTypePath"
  v-if="productionId"
>
  <span
    class="tag task-type-name"
    :style="{ 'border-left': '4px solid ' + color }"
  >
    {{ taskType.name }}
  </span>
</router-link>
<div
  class="tag task-type-name no-link"
  :style="{ 'border-left': '4px solid ' + color }"
  v-else
>
  {{ taskType.name }}
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'task-type-name',
  components: {
  },

  props: {
    taskType: {
      type: Object,
      default: null
    },
    productionId: {
      type: String,
      default: null
    }
  },

  computed: {
    ...mapGetters([
    ]),

    color () {
      if (this.taskType.color.toUpperCase() === '#000000') return '$grey-strong'
      else return this.taskType.color
    },

    taskTypePath () {
      const route = {
        name: 'task-type',
        params: {
          production_id: this.productionId,
          task_type_id: this.taskType.id,
          type: this.taskType.for_shots ? 'shots' : 'assets'
        }
      }

      if (this.taskType.episode_id || this.$route.params.episode_id) {
        route.name = 'episode-task-type'
        route.params.episode_id =
          this.taskType.episode_id || this.$route.params.episode_id
      }
      return route
    }

  },

  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style lang="scss" scoped>
.tag {
  margin: 0;
  padding: 0 0.7em;
  font-size: 0.9em;
  line-height: 0.8em;
  color: $grey-strong;
  border-radius: 0;
  font-weight: bold;
}

.dark .tag {
  color: $white-grey;
  background: $dark-grey-lightest;
}

.no-link {
}
</style>

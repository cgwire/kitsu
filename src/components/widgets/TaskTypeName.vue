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
  props: [
    'taskType',
    'productionId'
  ],
  computed: {
    ...mapGetters([
    ]),

    color () {
      if (this.taskType.color.toUpperCase() === '#000000') return '#666'
      else return this.taskType.color
    },

    taskTypePath () {
      let route = {
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

<style scoped>
.tag {
  margin: 0;
  padding: 0 0.7em;
  font-size: 0.9em;
  line-height: 0.8em;
  color: #666;
  border-radius: 0;
  font-weight: bold;
}

.dark .tag {
  color: #EEEEEE;
  background: #5E6169;
}

.no-link {
  cursor: default
}
</style>

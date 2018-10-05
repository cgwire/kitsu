<template>
<span>
  <router-link
    :to="taskPath(task)"
    class="tag dynamic"
    v-if="!isStatic && !isCurrentUserClient"
    :style="{
      background: this.backgroundColor,
      color: this.color,
  }">
    {{ taskStatus.short_name }}
  </router-link>

  <span
    class="tag"
    v-else
    :style="{
      background: this.backgroundColor,
      color: this.color,
  }">
    {{ taskStatus.short_name }}
  </span>

  <span class="priority" v-if="isPriority && !isCurrentUserClient">
    {{ priority }}
  </span>
</span>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'validation-tag',
  props: {
    task: {
      default: () => {},
      type: Object
    },
    isStatic: {
      default: false,
      type: Boolean
    },
    isPriority: {
      default: true,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isTVShow',
      'taskMap',
      'taskStatusMap',
      'taskTypeMap',
      'isCurrentUserClient'
    ]),

    taskStatus () {
      if (this.task) {
        const taskStatusId = this.task.task_status_id
        return this.taskStatusMap ? this.taskStatusMap[taskStatusId] : {}
      } else {
        return {}
      }
    },

    backgroundColor () {
      return this.taskStatus.color
    },

    color () {
      if (this.taskStatus.short_name !== 'todo') {
        return 'white'
      } else {
        return '#333'
      }
    },

    priority () {
      if (
        this.task.priority &&
        !this.taskStatus.is_done
      ) {
        if (this.task.priority === 3) {
          return '!!!'
        } else if (this.task.priority === 2) {
          return '!!'
        } else if (this.task.priority === 1) {
          return '!'
        }
      } else {
        return ''
      }
    }
  },

  methods: {
    taskPath (task) {
      let route = {
        name: 'task',
        params: {
          production_id: this.currentProduction.id,
          task_id: task.id
        }
      }

      if (this.isTVShow && this.currentEpisode) {
        route.name = 'episode-task'
        route.params.episode_id = task.episode_id || this.currentEpisode.id
      }

      const taskType = this.taskTypeMap[task.task_type_id]
      route.params.type = taskType.for_shots ? 'shots' : 'assets'

      return route
    }
  }
}
</script>

<style scoped>
.tag {
  text-transform: uppercase;
  cursor: default;
}

.tag.dynamic:hover {
  cursor: pointer;
  transform: scale(1.15);
  transition: all 0.1s ease-in-out;
}

.priority {
  color: red;
}
</style>

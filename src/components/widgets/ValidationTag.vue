<template>
<span>
<span v-if="!minimized">
  <router-link
    :to="taskPath(task)"
    class="tag dynamic"
    v-if="!isStatic && !isCurrentUserClient"
    :style="{
      background: this.backgroundColor,
      color: this.color
  }">
    {{ taskStatus.short_name }}
  </router-link>

  <span
    class="tag"
    :style="{
      background: this.backgroundColor,
      color: this.color,
    }"
    v-else
  >
    {{ taskStatus.short_name }}
  </span>
  <span class="priority" v-if="isPriority && !isCurrentUserClient">
    {{ priority }}
  </span>
</span>
<span v-else>
  <router-link
    :to="taskPath(task)"
    class="tag dynamic"
    v-if="!isStatic && !isCurrentUserClient"
    :style="{
      background: this.backgroundColor,
      color: this.color,
  }">
     &nbsp;
  </router-link>

  <span
    class="tag"
    :style="{
      background: this.backgroundColor,
      color: this.color,
    }"
    v-else
  >
    &nbsp;
  </span>
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
    },
    minimized: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'isDarkTheme',
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
      if (this.taskStatus.short_name === 'todo' && this.isDarkTheme) {
        return '#5F626A'
      } else {
        return this.taskStatus.color
      }
    },

    color () {
      if (this.taskStatus.short_name !== 'todo' || this.isDarkTheme) {
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
      const productionId =
        this.task.project_id ? this.task.project_id : this.currentProduction.id
      let route = {
        name: 'task',
        params: {
          production_id: productionId,
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

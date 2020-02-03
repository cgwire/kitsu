<template>
<span>
  <span v-if="!minimized">
    <router-link
      :to="taskPath(task)"
      class="tag dynamic"
      v-if="!isStatic && !isCurrentUserClient"
      :style="{
        background: backgroundColor,
        color: color
    }">
      {{ taskStatus.short_name }}
    </router-link>

    <span
      class="tag"
      :style="{
        background: backgroundColor,
        color: color,
        cursor: cursor
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
        background: backgroundColor,
        color: color
    }">
       &nbsp;
    </router-link>

    <span
      class="tag"
      :style="{
        background: backgroundColor,
        color: color,
        cursor: cursor
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
import colors from '../../lib/colors'

/*
    isDarkTheme: {
      default: false,
      type: Boolean
    },
    isCurrentUserClient: {
      default: false,
      type: Boolean
    },
    personMap: {
      default: () => {},
      type: Object
    },
    taskMap: {
      default: () => {},
      type: Object
    },
    taskStatusMap: {
      default: () => {},
      type: Object
    }
    */

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
    },
    pointer: {
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

    cursor () {
      return this.pointer ? 'pointer' : 'default'
    },

    taskStatus () {
      if (this.task) {
        const taskStatusId = this.task.task_status_id
        return this.taskStatusMap ? this.taskStatusMap[taskStatusId] : {}
      } else {
        return {}
      }
    },

    backgroundColor () {
      if (this.taskStatus.short_name === 'todo' && !this.isDarkTheme) {
        return '#ECECEC'
      } else if (this.taskStatus.short_name === 'todo' && this.isDarkTheme) {
        return '#5F626A'
      } else if (this.isDarkTheme) {
        return colors.darkenColor(this.taskStatus.color)
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
        } else {
          return ''
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
      const route = {
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

<style lang="scss" scoped>
.tag {
  text-transform: uppercase;
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

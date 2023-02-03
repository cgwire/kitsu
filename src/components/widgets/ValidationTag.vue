<template>
<span>
  <span v-if="!minimized">
    <router-link
      class="tag dynamic"
      :to="taskPath(task)"
      :style="tagStyle"
      :title="taskStatus.name"
      v-if="!isStatic && !isCurrentUserClient"
    >
      {{ taskStatus.short_name }}
    </router-link>

    <span
      class="tag"
      :style="tagStyle"
      :title="taskStatus.name"
      @click="($event) => $emit('click', $event)"
      v-else
    >
      {{ taskStatus.short_name }}
    </span>
    <span
      :class="{
        priority: true,
        high: task.priority === 1,
        veryhigh: task.priority === 2,
        emergency: task.priority === 3
      }"
      :title="formatPriority(task.priority)"
      v-if="isPriority && !isCurrentUserClient && task.priority > 0"
    >
      {{ priority }}
    </span>

  </span>
  <span v-else>
    <router-link
      :to="taskPath(task)"
      class="tag dynamic"
      :style="tagStyle"
      :title="taskStatus.name"
      v-if="!isStatic && !isCurrentUserClient"
    >
       &nbsp;
    </router-link>
    <span
      class="tag"
      v-else
    >
      &nbsp;
    </span>
  </span>
</span>
</template>

<script>
import { mapGetters } from 'vuex'
import colors from '@/lib/colors'

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
    },
    thin: {
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
        return this.taskStatusMap ? this.taskStatusMap.get(taskStatusId) : {}
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
      const isTodo = this.taskStatus.name === 'Todo'
      if (!isTodo || this.isDarkTheme) {
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
    },

    tagStyle () {
      const isStatic = !this.isStatic && !this.isCurrentUserClient
      const isTodo = this.taskStatus.name === 'Todo'
      if (this.thin && !isTodo) {
        if (this.isDarkTheme) {
          return {
            background: 'transparent',
            border: '1px solid ' + (isTodo
              ? 'grey'
              : colors.lightenColor(this.backgroundColor, 0.5)
            ),
            color: colors.lightenColor(this.backgroundColor, 0.5),
            cursor: isStatic ? 'pointer' : this.cursor
          }
        } else {
          return {
            background: 'transparent',
            border: '1px solid ' + (isTodo ? 'grey' : this.backgroundColor),
            color: this.backgroundColor,
            cursor: isStatic ? 'pointer' : this.cursor
          }
        }
      } else {
        return {
          background: this.backgroundColor,
          color: this.color,
          cursor: isStatic ? 'pointer' : this.cursor
        }
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

      const taskType = this.taskTypeMap.get(task.task_type_id)
      route.params.type = this.$tc(taskType.for_entity.toLowerCase(), 2)

      return route
    },

    formatPriority (priority) {
      let label = priority + ''
      if (priority === 0) {
        label = 'normal'
      } else if (priority === 1) {
        label = this.$t('tasks.priority.high')
      } else if (priority === 2) {
        label = this.$t('tasks.priority.very_high')
      } else if (priority === 3) {
        label = this.$t('tasks.priority.emergency')
      }
      return label
    }
  }
}
</script>

<style lang="scss" scoped>
.tag {
  letter-spacing: 1px;
  margin-right: 0.1em;
  text-transform: uppercase;
}

.tag.dynamic:hover {
  cursor: pointer;
  transform: scale(1.15);
  transition: all 0.1s ease-in-out;
}

.priority {
  border-radius: 50%;
  display: inline-block;
  color: white;
  margin-left: 5px;
  font-weight: bold;
  min-width: 23px;
  text-align: center;
}

.high {
  background: $yellow;
}

.veryhigh {
  background: $orange;
}

.emergency {
  background: $red;
}
</style>

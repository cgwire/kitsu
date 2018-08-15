<template>
<span>
  <router-link
    :to="'/tasks/' + task.id"
    :class="{
      tag: true,
      dynamic: !isStatic
    }"
    :style="{
      background: this.backgroundColor,
      color: this.color,
  }">
    {{ task.task_status_short_name }}
  </router-link>
  <span class="priority" v-if="priority">
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
      'taskStatusMap'
    ]),

    backgroundColor () {
      if (this.task.task_status_short_name === 'wtg') {
        return '#f5f5f5'
      } else if (this.task.task_status_short_name === 'ip') {
        return '#3273dc'
      } else if (this.task.task_status_short_name === 'pndng') {
        return '#ab26ff'
      } else if (this.task.task_status_short_name === 'fin') {
        return '#22d160'
      } else if (this.task.task_status_short_name === 'rtk') {
        return '#ff3860'
      } else if (this.task.task_status_short_name === 'cfrm') {
        return '#f1c40f'
      } else if (this.task.task_status_short_name === 'recd') {
        return '#1abc9c'
      }
      return this.task.task_status_color
    },

    color () {
      if (this.task.task_status_short_name !== 'todo' &&
          this.task.task_status_short_name !== 'wtg') {
        return 'white'
      } else {
        return '#333'
      }
    },

    priority () {
      if (
        this.task.priority &&
        !this.taskStatusMap[this.task.task_status_id].is_done
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
  transition: all 0.1s ease-in-out
}

.priority {
  color: red;
}
</style>

<template>
<router-link
  :to="'/tasks/' + task.id"
  class="tag"
  :style="{
    background: task.task_status_color,
    color: task.task_status_short_name !== 'todo' ? 'white' : '#333'
}">
  {{ task.task_status_short_name }}
</router-link>
</template>

<script>
export default {
  name: 'title',
  props: {
    task: {
      default: 'button',
      type: Object
    }
  }
}
</script>

<style scoped>
.tag {
  text-transform: uppercase;
}

.tag:hover {
  transform: scale(1.15);
  transition: all 0.1s ease-in-out
}
</style>

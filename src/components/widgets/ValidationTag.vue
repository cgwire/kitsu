<template>
<span
  class="tag"
  :style="{
    background: task.task_status_color,
    color: task.task_status_name !== 'todo' ? 'white' : '#333'
}">
  {{ task.task_status_name }}
</span>
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
</style>

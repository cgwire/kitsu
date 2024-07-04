<template>
  <td class="name">
    <task-type-name
      :task-type="taskType"
      :production-id="productionId"
      :task-id="taskId"
      :disable="disable"
    />
  </td>
</template>

<script>
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

export default {
  name: 'task-type-cell',

  components: {
    TaskTypeName
  },

  props: {
    taskId: {
      type: String,
      default: null
    },
    taskType: {
      type: Object,
      default: null
    },
    productionId: {
      type: String,
      default: null
    },
    disable: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.tag {
  margin: 0.7em;
  padding: 1em;
  font-size: 1em;
  color: var(--text);
  border-radius: 0;
  font-weight: bold;
}
</style>

<template>
  <td class="name">
    <task-type-name
      :task-type="taskType"
      :production-id="productionId"
      :task-id="taskId"
      :disable="disable"
      :is-link="false"
    />
  </td>
</template>

<script setup>
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

defineProps({
  disable: { type: Boolean, default: false },
  productionId: { type: String, default: null },
  taskId: { type: String, default: null },
  taskType: { type: Object, default: null }
})
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

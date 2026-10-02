<template>
  <combobox-visible-options
    :hidden="hidden"
    :label="label"
    :options="options"
    @update:hidden="$emit('update:hidden', $event)"
  >
    <template #option="{ option }">
      <task-type-name :task-type="option.taskType" :is-link="false" />
    </template>
  </combobox-visible-options>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'

import ComboboxVisibleOptions from '@/components/widgets/ComboboxVisibleOptions.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  hidden: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  taskTypes: { type: Array, default: () => [] }
})

defineEmits(['update:hidden'])

// Computed
// --------------------------------------------------------------------------
const options = computed(() =>
  props.taskTypes.map(taskType => ({
    label: taskType.name,
    value: taskType.id,
    taskType
  }))
)
</script>

<template>
  <div>
    <label class="label" v-if="label">{{ label }}</label>
    <combobox-options
      :title="title"
      :options="options"
      :model-value="selectionMap"
      @change="onSelectionChanged"
    >
      <template #option="{ option }">
        <span
          class="tag"
          :style="{
            background: backgroundColor(option.status),
            color: color(option.status)
          }"
          :title="option.status.name"
        >
          {{ option.label }}
        </span>
      </template>
    </combobox-options>
  </div>
</template>

<script setup>
/**
 * Dropdown of switches choosing several task statuses. An empty selection
 * means no status filter, hence the "all" title.
 */
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTaskStatusStyle } from '@/composables/taskStatus'

import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'

const { t } = useI18n()
const { backgroundColor, color } = useTaskStatusStyle()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: Array, default: () => [] },
  taskStatusList: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:model-value'])

// Computed
// --------------------------------------------------------------------------
const options = computed(() =>
  props.taskStatusList.map(status => ({
    label: status.short_name,
    value: status.id,
    status
  }))
)

const selectionMap = computed(() =>
  Object.fromEntries(
    props.taskStatusList.map(({ id }) => [id, props.modelValue.includes(id)])
  )
)

const title = computed(() => {
  const names = props.taskStatusList
    .filter(({ id }) => props.modelValue.includes(id))
    .map(status => status.short_name)
  if (names.length > 1)
    return `(${names.length}/${props.taskStatusList.length})`
  return names[0] ?? t('main.all')
})

// Functions
// --------------------------------------------------------------------------
const onSelectionChanged = ({ key, value }) => {
  const selection = { ...selectionMap.value, [key]: value }
  emit(
    'update:model-value',
    props.taskStatusList.map(({ id }) => id).filter(id => selection[id])
  )
}
</script>

<style lang="scss" scoped>
.tag {
  text-transform: uppercase;
}
</style>

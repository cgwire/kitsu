<template>
  <div>
    <label class="label" v-if="label">{{ label }}</label>
    <combobox-options
      :title="title"
      :options="options"
      :model-value="selectionMap"
      @change="onSelectionChanged"
    />
  </div>
</template>

<script setup>
/**
 * Dropdown of switches choosing several options. An empty selection means
 * no filter, hence the "all" title.
 */
// Imports
// --------------------------------------------------------------------------
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ComboboxOptions from '@/components/widgets/ComboboxOptions.vue'

const { t } = useI18n()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:model-value'])

// Computed
// --------------------------------------------------------------------------
const selectionMap = computed(() =>
  Object.fromEntries(
    props.options.map(({ value }) => [value, props.modelValue.includes(value)])
  )
)

const title = computed(() => {
  const labels = props.options
    .filter(({ value }) => props.modelValue.includes(value))
    .map(option => option.label)
  if (labels.length > 1) return `(${labels.length}/${props.options.length})`
  return labels[0] ?? t('main.all')
})

// Functions
// --------------------------------------------------------------------------
const onSelectionChanged = ({ key, value }) => {
  const selection = { ...selectionMap.value, [key]: value }
  emit(
    'update:model-value',
    props.options.map(option => option.value).filter(id => selection[id])
  )
}
</script>

<template>
  <div>
    <label class="label" v-if="label">{{ label }}</label>
    <combobox-options
      :title="title"
      :options="options"
      :model-value="visibilityMap"
      @change="onVisibilityChanged"
    >
      <template #option="{ option }" v-if="$slots.option">
        <slot name="option" :option="option" />
      </template>
    </combobox-options>
  </div>
</template>

<script setup>
/**
 * Dropdown of switches choosing which options are visible. Everything is
 * visible by default: the model only lists the values the user hid, so it
 * stays valid when the options change.
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
  hidden: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:hidden'])

// Computed
// --------------------------------------------------------------------------
const visibilityMap = computed(() =>
  Object.fromEntries(
    props.options.map(({ value }) => [value, !props.hidden.includes(value)])
  )
)

const title = computed(() => {
  const total = props.options.length
  const visible = Object.values(visibilityMap.value).filter(Boolean).length
  return visible === total ? t('main.all') : `(${visible}/${total})`
})

// Functions
// --------------------------------------------------------------------------
const onVisibilityChanged = ({ key, value }) => {
  emit(
    'update:hidden',
    value ? props.hidden.filter(id => id !== key) : [...props.hidden, key]
  )
}
</script>

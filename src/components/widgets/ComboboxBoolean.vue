<template>
  <combobox
    :label="label"
    :disabled="disabled"
    :options="booleanOptions"
    :model-value="modelValue"
    @update:model-value="emitValue"
    @enter="emitEnter"
  />
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import Combobox from '@/components/widgets/Combobox.vue'

const { t } = useI18n()

defineProps({
  label: {
    default: '',
    type: String
  },

  modelValue: {
    default: 'false',
    type: String
  },

  disabled: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['enter', 'update:modelValue'])

const booleanOptions = [
  { label: t('main.yes'), value: 'true' },
  { label: t('main.no'), value: 'false' }
]

const emitValue = (value) => {
  emit('update:modelValue', value)
}

const emitEnter = (value) => {
  emit('enter', value)
}
</script>

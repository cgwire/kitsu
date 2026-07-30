<template>
  <div :class="{ field: withMargin }">
    <label class="label" v-if="label">
      {{ label }}
    </label>
    <multiselect
      class="multiselect-field"
      multiple
      :close-on-select="false"
      :disabled="disabled"
      :options="options"
      :placeholder="placeholder"
      :show-labels="false"
      v-model="selection"
    >
      <template #noResult></template>
    </multiselect>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  // Plain strings: this widget is meant for simple vocabularies, not for
  // objects needing a custom rendering.
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  withMargin: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:model-value'])

const selection = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:model-value', value ?? [])
  }
})
</script>

<style lang="scss" scoped>
.multiselect-field {
  min-width: 200px;
  width: 200px;
}
</style>

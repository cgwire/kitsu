<template>
  <div class="field">
    <label class="label" v-if="label">{{ label }}</label>
    <p class="control">
      <textarea
        ref="inputRef"
        class="input"
        :class="`input ${inputClass}`"
        :placeholder="placeholder"
        :type="type"
        :value="modelValue"
        @input="updateValue"
        @keyup.enter="emitEnter"
        @keyup="emitKeyup"
      />
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  label: {
    default: '',
    type: String
  },
  modelValue: {
    default: '',
    type: String
  },
  placeholder: {
    default: '',
    type: String
  },
  type: {
    default: 'text',
    type: String
  },
  inputClass: {
    default: '',
    type: String
  }
})

const emit = defineEmits(['enter', 'keyup', 'update:modelValue'])

const inputRef = ref(null)

const emitEnter = () => {
  emit('enter', inputRef.value.value)
}

const updateValue = () => {
  emit('update:modelValue', inputRef.value.value)
}

const emitKeyup = event => {
  emit('keyup', event)
}

const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<style lang="scss" scoped>
.field {
  display: flex;
  flex-direction: column;
}

.control {
  flex: 1;
}

textarea {
  height: 100%;
  min-height: 8em;
  max-height: 100%;
  padding: 0.8em;
}
</style>

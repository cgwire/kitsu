<template>
  <div class="field">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <div class="flexrow">
      <span
        :key="option.label"
        :class="{
          choice: true,
          'flexrow-item': true,
          selected: selectedOption.value === option.value
        }"
        @click="selectOption(option)"
        v-for="option in options"
      >
        {{ getOptionLabel(option) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  label: {
    default: '',
    type: String
  },
  options: {
    default: () => [],
    type: Array
  },
  modelValue: {
    default: '',
    type: String
  },
  localeKeyPrefix: {
    default: '',
    type: String
  }
})

const emit = defineEmits(['update:modelValue'])

const selectedOption = ref({
  label: '',
  value: ''
})

const selectOption = option => {
  emit('update:modelValue', option.value)
  selectedOption.value = option
}

const getOptionLabel = option => {
  if (props.localeKeyPrefix && option.label) {
    return t(props.localeKeyPrefix + option.label.toLowerCase())
  }
  return option.label
}

const resetOptions = () => {
  if (props.options.length > 0) {
    const option = props.options.find(o => o.value === props.modelValue)
    if (option) {
      selectedOption.value = option
    } else {
      selectedOption.value = props.options[0]
    }
  }
}

onMounted(() => {
  resetOptions()
})

watch(
  () => props.options,
  () => {
    resetOptions()
  }
)

watch(
  () => props.modelValue,
  () => {
    selectedOption.value = props.options.find(o => o.value === props.modelValue)
  }
)
</script>

<style lang="scss" scoped>
.choice {
  align-items: center;
  border: 2px solid var(--border);
  border-radius: 25px;
  color: $grey;
  cursor: pointer;
  display: inline-block;
  font-size: 0.9em;
  font-weight: 500;
  padding: 0.5em 1.2em;
  text-transform: uppercase;
  transition: 0.3s ease all;

  &.selected {
    color: $light-green;
    border: 2px solid $light-green;
  }
}
</style>

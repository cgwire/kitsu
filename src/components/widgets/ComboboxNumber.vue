<template>
  <div class="field" v-if="!isSimple">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <p class="control">
      <span
        :class="{
          select: true
        }"
      >
        <select
          class="select-input"
          ref="selectRef"
          :disabled="disabled"
          @keyup.enter="emitEnter()"
          @change="updateValue"
        >
          <option
            :key="i + '-' + option.label + '-' + option.value"
            :value="
              option.value !== null && option.value !== undefined
                ? option.value
                : option.label
            "
            :selected="modelValue === option.value"
            v-for="(option, i) in options"
          >
            {{ getOptionLabel(option) }}
          </option>
        </select>
      </span>
    </p>
  </div>
  <span class="select" v-else>
    <select
      class="select-input"
      ref="selectRef"
      @keyup.enter="emitEnter()"
      @change="updateValue"
    >
      <option
        :key="i + '-' + option.label + '-' + option.value"
        :value="option.value || option.label"
        :selected="modelValue === option.value"
        v-for="(option, i) in options"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
  </span>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  label: {
    default: '',
    type: String
  },
  modelValue: {
    default: 0,
    type: Number
  },
  options: {
    default: () => [],
    type: Array
  },
  localeKeyPrefix: {
    default: '',
    type: String
  },
  isSimple: {
    default: false,
    type: Boolean
  },
  disabled: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['enter', 'update:modelValue'])

const selectRef = ref(null)

function updateValue() {
  emit('update:modelValue', parseInt(selectRef.value.value))
}

function emitEnter() {
  emit('enter', parseInt(selectRef.value.value))
}

function getOptionLabel(option) {
  if (props.localeKeyPrefix && option.label) {
    return t(props.localeKeyPrefix + option.label.toLowerCase())
  }
  return option.label
}
</script>

<style lang="scss" scoped>
.dark select:disabled {
  background: $dark-grey;
  border-color: $dark-grey-strong;
}

.select-input {
  height: 3em;
}

.select::after {
  border: 1px solid $green;
  border-right: 0;
  border-top: 0;
  margin-top: -2px;
}

.select.is-top::after {
  border: 2px solid $green;
  border-right: 0;
  border-top: 0;
  margin-top: -4px;
}
</style>

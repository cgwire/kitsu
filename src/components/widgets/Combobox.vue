<template>
  <div :class="{ field: withMargin, 'is-inline': isInline }">
    <label class="label" v-if="label.length > 0">
      {{ label }}
    </label>
    <p class="control" :class="{ 'is-inline': isInline }">
      <span class="select" :class="{ 'is-top': isTop }">
        <select
          class="combobox select-input"
          :class="{
            thin,
            error
          }"
          :style="{
            width: width ? `${width}px` : undefined
          }"
          ref="select"
          :disabled="disabled"
          @keyup.enter="emitEnter()"
          @change="updateValue"
        >
          <template
            v-for="(option, index) in options"
            :key="`${index}-${option.label}-${option.value}`"
          >
            <option
              :value="option.label || option.value"
              :selected="modelValue === option.value || null"
              :disabled="option.disabled"
            >
              {{ getOptionLabel(option) }}
            </option>
            <hr v-if="option.separator" />
          </template>
        </select>
      </span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'combobox',

  props: {
    label: {
      default: '',
      type: String
    },
    modelValue: {
      default: '',
      type: [Object, String, Boolean, Number]
    },
    options: {
      default: () => [],
      type: Array
    },
    localeKeyPrefix: {
      default: '',
      type: String
    },
    isTop: {
      default: false,
      type: Boolean
    },
    disabled: {
      default: false,
      type: Boolean
    },
    error: {
      default: false,
      type: Boolean
    },
    thin: {
      default: false,
      type: Boolean
    },
    width: {
      type: Number
    },
    withMargin: {
      default: true,
      type: Boolean
    },
    isInline: {
      default: false,
      type: Boolean
    }
  },

  emits: ['enter', 'update:modelValue'],

  methods: {
    updateValue() {
      let value = this.$refs.select.value
      this.options.forEach(option => {
        if (option.label === value) {
          value = option.value
        }
      })
      this.$emit('update:modelValue', value)
    },

    emitEnter() {
      let value = this.$refs.select.value
      this.options.forEach(option => {
        if (option.label === value) {
          value = option.value
        }
      })
      this.$emit('enter', value)
    },

    getOptionLabel(option) {
      if (this.localeKeyPrefix && option.label) {
        return this.$t(this.localeKeyPrefix + option.label.toLowerCase())
      }
      return option.label
    },

    focus() {
      this.$refs.select?.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.dark select:disabled {
  background: $dark-grey;
  border-color: $dark-grey-strong;
}

.is-top select {
  font-size: 1.2em;
  border: 0;
  border-bottom: 1px solid $light-grey;
  border-radius: 0;
  height: 38px;
}

.is-top select:focus {
  border-color: $green;
  outline: 0;
}

.select-input {
  height: 3em;

  &.thin {
    height: 2.1em;
  }
}

.select {
  height: auto;
}
.select::after {
  border: 1px solid $green;
  border-right: 0;
  border-top: 0;
  margin-top: -4px;
}

.select.is-top::after {
  border: 2px solid $green;
  border-right: 0;
  border-top: 0;
  margin-top: -4px;
}

.error {
  border-color: $red;
}
</style>

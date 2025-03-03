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
          ref="select"
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
      ref="select"
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

<script>
export default {
  name: 'combobox-number',

  props: {
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
  },

  emits: ['enter', 'update:modelValue'],

  methods: {
    updateValue() {
      this.$emit('update:modelValue', parseInt(this.$refs.select.value))
    },

    emitEnter() {
      this.$emit('enter', parseInt(this.$refs.select.value))
    },

    getOptionLabel(option) {
      if (this.localeKeyPrefix && option.label) {
        return this.$t(this.localeKeyPrefix + option.label.toLowerCase())
      }
      return option.label
    }
  }
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

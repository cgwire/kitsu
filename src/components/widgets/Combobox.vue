<template>
<div class="field">
  <label class="label" v-if="label.length > 0">
    {{ label }}
  </label>
  <p class="control">
    <span
      :class="{
        select: true,
        'is-top': this.isTop
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
          v-for="(option, i) in options"
          :key="`${i}-${option.label}-${option.value}`"
          :value="option.value || option.label"
          :selected="value === option.value"
        >
          {{ getOptionLabel(option) }}
        </option>
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
    value: {
      default: '',
      type: String
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
    }
  },

  computed: {
  },

  methods: {
    updateValue () {
      this.$emit('input', this.$refs.select.value)
    },

    emitEnter () {
      this.$emit('enter', this.$refs.select.value)
    },

    getOptionLabel (option) {
      if (this.localeKeyPrefix.length > 0) {
        return this.$t(this.localeKeyPrefix + option.label.toLowerCase())
      } else {
        return option.label
      }
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
</style>

<template>
<div class="field">
  <label class="label" v-if="label.length > 0">
    {{ label }}
  </label>
  <p class="control">
    <span
      :class="{
        select: true,
        'is-top': this.isTop,
        'is-dark': this.isDark
      }"
    >
      <select
        class="select-input"
        ref="select"
        @keyup.enter="emitEnter()"
        @change="updateValue"
      >
        <option
          v-for="(option, i) in options"
          :key="i + '-' + option.label + '-' + option.value"
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
      type: [String, Boolean]
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
    isDark: {
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

<style scoped>
.is-top select {
  font-size: 1.2em;
  border: 0;
  border-bottom: 1px solid #CCC;
  border-radius: 0;
  height: 38px;
}

.is-top select:focus {
  border-color: #00B242;
  outline: 0;
}

.is-top:after {
  border: 2px solid #00B242;
  border-right: 0;
  border-top: 0;
}

.select-input {
  height: 31px;
}
</style>

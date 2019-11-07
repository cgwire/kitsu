<template functional>
<div class="field">
  <label class="label" v-if="props.label.length > 0">
    {{ props.label }}
  </label>
  <p class="control">
    <span
      :class="{
        select: true,
        'is-top': props.isTop
      }"
    >
      <select
        class="select-input"
        ref="select"
        :disabled="props.disabled"
        @change="(event, value) => listeners.input(event.target.value)"
      >
        <option
          v-for="(option, i) in props.options"
          :key="`${i}-${option.label}-${option.value}`"
          :value="option.value || option.label"
          :selected="value === option.value"
        >
          {{ option.label }}
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
  }
}
</script>

<style lang="scss">
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

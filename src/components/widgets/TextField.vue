<template>
  <div class="field" :class="{ 'is-inline': isInline }">
    <label class="label" v-if="label">{{ label }}</label>
    <label class="label empty-label" v-if="emptyLabel">&nbsp;</label>
    <p
      class="control"
      :class="{
        'is-inline': isInline,
        flexrow: !isInline
      }"
    >
      <input
        ref="input"
        :class="
          errored
            ? 'input flexrow-item errored' + inputClass
            : 'input flexrow-item' + inputClass
        "
        :autocomplete="autocomplete"
        :disabled="disabled"
        :maxlength="maxlength"
        :min="type === 'number' ? min || 0 : undefined"
        :max="max || undefined"
        :placeholder="placeholder"
        :readonly="readonly"
        :required="required"
        :step="step || type === 'number' ? 'any' : undefined"
        :type="type"
        :value="modelValue"
        @input="updateValue()"
        @keyup.enter="emitEnter()"
      />
      <button
        class="button flexrow-item"
        @click="emitEnter()"
        v-if="buttonLabel"
      >
        {{ buttonLabel }}
      </button>
      <span class="unit flexrow-item" v-if="unitLabel">
        {{ unitLabel }}
      </span>
    </p>
    <p class="error" v-if="errored">
      {{ errorText }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'text-field',

  props: {
    autocomplete: {
      type: String
    },
    disabled: {
      default: false,
      type: Boolean
    },
    label: {
      type: String
    },
    modelModifiers: {
      default: () => ({})
    },
    modelValue: {
      type: [String, Number]
    },
    placeholder: {
      type: [String, Number]
    },
    type: {
      type: String
    },
    inputClass: {
      default: '',
      type: String
    },
    buttonLabel: {
      type: String
    },
    min: {
      default: 0,
      type: Number
    },
    max: {
      type: Number
    },
    maxlength: {
      type: Number
    },
    step: {
      type: Number
    },
    isInline: {
      default: false,
      type: Boolean
    },
    errored: {
      default: false,
      type: Boolean
    },
    errorText: {
      default: '',
      type: String
    },
    emptyLabel: {
      default: false,
      type: Boolean
    },
    readonly: {
      default: false,
      type: Boolean
    },
    required: {
      default: false,
      type: Boolean
    },
    unitLabel: {
      type: String
    }
  },

  emits: ['enter', 'update:modelValue'],

  methods: {
    getInputValue() {
      const input = this.$refs.input
      if (this.type === 'number') {
        return !isNaN(input.valueAsNumber) ? input.valueAsNumber : null
      } else {
        if (this.modelModifiers.trim && typeof input.value === 'string') {
          return input.value.trim()
        }
        return input.value
      }
    },

    emitEnter() {
      this.$emit('enter', this.getInputValue())
    },

    updateValue() {
      this.$emit('update:modelValue', this.getInputValue())
    },

    focus() {
      this.$refs.input.focus()
    },

    checkValidity() {
      return this.$refs.input.checkValidity()
    }
  }
}
</script>
<style lang="scss" scoped>
.input.is-size-2 {
  width: 3rem;
}

.input.is-size-3 {
  width: 3.5rem;
}

.input.is-size-4 {
  width: 5rem;
}

.input.is-small {
  height: 2rem;
  font-size: 1rem;
  padding: 0 0.5rem;
}

input.input {
  font-size: 1.2em;
  border-radius: 10px;
}
input.input.thin {
  height: 2.4em;
}

.flexrow-item {
  margin: 0;
}

.button {
  font-size: 1.2em;
  margin-left: 0.5rem;
}

.unit {
  margin-left: 0.5rem;
}

.input:invalid,
.input.errored {
  border-color: $red;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

.empty-label {
  opacity: 0;
}
</style>

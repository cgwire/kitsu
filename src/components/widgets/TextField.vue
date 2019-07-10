<template>
<div class="field">
  <label class="label" v-if="label">{{ label }}</label>
  <p class="control flexrow">
    <input
      :class="'input flexrow-item' + inputClass"
      ref="input"
      :placeholder="placeholder"
      :type="type"
      :value="value"
      :disabled="disabled"
      min="0"
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
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'text-field',
  props: {
    disabled: {
      default: false,
      type: Boolean
    },
    label: {
      default: '',
      type: String
    },
    value: {
      default: '',
      type: [String, Number]
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
    },
    buttonLabel: {
      default: '',
      type: String
    }
  },

  computed: {
    ...mapGetters([
    ])
  },

  methods: {
    ...mapActions([
    ]),

    emitEnter () {
      this.$emit('enter', this.$refs.input.value)
    },

    updateValue () {
      this.$emit('input', this.$refs.input.value)
    },

    focus () {
      this.$refs.input.focus()
    }
  }
}
</script>
<style lang="scss" scoped>
input.input {
  font-size: 1.2em;
}

.flexrow-item {
  margin: 0;
}

button {
  font-size: 1.2em;
}
</style>

<template>
<div class="field">
  <label class="label">{{ label }}</label>
  <p class="control">
    <input
      :class="'input ' + inputClass"
      ref="input"
      :placeholder="placeholder"
      :type="type"
      :value="value"
      min="0"
      @input="updateValue()"
      @keyup.enter="emitEnter()"
    />
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'text-field',
  props: {
    label: {
      default: '',
      type: String
    },
    value: {
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
<style scoped>
input.input {
  font-size: 1.2em;
}
</style>

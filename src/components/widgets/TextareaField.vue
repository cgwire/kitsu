<template>
<div class="field">
  <label class="label" v-if="label">{{ label }}</label>
  <p class="control">
    <textarea
      ref="input"
      class="input"
      :class="'input ' + inputClass"
      :placeholder="placeholder"
      :type="type"
      :value="value"
      @input="updateValue"
      @keyup.enter="emitEnter"
      @keyup="emitKeyup"
    />
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'textarea-field',
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
    emitKeyup (event) {
      this.$emit('keyup', event)
    },
    focus () {
      if (this.$refs.input) this.$refs.input.focus()
    }
  }
}
</script>
<style lang="scss" scoped>
.field {
  display: flex;
  flex-direction: column;
}

.control {
  flex: 1;
}

textarea {
  height: 100%;
  min-height: 8em;
  max-height: 100%;
  padding: 0.8em;
}
</style>

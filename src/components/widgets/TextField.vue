<template>
<div class="field">
  <label class="label">{{ label }}</label>
  <p class="control">
    <input
      class="input"
      ref="input"
      :placeholder="placeholder"
      :type="type"
      :value="value"
      @input="updateValue()"
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
    }
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    updateValue () {
      this.$emit('input', this.$refs.input.value)
    }
  }
}
</script>

<style scoped>
</style>

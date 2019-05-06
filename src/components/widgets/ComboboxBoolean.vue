<template>
<combobox

  :label="label"
  :disabled="disabled"
  :options="booleanOptions"
  :value="value"
  @input="emitValue"
  @enter="emitEnter"
/>
</template>

<script>
import Combobox from '../widgets/Combobox'

export default {
  name: 'combobox-boolean',

  components: {
    Combobox
  },

  props: {
    label: {
      default: '',
      type: String
    },

    value: {
      default: 'false',
      type: String
    },

    options: {
      default: () => [],
      type: Array
    },

    disabled: {
      default: false,
      type: Boolean
    }
  },

  data () {
    return {
      booleanOptions: [
        { label: this.$t('main.yes'), value: 'true' },
        { label: this.$t('main.no'), value: 'false' }
      ]
    }
  },

  computed: {
  },

  methods: {
    emitValue (value) {
      this.$emit('input', value)
    },
    emitEnter (value) {
      this.$emit('enter', value)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

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
import Combobox from '@/components/widgets/Combobox.vue'

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

    disabled: {
      default: false,
      type: Boolean
    }
  },

  data() {
    return {
      booleanOptions: [
        { label: this.$t('main.yes'), value: 'true' },
        { label: this.$t('main.no'), value: 'false' }
      ]
    }
  },

  methods: {
    emitValue(value) {
      this.$emit('input', value)
    },
    emitEnter(value) {
      this.$emit('enter', value)
    }
  }
}
</script>

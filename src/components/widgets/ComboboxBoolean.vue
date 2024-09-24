<template>
  <combobox
    :label="label"
    :disabled="disabled"
    :options="booleanOptions"
    :model-value="modelValue"
    @update:model-value="emitValue"
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

    modelValue: {
      default: 'false',
      type: String
    },

    disabled: {
      default: false,
      type: Boolean
    }
  },

  emits: ['enter', 'update:modelValue'],

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
      this.$emit('update:modelValue', value)
    },

    emitEnter(value) {
      this.$emit('enter', value)
    }
  }
}
</script>

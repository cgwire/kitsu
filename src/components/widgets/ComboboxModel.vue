<template>
  <combobox
    :label="label"
    :disabled="disabled"
    :options="modelOptions"
    :model-value="currentModelId"
    @update:model-value="emitValue"
    @enter="emitEnter"
  />
</template>

<script>
import Combobox from '@/components/widgets/Combobox.vue'

export default {
  name: 'combobox-model',

  components: {
    Combobox
  },

  props: {
    label: {
      default: '',
      type: String
    },

    modelValue: {
      default: () => {},
      type: Object
    },

    models: {
      default: () => [],
      type: Array
    },

    disabled: {
      default: false,
      type: Boolean
    }
  },

  emits: ['enter', 'update:modelValue'],

  data() {
    return {
      currentModelId: '',
      modelMap: {},
      modelOptions: []
    }
  },

  mounted() {
    this.reset()
  },

  methods: {
    emitValue(value) {
      this.currentModelId = value
      const model = this.modelMap[this.currentModelId]
      this.$emit('update:modelValue', model)
    },

    emitEnter(value) {
      this.currentModelId = value
      const model = this.modelMap[this.currentModelId]
      this.$emit('enter', model)
    },

    reset() {
      if (this.models.length > 0) {
        this.currentModelId =
          this.models.find(model => model.id === this.modelValue.id) ??
          this.models[0].id
        this.modelMap = {}
        this.modelOptions = this.models.map(model => ({
          label: model.name,
          value: model.id
        }))
        this.models.forEach(model => {
          this.modelMap[model.id] = model
        })
      }
    }
  },

  watch: {
    models() {
      this.reset()
    }
  }
}
</script>

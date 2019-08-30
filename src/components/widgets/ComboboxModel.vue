<template>
<combobox
  :label="label"
  :disabled="disabled"
  :options="modelOptions"
  :value="currentModelId"
  @input="emitValue"
  @enter="emitEnter"
/>
</template>

<script>
import Combobox from '../widgets/Combobox'

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

    value: {
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

  data () {
    return {
      currentModelId: '',
      modelMap: {},
      modelOptions: []
    }
  },

  mounted () {
    this.reset()
  },

  computed: {
  },

  methods: {
    emitValue (value) {
      this.currentModelId = value
      const model = this.modelMap[this.currentModelId]
      this.$emit('input', model)
    },

    emitEnter (value) {
      this.currentModelId = value
      const model = this.modelMap[this.currentModelId]
      this.$emit('enter', model)
    },

    reset () {
      if (this.models.length > 0) {
        this.currentModelId = this.models[0].id
        this.modelMap = {}
        this.modelOptions = this.models.map((model) => ({
          label: model.name,
          value: model.id
        }))
        this.models.forEach((model) => {
          this.modelMap[model.id] = model
        })
      }
    }
  },

  watch: {
    models () {
      this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

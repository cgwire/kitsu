<template>
<div class="field">
  <label class="label">{{ label }}</label>
  <p class="control">
    <color-picker :value="value" @input="updateValue">
    </color-picker>
  </p>
</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { Compact } from 'vue-color'

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
  data () {
    return {
      colors: {
        hex: '#194d33'
      }
    }
  },
  components: {
    'color-picker': Compact
  },
  computed: {
    ...mapGetters([
    ])
  },
  methods: {
    ...mapActions([
    ]),
    updateValue (color) {
      this.$emit('input', color.hex)
    }
  }
}
</script>
<style>
.vue-color__compact {
  box-shadow: none;
  width: 250px;
}
</style>

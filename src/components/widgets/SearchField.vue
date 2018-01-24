<template>
<div class="flexrow">
  <div class="flexrow-item">
    <search-icon></search-icon>
  </div>
  <div class="flexrow-item">
    <input
      ref="input"
      class="input search-input"
      type="text"
      @input="onSearchChange"
      v-focus
    />
  </div>
</div>
</template>

<script>
import { SearchIcon } from 'vue-feather-icons'

export default {
  name: 'search-field',
  props: {},
  components: {
    SearchIcon
  },
  computed: {
  },
  methods: {
    onSearchChange  () {
      this.$emit('change', this.$refs.input.value)
    },
    setValue (value) {
      this.$refs.input.value = value
    },
    focus () {
      this.$refs.input.focus()
    }
  }
}
</script>

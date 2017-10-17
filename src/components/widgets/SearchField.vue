<template>
<div class="level-right">
  <div class="level-item">
    <search-icon></search-icon>
  </div>
  <div class="level-item">
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
    }
  }
}
</script>

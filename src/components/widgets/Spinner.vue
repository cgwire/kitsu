<template>
<div
  class="has-text-centered"
  :style="sizeStyle"
  v-if="isWhite"
>
  <img src="../../assets/spinner-white.svg">
</div>
<div class="has-text-centered" :style="sizeStyle" v-else>
  <img src="../../assets/spinner.svg">
</div>
</template>

<script>
export default {
  name: 'spinner',

  props: {
    isWhite: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number
    }
  },

  computed: {
    sizeStyle: function () {
      return {
        width: this.size ? this.size + 'px' : 'auto'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

<template>
<div
  class="has-text-centered"
  :style="style"
  v-if="isWhite"
>
  <img src="../../assets/spinner-white.svg">
</div>
<div class="has-text-centered" :style="style" v-else>
  <img src="../../assets/spinner.svg">
</div>
</template>

<script>
export default {
  name: 'spinner',

  data () {
    return {
      style: {
        width: this.size ? this.size + 'px' : 'auto'
      }
    }
  },

  props: {
    isWhite: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number
    }
  }
}
</script>

<style scoped>
</style>

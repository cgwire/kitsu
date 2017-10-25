<template>
<div class="has-text-centered" v-if="isWhite">
  <img src="../../assets/spinner-white.svg">
</div>
<div class="has-text-centered" v-else>
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
    }
  }
}
</script>

<style scoped>
</style>

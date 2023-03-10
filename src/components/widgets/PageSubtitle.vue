<template>
  <h2 class="subtitle">{{ text }}</h2>
</template>

<script>
export default {
  name: 'page-subtitle',
  props: {
    text: {
      default: '',
      type: String
    }
  }
}
</script>

<style lang="scss" scoped>
h2.subtitle {
  border: 0;
  margin-top: 2em;
  margin-bottom: 1em;
}
</style>

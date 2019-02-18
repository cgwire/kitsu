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
.subtitle {
  margin-top: 2em;
  margin-bottom: 1em;
}
</style>

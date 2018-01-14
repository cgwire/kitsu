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

<style scoped>
</style>

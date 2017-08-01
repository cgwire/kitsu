<template>
<h1 class="title">{{ text }}</h1>
</template>

<script>
export default {
  name: 'page-title',
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

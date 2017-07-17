<template>
<h1 class="title">{{ text }}</h1>
</template>

<script>
export default {
  name: 'title',
  props: {
    text: {
      default: 'button',
      type: String
    }
  }
}
</script>

<style scoped>
</style>

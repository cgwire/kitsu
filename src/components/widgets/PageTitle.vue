<template>
  <h1
    :class="{
      title: true,
      'hide-small-screen': true,
      bold
    }"
  >
    {{ text }}
  </h1>
</template>

<script setup>
defineProps({
  text: {
    default: '',
    type: String
  },
  bold: {
    default: false,
    type: Boolean
  }
})
</script>

<style lang="scss" scoped>
.bold {
  font-weight: bold;
}
.title {
  color: var(--text-alt);
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>

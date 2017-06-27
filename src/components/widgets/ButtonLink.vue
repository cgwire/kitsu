<template>
<router-link
  class="button"
  :to="path"
>
  {{ text }}
</router-link>
</template>

<script>
export default {
  name: 'button-link',
  props: {
    text: {
      default: 'button',
      type: String
    },
    path: {
      default: '',
      type: String
    }
  }
}
</script>

<style scoped>
</style>

<template>
<router-link
  class="button"
  :to="path"
>
  <span class="icon is-small" v-if="icon.length > 0">
    <i :class="'fa ' + icon"></i>
  </span>
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
    },
    icon: {
      default: '',
      type: String
    }
  }
}
</script>

<style scoped>
</style>

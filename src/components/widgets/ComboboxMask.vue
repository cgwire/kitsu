<template>
<div
  @click="$emit('click')"
  :class="{
    'c-mask': true,
    'is-active': displayed
  }"
>
</div>
</template>

<script>
export default {
  name: 'combobox-mask',

  props: {
    displayed: {
      type: Boolean,
      default: false
    }
  },

  computed: {
  }
}
</script>

<style lang="scss" scoped>
</style>

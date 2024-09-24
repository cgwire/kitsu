<template>
  <div
    @click="$emit('click')"
    class="c-mask"
    :class="{ 'is-active': displayed }"
  ></div>
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

  emits: ['click']
}
</script>

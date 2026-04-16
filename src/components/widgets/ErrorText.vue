<template>
  <p
    :class="{
      error: true,
      'has-text-right': alignRight,
      'is-hidden': hidden
    }"
  >
    {{ text }}
  </p>
</template>

<script setup>
defineProps({
  text: {
    default: '',
    type: String
  },
  hidden: {
    default: false,
    type: Boolean
  },
  alignRight: {
    default: false,
    type: Boolean
  }
})
</script>

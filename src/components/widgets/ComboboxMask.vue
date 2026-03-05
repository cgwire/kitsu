<template>
  <div
    @click="$emit('click')"
    class="c-mask"
    :class="{ 'is-active': displayed }"
  ></div>
</template>

<script setup>
defineProps({
  displayed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

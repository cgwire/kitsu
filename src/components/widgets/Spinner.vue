<template>
  <div class="has-text-centered" :style="sizeStyle">
    <img src="../../assets/spinner-white.svg" alt="" v-if="isWhite" />
    <square-grid :style="{ margin: 'auto' }" v-else-if="isProcessing" />
    <img src="../../assets/spinner.svg" alt="" v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import SquareGrid from '@/components/spinners/SquareGrid.vue'

const props = defineProps({
  isWhite: {
    type: Boolean,
    default: false
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number
  }
})

const sizeStyle = computed(() => {
  return {
    width: props.size ? `${props.size}px` : null
  }
})
</script>

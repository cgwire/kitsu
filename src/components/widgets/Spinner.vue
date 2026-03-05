<template>
  <div class="has-text-centered" :style="sizeStyle">
    <img src="../../assets/spinner-white.svg" v-if="isWhite" />
    <square-grid :style="{ margin: 'auto' }" v-else-if="isProcessing" />
    <origami :style="{ margin: 'auto' }" v-else-if="isStylish" />
    <img src="../../assets/spinner.svg" v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import Origami from '@/components/spinners/Origami.vue'
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
  isStylish: {
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

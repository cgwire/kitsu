<template>
  <component
    :is="icon"
    :size="size"
    :color="color"
    :stroke-width="strokeWidth"
    :default-class="defaultClass"
  />
</template>

<script setup>
import { computed } from 'vue'
import stringHelpers from '@/lib/string'
import * as icons from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: Number,
  color: String,
  strokeWidth: Number,
  defaultClass: String
})

const icon = computed(() => {
  const iconName = stringHelpers.snakeToPascal(props.name)
  return icons[iconName]
})
</script>

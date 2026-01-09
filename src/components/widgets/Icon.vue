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

const iconName = stringHelpers.capitalize(
  stringHelpers.snakeToCamel(props.name)
)
const icon = computed(() => icons[iconName])
</script>

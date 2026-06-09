<template>
  <td>
    <div
      class="tag"
      :class="{ canceled: disable }"
      :style="{
        background: color,
        color: textColor
      }"
      :title="entry.name"
    >
      {{ entry.short_name }}
    </div>
  </td>
</template>

<script setup>
import { computed } from 'vue'

import { useTaskStatusStyle } from '@/composables/taskStatus'

const { backgroundColor, color: statusColor } = useTaskStatusStyle()

const props = defineProps({
  disable: { type: Boolean, default: false },
  entry: { type: Object, default: () => ({}) }
})

const color = computed(() => backgroundColor(props.entry))

const textColor = computed(() => statusColor(props.entry))
</script>

<style lang="scss" scoped>
.tag {
  margin: 0.7em;
  padding: 1em;
  font-size: 0.8em;
  color: white;
  letter-spacing: 1px;
  font-weight: 600;
  text-transform: uppercase;
}
</style>

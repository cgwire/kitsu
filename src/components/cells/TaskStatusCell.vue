<template>
  <td class="name">
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
import { useStore } from 'vuex'

const store = useStore()

const props = defineProps({
  disable: { type: Boolean, default: false },
  entry: { type: Object, default: () => ({}) }
})

const isDarkTheme = computed(() => store.getters.isDarkTheme)

const color = computed(() =>
  props.entry.name === 'Todo' && isDarkTheme.value
    ? '#5F626A'
    : props.entry.color
)

const textColor = computed(() =>
  props.entry.name === 'Todo' && !isDarkTheme.value ? '#333' : 'white'
)
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

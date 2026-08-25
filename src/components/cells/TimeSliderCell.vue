<template>
  <td>
    <div class="flexrow">
      <span class="value flexrow-item">
        {{ value }}
      </span>
      <span class="flexrow-item" @wheel.prevent="onWheel">
        <vue-slider
          ref="slider"
          class="slider"
          :adsorb="true"
          :dot-size="16"
          :height="6"
          :interval="0.25"
          :lazy="true"
          :min="0"
          :max="12"
          :marks="marks"
          :tooltip="'active'"
          :use-keyboard="true"
          :width="400"
          @drag-end="onDragEnd"
          v-model="value"
        />
      </span>
      <button-simple
        class="flexrow-item"
        :active="value === preset"
        :key="`preset-${preset}`"
        :text="`${preset}`"
        @click="setValue(preset)"
        v-for="preset in presets"
      />
    </div>
  </td>
</template>

<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import VueSlider from 'vue-3-slider-component'
import { useStore } from 'vuex'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const store = useStore()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  duration: { type: Number, default: 0 },
  taskId: { type: String, default: '' }
})

const emit = defineEmits(['change'])

// State
// --------------------------------------------------------------------------
const marks = {
  0: '0',
  2: '',
  4: '4',
  6: '',
  8: '8',
  10: '',
  12: '12'
}

const value = ref(props.duration)

const sliderRef = useTemplateRef('slider')

// Computed
// --------------------------------------------------------------------------
const organisation = computed(() => store.getters.organisation)
const hoursByDay = computed(() => organisation.value.hours_by_day || 8)
const presets = computed(() => [...new Set([1, 4, hoursByDay.value])])

// Functions
// --------------------------------------------------------------------------
const setValue = v => {
  value.value = v || 0
}

// the tooltip follows the slider's internal focus state, which survives
// the pointer release: blur it so the tooltip closes with the drag
const onDragEnd = () => {
  sliderRef.value?.blur()
}

const onWheel = event => {
  const step = event.deltaY < 0 ? 0.25 : -0.25
  value.value = Math.min(
    12,
    Math.max(0, Math.round((value.value + step) * 4) / 4)
  )
}

// Watchers
// --------------------------------------------------------------------------
watch(value, v => {
  emit('change', { taskId: props.taskId, duration: v })
})
</script>

<style lang="scss" scoped>
.value {
  color: var(--text-strong);
  font-size: 1.5em;
  font-variant-numeric: tabular-nums;
  font-weight: bold;
  width: 40px;
}

.slider {
  cursor: pointer;

  :deep(.vue-slider-rail) {
    background: rgba(var(--skeleton-rgb), 0.4);
    border-radius: 999px;
  }

  :deep(.vue-slider-process) {
    background: $purple-strong;
    border-radius: 999px;
  }

  :deep(.vue-slider-mark-step) {
    background: rgba(var(--skeleton-rgb), 0.9);
    border-radius: 50%;
    box-shadow: none;
    height: 4px;
    width: 4px;
  }

  // the filled part of the rail hides its own ticks
  :deep(.vue-slider-mark-active .vue-slider-mark-step) {
    background: transparent;
  }

  :deep(.vue-slider-mark-label) {
    color: var(--text-alt);
    font-size: 0.85em;
    margin-top: 6px;
  }

  // keep the edge labels inside the rail instead of centered on its ends
  :deep(.vue-slider-mark:first-child .vue-slider-mark-label) {
    transform: translateX(0);
  }

  :deep(.vue-slider-mark:last-child .vue-slider-mark-label) {
    transform: translateX(-100%);
  }

  :deep(.vue-slider-dot-handle) {
    background: var(--background-alt-2, white);
    border: 2px solid $purple-strong;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  :deep(.vue-slider-dot-handle-focus) {
    box-shadow: 0 0 0 3px var(--background-selectable);
  }

  :deep(.vue-slider-dot-tooltip-inner) {
    background: $purple-strong;
    border-color: $purple-strong;
    font-variant-numeric: tabular-nums;
  }
}
</style>

<template>
  <div class="shape-wrapper">
    <button
      type="button"
      class="shape-picker"
      :title="$t('playlists.actions.annotation_shape')"
      @click="togglePalette"
    >
      <rectangle-horizontal-icon class="icon" v-if="shape === 'rectangle'" />
      <circle-icon class="icon" v-else-if="shape === 'circle'" />
      <arrow-up-right-icon class="icon" v-else-if="shape === 'arrow'" />
      <sticky-note-icon class="icon" v-else-if="shape === 'whiteboard'" />
      <shapes-icon class="icon" v-else />
    </button>
    <div v-show="isOpen" class="shape-palette">
      <button
        type="button"
        class="shape-option"
        :class="{ active: shape === 'rectangle' }"
        title="Rectangle"
        @click="onShapePicked('rectangle')"
      >
        <rectangle-horizontal-icon class="icon" />
      </button>
      <button
        type="button"
        class="shape-option"
        :class="{ active: shape === 'circle' }"
        title="Circle"
        @click="onShapePicked('circle')"
      >
        <circle-icon class="icon" />
      </button>
      <button
        type="button"
        class="shape-option"
        :class="{ active: shape === 'arrow' }"
        title="Arrow"
        @click="onShapePicked('arrow')"
      >
        <arrow-up-right-icon class="icon" />
      </button>
      <button
        type="button"
        class="shape-option"
        :class="{ active: shape === 'whiteboard' }"
        title="Whiteboard"
        @click="onShapePicked('whiteboard')"
      >
        <sticky-note-icon class="icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowUpRightIcon,
  CircleIcon,
  RectangleHorizontalIcon,
  ShapesIcon,
  StickyNoteIcon
} from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = defineProps({
  shape: {
    type: String,
    default: 'rectangle'
  },
  modelValue: {
    // When the parent passes a Boolean here, the picker is
    // controlled — open/close decisions go through update:model-value
    // so siblings can be coordinated (one panel open at a time).
    // Leaving it undefined falls back to internal state.
    type: Boolean,
    default: undefined
  }
})

const emit = defineEmits(['change', 'update:model-value'])

const internalOpen = ref(false)
const isControlled = () => props.modelValue !== undefined
const isOpen = computed(() =>
  isControlled() ? props.modelValue : internalOpen.value
)

const setOpen = value => {
  if (isControlled()) emit('update:model-value', value)
  else internalOpen.value = value
}

const togglePalette = () => {
  setOpen(!isOpen.value)
}

const onShapePicked = newShape => {
  emit('change', newShape)
  setOpen(false)
}
</script>

<style lang="scss" scoped>
.shape-wrapper {
  position: relative;
  display: inline-flex;
}

.shape-picker {
  background-color: transparent;
  border: 0;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  display: inline-flex;
  align-items: center;
}

.shape-picker .icon,
.shape-option .icon {
  width: 1rem;
  height: 1rem;
  color: white;
}

.shape-palette {
  background-color: $dark-grey-light;
  border-radius: 5px;
  bottom: calc(100% + 0.1rem);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  left: 50%;
  padding: 0.5rem;
  position: absolute;
  transform: translateX(-50%);
  z-index: 900;
}

.preview .shape-palette {
  background-color: $dark-grey;
}

.shape-option {
  background: transparent;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.4rem;
  transition: background-color 0.15s ease;

  .icon {
    color: white;
  }
}

.shape-option:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.shape-option.active {
  background-color: $dark-grey-strong;
  color: $white;
}
</style>

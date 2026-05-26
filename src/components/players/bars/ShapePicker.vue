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
import { ref } from 'vue'

defineProps({
  shape: {
    type: String,
    default: 'rectangle'
  }
})

const emit = defineEmits(['change'])

const isOpen = ref(false)

const togglePalette = () => {
  isOpen.value = !isOpen.value
}

const onShapePicked = newShape => {
  emit('change', newShape)
  isOpen.value = false
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
  position: absolute;
  z-index: 900;
  left: 0;
  bottom: calc(100% - 0.25rem);
  background-color: $dark-grey-light;
  border-radius: 5px;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview .shape-palette {
  background-color: $dark-grey;
}

.shape-option {
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;

  .icon {
    color: white;
  }
}

.shape-option:hover,
.shape-option.active {
  background-color: $dark-grey-strong;
  color: $white;
}
</style>

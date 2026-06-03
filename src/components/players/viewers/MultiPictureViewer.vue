<template>
  <div ref="container" class="multi-picture-player">
    <picture-viewer
      :key="`${preview.id}-${preview.position}`"
      :ref="el => setPictureRef(preview, el)"
      :big="true"
      :default-height="defaultHeight"
      :full-screen="fullScreen"
      :high-quality="highQuality"
      :is-comparing="isComparing"
      :light="light"
      :margin-bottom="marginBottom"
      :panzoom="panzoom"
      :preview="preview"
      @loaded="() => $emit('loaded')"
      @panzoom-changed="$event => $emit('panzoom-changed', $event)"
      @panzoom-ready="() => $emit('panzoom-ready')"
      @size-changed="() => $emit('size-changed')"
      v-for="preview in validPreviews"
      v-show="
        preview.id === currentPreview.id &&
        preview.position === currentPreview.position
      "
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

import PictureViewer from '@/components/players/viewers/PictureViewer.vue'

const props = defineProps({
  currentPreview: {
    type: Object,
    default: () => null
  },
  defaultHeight: {
    type: Number,
    default: 0
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  highQuality: {
    type: Boolean,
    default: false
  },
  isComparing: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  marginBottom: {
    type: Number,
    default: 0
  },
  panzoom: {
    type: Boolean,
    default: false
  },
  previews: {
    type: Array,
    default: () => []
  }
})

defineEmits(['loaded', 'panzoom-changed', 'panzoom-ready', 'size-changed'])

const container = ref(null)
const pictureRefs = reactive({})

// Computed

const validPreviews = computed(() => props.previews.filter(p => p?.id))

const setPictureRef = (preview, el) => {
  const key = `${preview.id}-${preview.position}`
  if (el) {
    pictureRefs[key] = el
  } else {
    delete pictureRefs[key]
  }
}

const getCurrentViewer = () => {
  if (!props.currentPreview) return null
  const key = `${props.currentPreview.id}-${props.currentPreview.position}`
  return pictureRefs[key] || null
}

const getNaturalDimensions = () => {
  const viewer = getCurrentViewer()
  if (viewer) return viewer.getNaturalDimensions()
  return { height: 0, width: 0 }
}

// Returns the actual <img> the current PictureViewer's panzoom is
// bound to. Called by the parent to wire wheel-target / media-element
// on its AnnotationCanvas. Skipping the auto-unwrapped ref chain
// avoids the wrong-image dispatch seen earlier with v-for nesting.
const getPictureElement = () => {
  const viewer = getCurrentViewer()
  return viewer?.getPictureElement?.() || null
}

const getDimensions = () => {
  const viewer = getCurrentViewer()
  if (viewer) return viewer.getDimensions()
  return { height: 0, width: 0 }
}

const resetPicture = () => {
  container.value.style.height = props.defaultHeight + 'px'
  const viewer = getCurrentViewer()
  if (viewer) viewer.resetPicture()
}

const resetPanZoom = () => {
  const viewer = getCurrentViewer()
  if (viewer) viewer.resetPanZoom()
}

const pausePanZoom = () => {
  Object.values(pictureRefs).forEach(viewer => viewer?.pausePanZoom())
}

const resumePanZoom = () => {
  Object.values(pictureRefs).forEach(viewer => viewer?.resumePanZoom())
}

const setPanZoom = (x, y, scale) => {
  const viewer = getCurrentViewer()
  if (viewer) viewer.setPanZoom(x, y, scale)
}

// Lifecycle

onMounted(() => {
  container.value.style.height = props.defaultHeight + 'px'
})

// Watchers

watch(
  () => props.fullScreen,
  () => resetPicture()
)

watch(
  () => props.isComparing,
  () => {
    setTimeout(() => {
      resetPicture()
    }, 20)
  }
)

watch(
  () => props.currentPreview,
  () => {
    nextTick(() => resetPicture())
  }
)

watch(
  () => props.previews,
  () => resetPicture()
)

defineExpose({
  getDimensions,
  getNaturalDimensions,
  getPictureElement,
  pausePanZoom,
  resetPanZoom,
  resetPicture,
  resumePanZoom,
  setPanZoom
})
</script>

<style lang="scss" scoped>
.multi-picture-player {
  align-content: flex-end;
  background: $dark-grey-2;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
  width: 100%;
}
</style>

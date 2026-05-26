<template>
  <div ref="container" class="multi-picture-player">
    <picture-viewer
      :ref="el => setPictureRef(preview, el)"
      :key="`${preview.id}-${preview.position}`"
      :big="true"
      :preview="preview"
      :full-screen="fullScreen"
      :high-quality="highQuality"
      :is-comparing="isComparing"
      :light="light"
      :panzoom="panzoom"
      :default-height="defaultHeight"
      :margin-bottom="marginBottom"
      @loaded="() => $emit('loaded')"
      @panzoom-changed="$event => $emit('panzoom-changed', $event)"
      @size-changed="() => $emit('size-changed')"
      v-show="
        preview.id === currentPreview.id &&
        preview.position === currentPreview.position
      "
      v-for="preview in validPreviews"
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

defineEmits(['loaded', 'panzoom-changed', 'size-changed'])

const container = ref(null)
const pictureRefs = reactive({})

// Drop placeholder entries (no id yet) so we never mount an empty
// PictureViewer whose panzoom would bind to a stale slot before the
// real preview arrives — the cause of the wrong-image dispatch.
const validPreviews = computed(() => props.previews.filter(p => p?.id))

const setPictureRef = (preview, el) => {
  const key = `${preview.id}-${preview.position}`
  if (el) {
    pictureRefs[key] = el
  } else {
    delete pictureRefs[key]
  }
}

const getCurrentRef = () => {
  if (!props.currentPreview) return null
  const key = `${props.currentPreview.id}-${props.currentPreview.position}`
  return pictureRefs[key] || null
}

const getNaturalDimensions = () => {
  const viewer = getCurrentRef()
  if (viewer) return viewer.getNaturalDimensions()
  return { height: 0, width: 0 }
}

// Returns the actual <img> the current PictureViewer's panzoom is
// bound to. Called by the parent to wire wheel-target / media-element
// on its AnnotationCanvas. Skipping the auto-unwrapped ref chain
// avoids the wrong-image dispatch seen earlier with v-for nesting.
const getPictureElement = () => {
  const viewer = getCurrentRef()
  return viewer?.getPictureElement?.() || null
}

const getDimensions = () => {
  const viewer = getCurrentRef()
  if (viewer) return viewer.getDimensions()
  return { height: 0, width: 0 }
}

const resetPicture = () => {
  container.value.style.height = props.defaultHeight + 'px'
  const viewer = getCurrentRef()
  if (viewer) viewer.resetPicture()
}

const resetPanZoom = () => {
  const viewer = getCurrentRef()
  if (viewer) viewer.resetPanZoom()
}

const pausePanZoom = () => {
  for (const key in pictureRefs) {
    pictureRefs[key]?.pausePanZoom()
  }
}

const resumePanZoom = () => {
  for (const key in pictureRefs) {
    pictureRefs[key]?.resumePanZoom()
  }
}

const setPanZoom = (x, y, scale) => {
  const viewer = getCurrentRef()
  if (viewer) viewer.setPanZoom(x, y, scale)
}

onMounted(() => {
  container.value.style.height = props.defaultHeight + 'px'
})

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
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  border-radius: 5px;
  height: 100%;
  width: 100%;
  text-align: center;
  background: $dark-grey-2;
}
</style>

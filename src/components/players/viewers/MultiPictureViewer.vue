<template>
  <div ref="container" class="multi-picture-player">
    <picture-viewer
      :key="previewKey(preview)"
      :ref="el => setPictureRef(preview, el)"
      :background-color="backgroundColor"
      :big="true"
      :default-height="defaultHeight"
      :full-screen="fullScreen"
      :high-quality="highQuality"
      :is-comparing="isComparing"
      :light="light"
      :margin-bottom="marginBottom"
      :preview="preview"
      @loaded="onViewerLoaded(preview)"
      @panzoom-changed="$event => $emit('panzoom-changed', $event)"
      @panzoom-ready="() => $emit('panzoom-ready')"
      @size-changed="() => $emit('size-changed')"
      v-for="preview in mountedPreviews"
      v-show="previewKey(preview) === previewKey(currentPreview)"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

import PictureViewer from '@/components/players/viewers/PictureViewer.vue'

const props = defineProps({
  backgroundColor: {
    type: String,
    default: '#000000'
  },
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
  previews: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'loaded',
  'panzoom-changed',
  'panzoom-ready',
  'size-changed'
])

const container = ref(null)
const pictureRefs = reactive({})

// Computed

const validPreviews = computed(() => props.previews.filter(p => p?.id))

// A viewer is identified by its playlist entry and its rank inside that
// entry, not by the preview file id: the same entity repeated in a
// playlist can point at the same preview file twice.
const previewKey = preview =>
  preview ? `${preview.entry}-${preview.position}` : null

// Only mount the displayed picture and its immediate neighbours: the
// strip used to mount (and download) every picture of the playlist up
// front, saturating the network the moment a playlist opened. The +/-1
// window keeps prev/next navigation and continuous playback preloaded.
const mountedPreviews = computed(() => {
  const list = validPreviews.value
  const currentKey = previewKey(props.currentPreview)
  const index = list.findIndex(p => previewKey(p) === currentKey)
  if (index === -1) return list.slice(0, 2)
  return list.filter((p, i) => Math.abs(i - index) <= 1)
})

const setPictureRef = (preview, el) => {
  const key = previewKey(preview)
  if (el) {
    pictureRefs[key] = el
  } else {
    delete pictureRefs[key]
  }
}

// Every PictureViewer in the strip loads eagerly (v-show): only the
// displayed one may notify the parent, or each background image finishing
// its download resets the live annotation canvas (wiping in-progress
// strokes) for seconds after opening a picture-heavy playlist.
const onViewerLoaded = preview => {
  if (previewKey(preview) === previewKey(props.currentPreview)) {
    emit('loaded')
  }
}

const getCurrentViewer = () => {
  if (!props.currentPreview) return null
  return pictureRefs[previewKey(props.currentPreview)] || null
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

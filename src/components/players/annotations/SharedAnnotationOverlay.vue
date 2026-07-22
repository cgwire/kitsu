<template>
  <div class="annotation-overlay" ref="wrapper" :style="wrapperStyle">
    <div class="annotation-surface" :style="surfaceStyle">
      <canvas :id="canvasId" />
    </div>
    <div class="annotation-toolbar" v-if="isEditable">
      <button
        type="button"
        class="annotation-tool"
        :class="{ active: annotation.currentTool.value === 'pen' }"
        :title="$t('playlists.actions.annotation_draw')"
        @click="annotation.setTool('pen')"
      >
        <pencil-icon :size="14" />
      </button>
      <button
        type="button"
        class="annotation-tool"
        :class="{ active: annotation.currentTool.value === 'rectangle' }"
        title="Rectangle"
        @click="annotation.setTool('rectangle')"
      >
        <rectangle-horizontal-icon :size="14" />
      </button>
      <button
        type="button"
        class="annotation-tool"
        :class="{ active: annotation.currentTool.value === 'circle' }"
        title="Circle"
        @click="annotation.setTool('circle')"
      >
        <circle-icon :size="14" />
      </button>
      <button
        type="button"
        class="annotation-tool"
        :class="{ active: annotation.currentTool.value === 'arrow' }"
        title="Arrow"
        @click="annotation.setTool('arrow')"
      >
        <arrow-up-right-icon :size="14" />
      </button>
      <div class="annotation-divider" />
      <button
        type="button"
        class="annotation-tool"
        :title="$t('playlists.actions.annotation_undo')"
        :disabled="!annotation.hasChanges()"
        @click="annotation.undo"
      >
        <corner-left-down-icon :size="14" />
      </button>
      <button
        type="button"
        class="annotation-tool"
        :title="$t('playlists.actions.annotation_delete')"
        :disabled="!annotation.hasChanges()"
        @click="annotation.clearLocal"
      >
        <trash-2-icon :size="14" />
      </button>
      <button
        type="button"
        class="annotation-tool primary"
        :title="$t('main.save')"
        :disabled="!annotation.hasChanges() || isSaving"
        @click="save"
      >
        <save-icon :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowUpRightIcon,
  CircleIcon,
  CornerLeftDownIcon,
  PencilIcon,
  RectangleHorizontalIcon,
  SaveIcon,
  Trash2Icon
} from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import { useSharedAnnotationCanvas } from '@/composables/players/sharedAnnotation'
import {
  buildReadOnlyShape,
  findAnnotationAtTime
} from '@/lib/players/annotation'

const store = useStore()

const props = defineProps({
  annotations: { type: Array, default: () => [] },
  currentFrame: { type: Number, default: 0 },
  frameDuration: { type: Number, default: 1 / 25 },
  guestId: { type: String, default: '' },
  isEditable: { type: Boolean, default: false },
  isPicture: { type: Boolean, default: false },
  isPlaying: { type: Boolean, default: false },
  movieDimensions: {
    type: Object,
    default: () => ({ width: 0, height: 0 })
  },
  panzoomTransform: {
    type: Object,
    default: () => ({ x: 0, y: 0, scale: 1 })
  },
  previewFileId: { type: String, default: '' },
  token: { type: String, default: '' }
})

const emit = defineEmits(['saved'])

const canvasId = `shared-annotation-canvas-${Math.random()
  .toString(36)
  .slice(2, 9)}`

const annotation = useSharedAnnotationCanvas()

const containerSize = ref({ width: 0, height: 0 })
const isSaving = ref(false)
const wrapper = ref(null)

let resizeObserver = null

const videoBounds = computed(() => {
  const cw = containerSize.value.width
  const ch = containerSize.value.height
  const mw = props.movieDimensions?.width || 0
  const mh = props.movieDimensions?.height || 0
  if (!cw || !ch) return { width: 0, height: 0, left: 0, top: 0 }
  if (!mw || !mh) {
    return { width: cw, height: ch, left: 0, top: 0 }
  }

  // Pictures: mirror the studio player's sizing — the image is centered and
  // never upscaled beyond its natural size, so the overlay box matches the
  // actually displayed <img>. One uniform scale: independent width/height
  // clamps produced a wrong-aspect box when the container was narrower but
  // taller than the image, and strokes then SAVED with those dimensions
  // misalign everywhere else.
  if (props.isPicture) {
    const scale = Math.min(cw / mw, ch / mh, 1)
    const width = Math.round(mw * scale)
    const height = Math.round(mh * scale)
    return {
      width,
      height,
      left: Math.round((cw - width) / 2),
      top: Math.round((ch - height) / 2)
    }
  }

  // Movies: contain-fit — matches the canvas, which fills the container.
  const containerRatio = cw / ch
  const movieRatio = mw / mh
  let displayedW
  let displayedH
  if (movieRatio > containerRatio) {
    displayedW = cw
    displayedH = cw / movieRatio
  } else {
    displayedH = ch
    displayedW = ch * movieRatio
  }
  return {
    width: displayedW,
    height: displayedH,
    left: (cw - displayedW) / 2,
    top: (ch - displayedH) / 2
  }
})

// The wrapper is pinned (un-transformed) to the displayed media box.
const wrapperStyle = computed(() => {
  const bounds = videoBounds.value
  if (!bounds.width || !bounds.height) {
    return { display: 'none' }
  }
  return {
    height: `${bounds.height}px`,
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    width: `${bounds.width}px`
  }
})

// Panzoom is applied here as a CSS transform (mirrors the studio
// AnnotationCanvas) instead of fabric's setViewportTransform: a CSS
// transform scales with the page under browser zoom and stays aligned
// with the media, whereas fabric's retina-scaled viewport drifts when
// devicePixelRatio changes.
const surfaceStyle = computed(() => {
  const { x = 0, y = 0, scale = 1 } = props.panzoomTransform || {}
  return {
    pointerEvents: props.isEditable ? 'auto' : 'none',
    transform: `translate(${x}px, ${y}px) scale(${scale})`
  }
})

const currentTime = computed(() => {
  if (props.isPicture) return 0
  return Math.round(props.currentFrame * props.frameDuration * 10000) / 10000
})

let renderToken = 0

const render = async () => {
  const fabricCanvas = annotation.getCanvas()
  if (!fabricCanvas) return
  const token = ++renderToken
  // Unsaved guest strokes must survive re-renders (resize, comments-panel
  // toggle, frame stepping): capture the pending diff before the reset
  // wipes it. This is an explicit-save UX, a silent wipe loses work.
  const pendingAdditions = annotation.hasChanges()
    ? annotation.getDiff().additions
    : []
  fabricCanvas.clear()
  annotation.reset()
  if (props.isPlaying) {
    // Keep the pending data armed (save button, reappearance on pause)
    // even though nothing is painted during playback.
    if (pendingAdditions.length) {
      annotation.restoreUnsaved(pendingAdditions, [])
    }
    return
  }
  const current = findAnnotationAtTime(
    props.annotations,
    currentTime.value,
    props.frameDuration,
    props.isPicture
  )
  annotation.setAnnotationDimensions(
    current?.width || props.movieDimensions?.width || fabricCanvas.width,
    current?.height || props.movieDimensions?.height || fabricCanvas.height
  )
  const objects = current ? current.drawing?.objects || [] : []
  const shapes = await Promise.all(
    objects.map(obj => buildReadOnlyShape(current, obj, fabricCanvas))
  )
  if (token !== renderToken) return
  shapes.forEach(shape => {
    if (shape) fabricCanvas.add(shape)
  })
  if (pendingAdditions.length) {
    // Repaint the unsaved strokes of the displayed frame; entries drawn
    // on other frames stay data-only until their frame shows again.
    const rebuilt = []
    for (const entry of pendingAdditions) {
      if (entry.time === currentTime.value) {
        for (const obj of entry.drawing.objects) {
          const shape = await buildReadOnlyShape(entry, obj, fabricCanvas)
          if (token !== renderToken) return
          if (shape) {
            fabricCanvas.add(shape)
            rebuilt.push(shape)
          }
        }
      }
    }
    annotation.restoreUnsaved(pendingAdditions, rebuilt)
  }
  fabricCanvas.requestRenderAll()
}

const measureContainer = () => {
  const parent = wrapper.value?.parentElement
  if (!parent) return
  const rect = parent.getBoundingClientRect()
  containerSize.value = { width: rect.width, height: rect.height }
}

const fitCanvasToBounds = () => {
  const bounds = videoBounds.value
  if (bounds.width <= 0 || bounds.height <= 0) return
  annotation.setCanvasSize(bounds.width, bounds.height)
  // Refresh fabric's cached canvas offset so freshly drawn strokes land
  // under the cursor (a stale offset shifts pointer coordinates).
  annotation.getCanvas()?.calcOffset()
  render()
}

const refreshLayout = () => {
  measureContainer()
  fitCanvasToBounds()
}

// Browser zoom (a devicePixelRatio change) and dev-console docking move
// the media without resizing the observed elements, so the ResizeObserver
// stays silent. window / visualViewport resize do fire, so recompute on
// them — immediately and once more after the layout settles.
const onViewportResize = () => {
  refreshLayout()
  setTimeout(refreshLayout, 250)
}

// The panzoom transform is now applied via CSS (surfaceStyle); we only
// refresh fabric's cached offset so pointer coordinates stay accurate
// while drawing on a zoomed/panned view.
const refreshCanvasOffset = () => {
  nextTick(() => annotation.getCanvas()?.calcOffset())
}

const save = async () => {
  if (
    isSaving.value ||
    !annotation.hasChanges() ||
    !props.token ||
    !props.guestId ||
    !props.previewFileId
  ) {
    return
  }
  isSaving.value = true
  try {
    const diff = annotation.getDiff()
    const updated = await store.dispatch('saveSharedPlaylistAnnotations', {
      shareToken: props.token,
      data: {
        guest_id: props.guestId,
        preview_file_id: props.previewFileId,
        additions: diff.additions,
        updates: diff.updates,
        deletions: diff.deletions
      }
    })
    // Drop the local copies now that they are persisted: render() keeps
    // unsaved work across resets, so a stale diff would repaint the just
    // saved strokes as pending duplicates.
    annotation.clearLocal()
    emit('saved', updated.annotations || [])
  } catch (error) {
    // Keep the toolbar so the user can retry; surface the failure for logs.
    console.error('Failed to save shared playlist annotations', error)
  }
  isSaving.value = false
}

// Watchers

watch(
  () => [props.currentFrame, currentTime.value],
  () => annotation.setTime(currentTime.value, props.currentFrame),
  { immediate: true }
)

watch(() => props.guestId, annotation.setUserId, { immediate: true })

watch(
  () => props.isEditable,
  enabled => annotation.setDrawingMode(!!enabled),
  { immediate: true }
)

watch(
  [
    () => props.annotations,
    () => props.currentFrame,
    () => props.frameDuration,
    () => props.isPicture,
    () => props.isPlaying
  ],
  render
)

watch(() => props.movieDimensions, refreshLayout)
watch(() => props.panzoomTransform, refreshCanvasOffset)

// Lifecycle

onMounted(() => {
  const canvasEl = document.getElementById(canvasId)
  annotation.setup(canvasEl, { width: 1, height: 1 })
  annotation.setUserId(props.guestId)
  annotation.setTime(currentTime.value, props.currentFrame)
  annotation.setDrawingMode(!!props.isEditable)
  refreshLayout()
  window.addEventListener('resize', onViewportResize)
  window.visualViewport?.addEventListener('resize', onViewportResize)
  const target = wrapper.value?.parentElement
  if (typeof ResizeObserver !== 'undefined' && target) {
    resizeObserver = new ResizeObserver(refreshLayout)
    resizeObserver.observe(target)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportResize)
  window.visualViewport?.removeEventListener('resize', onViewportResize)
  resizeObserver?.disconnect()
  resizeObserver = null
  annotation.dispose()
})

defineExpose({
  hasChanges: () => annotation.hasChanges(),
  getDiff: () => annotation.getDiff(),
  reset: () => annotation.reset(),
  setDrawingMode: enabled => annotation.setDrawingMode(enabled)
})
</script>

<style lang="scss" scoped>
.annotation-overlay {
  position: absolute;
  // Above the media viewers (PictureViewer / MultiVideoViewer are z-index
  // 300); mirrors the non-shared AnnotationCanvas. The wrapper itself never
  // captures pointer events — the surface re-enables them while editing and
  // the toolbar is always interactive — so clicks pass through to the media.
  pointer-events: none;
  z-index: 500;
}

.annotation-surface {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  // Panzoom is applied here as a CSS transform (see surfaceStyle) so it
  // scales with the page under browser zoom and stays aligned with media.
  transform-origin: 0 0;
  width: 100%;

  canvas {
    display: block;
    height: 100%;
    width: 100%;
  }
}

.annotation-toolbar {
  align-items: center;
  background: rgba(20, 20, 26, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  display: flex;
  gap: 0.25em;
  left: 50%;
  padding: 0.35em 0.5em;
  position: absolute;
  pointer-events: auto;
  top: 0.6em;
  transform: translateX(-50%);
  z-index: 10;
}

.annotation-divider {
  background: rgba(255, 255, 255, 0.1);
  height: 18px;
  margin: 0 0.15em;
  width: 1px;
}

.annotation-tool {
  align-items: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  color: rgba(244, 245, 250, 0.7);
  cursor: pointer;
  display: inline-flex;
  height: 28px;
  justify-content: center;
  padding: 0;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  width: 28px;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.06);
    color: #f4f5fa;
  }

  &.active {
    background: rgba(124, 92, 255, 0.18);
    border-color: rgba(124, 92, 255, 0.55);
    color: #b8a4ff;
  }

  &.primary:not(:disabled) {
    background: rgba(124, 92, 255, 0.55);
    color: white;

    &:hover {
      background: rgba(124, 92, 255, 0.7);
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
}
</style>

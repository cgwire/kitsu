<template>
  <div class="annotation-overlay" ref="wrapper" :style="overlayStyle">
    <canvas :id="canvasId" />
    <div class="annotation-toolbar" v-if="isEditable">
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { CornerLeftDownIcon, SaveIcon, Trash2Icon } from 'lucide-vue-next'

import { buildReadOnlyShape, findAnnotationAtTime } from '@/lib/annotation'
import { useSharedAnnotationCanvas } from '@/composables/sharedAnnotation'

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
  previewFileId: { type: String, default: '' },
  token: { type: String, default: '' }
})

const emit = defineEmits(['saved'])

const canvasId = `shared-annotation-canvas-${Math.random()
  .toString(36)
  .slice(2, 9)}`

const wrapper = ref(null)
const containerSize = ref({ width: 0, height: 0 })
const isSaving = ref(false)

const annotation = useSharedAnnotationCanvas()

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

const overlayStyle = computed(() => {
  const bounds = videoBounds.value
  if (!bounds.width || !bounds.height) {
    return { display: 'none' }
  }
  return {
    height: `${bounds.height}px`,
    left: `${bounds.left}px`,
    pointerEvents: props.isEditable ? 'auto' : 'none',
    top: `${bounds.top}px`,
    width: `${bounds.width}px`
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
  fabricCanvas.clear()
  annotation.reset()
  if (props.isPlaying) return
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
  if (!current) return
  const objects = current.drawing?.objects || []
  const shapes = await Promise.all(
    objects.map(obj => buildReadOnlyShape(current, obj, fabricCanvas))
  )
  if (token !== renderToken) return
  shapes.forEach(shape => {
    if (shape) fabricCanvas.add(shape)
  })
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
  render()
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
    const response = await fetch(
      `/api/shared/playlists/${props.token}/annotations`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: props.guestId,
          preview_file_id: props.previewFileId,
          additions: diff.additions,
          updates: diff.updates,
          deletions: diff.deletions
        })
      }
    )
    if (!response.ok) throw new Error('Failed to save annotations')
    const updated = await response.json()
    emit('saved', updated.annotations || [])
  } catch {
    // Silent failure for now; toolbar stays so the user can retry.
  }
  isSaving.value = false
}

watch(
  () => [props.currentFrame, currentTime.value],
  () => {
    annotation.setTime(currentTime.value, props.currentFrame)
  },
  { immediate: true }
)

watch(
  () => props.guestId,
  id => annotation.setUserId(id),
  { immediate: true }
)

onMounted(() => {
  const canvasEl = document.getElementById(canvasId)
  annotation.setup(canvasEl, { width: 1, height: 1 })
  annotation.setUserId(props.guestId)
  annotation.setTime(currentTime.value, props.currentFrame)
  annotation.setDrawingMode(!!props.isEditable)
  measureContainer()
  fitCanvasToBounds()
  const target = wrapper.value?.parentElement
  if (typeof ResizeObserver !== 'undefined' && target) {
    resizeObserver = new ResizeObserver(() => {
      measureContainer()
      fitCanvasToBounds()
    })
    resizeObserver.observe(target)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  annotation.dispose()
})

watch(() => props.annotations, render, { deep: true })
watch(() => props.currentFrame, render)
watch(() => props.frameDuration, render)
watch(() => props.isPicture, render)
watch(() => props.isPlaying, render)
watch(() => props.movieDimensions, fitCanvasToBounds, { deep: true })
watch(
  () => props.isEditable,
  enabled => {
    annotation.setDrawingMode(!!enabled)
  },
  { immediate: true }
)

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
  z-index: 5;

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

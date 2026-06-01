<template>
  <div ref="clip" class="annotation-clip" :style="clipStyle">
    <div
      ref="overlay"
      class="annotation-canvas"
      :class="{ 'non-interactive': !interactive }"
      :style="overlayStyle"
      oncontextmenu="return false"
      @click="$emit('click', $event)"
      @wheel="onWheel"
    >
      <canvas ref="canvasEl" :id="canvasId" />
    </div>
  </div>
</template>

<script setup>
import { fabric } from 'fabric'
import { PSBrush } from 'fabricjs-psbrush'
import { computed, markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { lockBrushToFirstPointer } from '@/lib/annotation'

const props = defineProps({
  canvasId: { type: String, required: true },
  // CSS cursor value (keyword or url(...)). When null, the overlay
  // inherits whatever cursor its parent provides.
  cursor: { type: String, default: null },
  mediaElement: { type: HTMLElement, default: null },
  panzoomTransform: {
    type: Object,
    default: () => ({ x: 0, y: 0, scale: 1 })
  },
  interactive: { type: Boolean, default: true },
  static: { type: Boolean, default: false },
  // When set, wheel events that fire on the overlay are forwarded
  // to this element. Used so drawing + zoom-pan can coexist: the
  // overlay captures mouse for drawing while wheel still reaches
  // the underlying media's panzoom instance.
  wheelTarget: { type: HTMLElement, default: null }
})

const emit = defineEmits(['click', 'resized'])

const bounds = ref({ top: 0, left: 0, width: 0, height: 0 })
const canvasEl = ref(null)
const clip = ref(null)
const fabricCanvas = ref(null)
const overlay = ref(null)

let resizeObserver = null

// The clip wrapper is positioned at the media's screen coordinates
// and has overflow: hidden, so it crops anything the inner
// transformed overlay paints outside the media area (otherwise the
// comparison overlay would bleed into the main viewer when panning).
const clipStyle = computed(() => ({
  top: `${bounds.value.top}px`,
  left: `${bounds.value.left}px`,
  width: `${bounds.value.width}px`,
  height: `${bounds.value.height}px`
}))

const overlayStyle = computed(() => {
  const { x, y, scale } = props.panzoomTransform
  return {
    cursor: props.cursor || null,
    pointerEvents: props.interactive ? 'auto' : 'none',
    transform: `translate(${x}px, ${y}px) scale(${scale})`
  }
})

const updateBounds = () => {
  const media = props.mediaElement
  const parent = clip.value?.parentElement
  if (!media || !parent) return
  const mediaRect = media.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  bounds.value = {
    top: mediaRect.top - parentRect.top,
    left: mediaRect.left - parentRect.left,
    width: mediaRect.width,
    height: mediaRect.height
  }
  const canvas = fabricCanvas.value
  if (
    canvas &&
    (canvas.width !== mediaRect.width || canvas.height !== mediaRect.height)
  ) {
    canvas.setDimensions({ width: mediaRect.width, height: mediaRect.height })
    emit('resized', { width: mediaRect.width, height: mediaRect.height })
  }
  // Refresh fabric's cached canvas offset. setDimensions doesn't
  // always trigger it on its own, and a stale offset shifts pointer
  // coordinates (so freshly drawn strokes land at the wrong y) until
  // any window resize forces a recalculation.
  canvas?.calcOffset()
}

const observe = el => el && resizeObserver?.observe(el)
const unobserve = el => el && resizeObserver?.unobserve(el)

const createFabric = () => {
  // Pass the DOM element directly to avoid fabric resolving the canvas
  // by id — multiple AnnotationCanvas instances on the same page (the
  // playlist player's main + comparison overlays, two preview players
  // side by side, …) can share the same canvasId, and the by-id lookup
  // would silently bind both fabric instances to the first match.
  if (!canvasEl.value) return
  const canvas = props.static
    ? new fabric.StaticCanvas(canvasEl.value)
    : new fabric.Canvas(canvasEl.value, {
        fireRightClick: true,
        enablePointerEvents: true,
        // Marquee must fully contain an annotation to pick it up.
        // Without this, even a 1-2 pixel jitter on click can finalise
        // a tiny marquee that grabs nearby objects whose bboxes
        // overlap that point — the user reports this as "clicking
        // between two elements selects the group".
        selectionFullyContained: true
      })
  if (!props.static) {
    const brush = new PSBrush(canvas)
    brush.width = 20
    brush.color = '#000'
    brush.disableTouch = true
    brush.pressureManager.fallback = 0.5
    // PSBrush overrides BaseBrush.initialize without calling super, so the
    // round cap/join defaults are lost and strokes render with flat ends.
    brush.strokeLineCap = 'round'
    brush.strokeLineJoin = 'round'
    lockBrushToFirstPointer(brush)
    canvas.freeDrawingBrush = brush
  }
  fabricCanvas.value = markRaw(canvas)
}

// Re-dispatch the wheel event on wheelTarget so its panzoom listener
// fires as if the cursor were over the media directly. Without this,
// drawing on a zoomed view would swallow wheel events and break
// zoom-by-wheel. preventDefault stops the page from scrolling.
const onWheel = event => {
  if (!props.wheelTarget) return
  event.preventDefault()
  const forwarded = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    clientX: event.clientX,
    clientY: event.clientY,
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    deltaZ: event.deltaZ,
    deltaMode: event.deltaMode,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey
  })
  props.wheelTarget.dispatchEvent(forwarded)
}

onMounted(() => {
  createFabric()
  resizeObserver = new ResizeObserver(updateBounds)
  observe(props.mediaElement)
  observe(clip.value?.parentElement)
  updateBounds()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  fabricCanvas.value?.dispose()
  fabricCanvas.value = null
})

watch(
  () => props.mediaElement,
  (newEl, oldEl) => {
    unobserve(oldEl)
    observe(newEl)
    updateBounds()
  }
)

// Fabric sets the cursor on its own upper-canvas element directly,
// which would override the CSS we put on the overlay div. Keep both
// in sync by feeding fabric the same value so pencil / shape / laser
// cursors survive into drawing mode and over hovered objects.
watch(
  () => props.cursor,
  cursor => {
    const canvas = fabricCanvas.value
    if (!canvas) return
    const value = cursor || 'default'
    canvas.defaultCursor = value
    canvas.freeDrawingCursor = value
    canvas.hoverCursor = value
    // Fabric only flushes its cursor properties to the DOM during its own
    // mouse events, so a tool switch via keyboard / button (pointer idle)
    // wouldn't show until the next move. Push it to the element directly.
    if (canvas.upperCanvasEl) canvas.upperCanvasEl.style.cursor = value
  }
)

defineExpose({
  canvas: fabricCanvas,
  canvasEl,
  overlay,
  updateBounds
})
</script>

<style lang="scss" scoped>
.annotation-clip {
  position: absolute;
  z-index: 500;
  // Clipping is delegated to the player's outer container
  // (PreviewPlayer's .preview-container, PlaylistPlayer's
  // .video-container — both with overflow: hidden) so the overlay
  // can extend with the panzoom transform without being cropped to
  // the media's un-zoomed bounds.
  pointer-events: none;
}

.annotation-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;

  canvas {
    display: block;
  }

  // When the overlay is not interactive (Shift held to pan), we want
  // wheel and pointer events to truly pass through to the media
  // beneath. Fabric sets pointer-events: auto inline on its
  // upper-canvas, so a simple pointer-events: none on the wrapper is
  // not enough — kill events on every descendant too.
  &.non-interactive,
  &.non-interactive :deep(*) {
    pointer-events: none !important;
  }
}
</style>

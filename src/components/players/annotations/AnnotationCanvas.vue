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

const props = defineProps({
  canvasId: { type: String, required: true },
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

const clip = ref(null)
const overlay = ref(null)
const canvasEl = ref(null)
const fabricCanvas = ref(null)
const bounds = ref({ top: 0, left: 0, width: 0, height: 0 })

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
}

const observe = el => el && resizeObserver?.observe(el)
const unobserve = el => el && resizeObserver?.unobserve(el)

const createFabric = () => {
  const canvas = props.static
    ? new fabric.StaticCanvas(props.canvasId)
    : new fabric.Canvas(props.canvasId, {
        fireRightClick: true,
        enablePointerEvents: true
      })
  if (!props.static) {
    const brush = new PSBrush(canvas)
    brush.width = 20
    brush.color = '#000'
    brush.disableTouch = true
    brush.disableMouse = true
    brush.pressureManager.fallback = 0.5
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
  // Clip only horizontally so the comparison overlay can't bleed
  // into the main viewer (they sit side-by-side). Vertically the
  // annotations are free to extend past the media bounds — there's
  // no adjacent sibling to spill into, only header / controls.
  clip-path: inset(-100vh 0 -100vh 0);
  // The wrapper exists only to clip — never to capture events. The
  // inner overlay decides for itself whether to be interactive.
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

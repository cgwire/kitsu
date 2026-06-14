<template>
  <div class="unselectable">
    <!-- Zoom mini-map: the full clip, with the visible window. -->
    <div
      class="timeline-minimap"
      v-if="zoomLevel > 1"
      @mousedown="startMinimapDrag"
    >
      <span
        class="minimap-window"
        :style="{
          left: (100 * viewStartFrame) / nbFrames + '%',
          width: 100 / zoomLevel + '%'
        }"
      ></span>
    </div>
    <div
      class="progress-wrapper"
      :style="
        backgroundUrl
          ? {
              'background-size': backgroundSize,
              'background-image': `url(${backgroundUrl})`
            }
          : { 'background-image': frameTicksGradient }
      "
      @wheel="onWheelZoom"
      @mouseenter="isFrameNumberVisible = true"
      @mouseleave="isFrameNumberVisible = false"
      @touchstart="isFrameNumberVisible = true"
      @touchend="isFrameNumberVisible = false"
      @touchcancel="isFrameNumberVisible = false"
    >
      <span
        class="handle-in"
        :class="{ dragging: handleInDragging }"
        :style="{ width: handleInWidth }"
        @mousedown="startHandleInDrag"
        @touchstart="startHandleInDrag"
        v-if="handleIn >= 0 && !isFullMode && !empty"
      >
        <span class="handle-frame" v-if="handleIn !== 0">
          {{ handleIn + 1 }}
        </span>
      </span>

      <span
        class="handle-out"
        :class="{ dragging: handleOutDragging }"
        :style="{ width: handleOutWidth }"
        @mousedown="startHandleOutDrag"
        @touchstart="startHandleOutDrag"
        v-if="handleOut >= 0 && !isFullMode && !empty"
      >
        <span class="handle-frame">
          {{ handleOut + 1 }}
        </span>
      </span>

      <progress
        ref="progress"
        value="0"
        min="0"
        @click="onProgressClicked"
        @mousedown="startProgressDrag"
        @touchstart="startProgressDrag"
      ></progress>

      <span
        :key="`annotation-${index}`"
        class="annotation-mark"
        :style="{
          left: getAnnotationPosition(annotation) + 'px',
          width: Math.max(effectiveFrameSize - 1, 5) + 'px'
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = false"
        @mousedown="startProgressDrag"
        @touchstart="isFrameNumberVisible = true"
        @touchend="isFrameNumberVisible = false"
        @touchcancel="isFrameNumberVisible = false"
        @click="emitProgressEvent($event, annotation)"
        v-for="(annotation, index) in annotations"
      >
      </span>
      <span
        :key="`annotation-comparison-${index}`"
        class="annotation-mark comparison-mark"
        :style="{
          left: getAnnotationPosition(annotation) + 'px',
          width: Math.max(effectiveFrameSize - 1, 5) + 'px'
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = false"
        @touchstart="isFrameNumberVisible = true"
        @touchend="isFrameNumberVisible = false"
        @touchcancel="isFrameNumberVisible = false"
        @click="emitProgressEvent($event, annotation)"
        v-for="(annotation, index) in comparisonAnnotations"
      >
      </span>
    </div>

    <div class="frame-number-rail">
      <span
        class="frame-number"
        :style="frameNumberStyle"
        v-show="
          isFrameNumberVisible && hoverFrame > 0 && !empty && !progressDragging
        "
      >
        {{ hoverFrame }}
        <span
          class="frame-tile"
          :style="getFrameBackgroundStyle(hoverFrame)"
        ></span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import {
  getTileCellIndex,
  getTileGeometry,
  TILE_CELL_HEIGHT,
  TILE_COLUMNS
} from '@/lib/players/tiles'

const props = defineProps({
  annotations: {
    default: () => [],
    type: Array
  },
  backgroundUrl: {
    default: null,
    type: String
  },
  comparisonAnnotations: {
    default: () => [],
    type: Array
  },
  empty: {
    default: false,
    type: Boolean
  },
  frameDuration: {
    default: 0,
    type: Number
  },
  handleIn: {
    default: 3,
    type: Number
  },
  handleOut: {
    default: 3,
    type: Number
  },
  isFullMode: {
    default: false,
    type: Boolean
  },
  isFullScreen: {
    default: false,
    type: Boolean
  },
  movieDimensions: {
    default: () => ({}),
    type: Object
  },
  nbFrames: {
    default: 0,
    type: Number
  },
  previewId: {
    default: '',
    type: String
  },
  urlPrefix: {
    default: null,
    type: String
  }
})

const emit = defineEmits([
  'end-scrub',
  'handle-in-changed',
  'handle-out-changed',
  'progress-changed',
  'start-scrub'
])

const frameNumberLeftPosition = ref(0)
const handleInDragging = ref(false)
const handleOutDragging = ref(false)
const hoverFrame = ref(0)
const isFrameNumberVisible = ref(false)
const progress = ref(null)
const progressDragging = ref(false)
const tileGeometry = ref(null)
const width = ref(0)

// Mouse scratch state; not reactive — written from event handlers, never read by template
let currentMouseFrame = {}

const getClientX = event =>
  event.touches?.[0]?.clientX ??
  event.changedTouches?.[0]?.clientX ??
  event.clientX

const videoDuration = computed(() => props.nbFrames * props.frameDuration)

const backgroundSize = computed(() => {
  if (videoDuration.value) {
    return 200 / props.nbFrames + '% 100%'
  } else {
    return '300%'
  }
})

// Alternating frame stripes generated at the exact frame size, using the
// two colors sampled from the legacy player-timeslider.png — the
// stretched texture blurred as soon as the clip had few frames. Stripes
// are dropped when frames get too dense to read.
// Below this per-frame width the alternating stripes are too dense to read
// and just shimmer, so we drop them. The clip is then painted a solid dark
// grey rather than exposing the light base background, which on long clips
// looked like a rendering bug.
const DENSE_FRAME_FALLBACK = 'linear-gradient(rgb(54, 57, 63), rgb(54, 57, 63))'

const frameTicksGradient = computed(() => {
  const size = effectiveFrameSize.value
  if (!size || size < 3) return DENSE_FRAME_FALLBACK
  // Anchor the stripe phase on the view window so frames keep their
  // shade while panning/zooming.
  const phase = -(viewStartFrame.value % 2) * size
  return (
    `repeating-linear-gradient(to right, ` +
    `rgb(54, 57, 63) ${phase}px, rgb(54, 57, 63) ${phase + size}px, ` +
    `rgb(84, 89, 98) ${phase + size}px, rgb(84, 89, 98) ${phase + 2 * size}px)`
  )
})

// — Timeline zoom: the bar shows a [viewStartFrame, viewStartFrame +
// nbFrames / zoomLevel] window of the clip. Every on-screen position
// goes through frameToX / xToFrame so marks, handles, fill, clicks and
// stripes share one mapping. zoomLevel 1 = the whole clip (status quo).
const zoomLevel = ref(1)
const viewStartFrame = ref(0)

const visibleFrames = computed(() => props.nbFrames / zoomLevel.value)
const effectiveFrameSize = computed(() => width.value / visibleFrames.value)

const frameToX = frame =>
  (frame - viewStartFrame.value) * effectiveFrameSize.value
const xToFrame = x => viewStartFrame.value + x / effectiveFrameSize.value

const clampViewStart = start =>
  Math.min(Math.max(start, 0), props.nbFrames - visibleFrames.value)

const onWheelZoom = event => {
  // Zoom is a Ctrl+wheel gesture (map-style): a plain wheel keeps
  // scrolling the surrounding widgets/page.
  if (!event.ctrlKey) return
  event.preventDefault()
  if (props.empty || !props.nbFrames) return
  const anchorFrame = xToFrame(getClientX(event) - getProgressLeft())
  const factor = event.deltaY < 0 ? 1.25 : 1 / 1.25
  // Never zoom past ~8 visible frames, never below the full clip.
  const maxZoom = Math.max(props.nbFrames / 8, 1)
  zoomLevel.value = Math.min(Math.max(zoomLevel.value * factor, 1), maxZoom)
  if (zoomLevel.value === 1) {
    viewStartFrame.value = 0
    return
  }
  // Keep the frame under the cursor stationary while zooming.
  const cursorX = getClientX(event) - getProgressLeft()
  viewStartFrame.value = clampViewStart(
    anchorFrame - cursorX / effectiveFrameSize.value
  )
}

let minimapDragging = false

const startMinimapDrag = event => {
  minimapDragging = true
  panMinimap(event)
  const move = e => panMinimap(e)
  const up = () => {
    minimapDragging = false
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

const panMinimap = event => {
  if (!minimapDragging || !width.value) return
  const x = getClientX(event) - getProgressLeft()
  const centerFrame = (x / width.value) * props.nbFrames
  viewStartFrame.value = clampViewStart(centerFrame - visibleFrames.value / 2)
}

const getProgressLeft = () => {
  if (!progress.value) return 0
  const left = progress.value.getBoundingClientRect().left
  if (
    left === 0 &&
    !props.isFullScreen &&
    progress.value.parentElement.offsetParent
  ) {
    return progress.value.parentElement.offsetParent.offsetLeft
  }
  return left
}

const videoRatio = computed(() =>
  props.movieDimensions.width
    ? props.movieDimensions.width / props.movieDimensions.height
    : 1
)

const handleInWidth = computed(
  () => Math.min(Math.max(frameToX(props.handleIn), 0), width.value || 0) + 'px'
)

const handleOutWidth = computed(
  () =>
    Math.min(
      Math.max((width.value || 0) - frameToX(props.handleOut), 0),
      width.value || 0
    ) + 'px'
)

const frameNumberStyle = computed(() => {
  const frameHeight = TILE_CELL_HEIGHT
  const height = frameHeight + 30
  const frameWidth =
    tileGeometry.value?.cellWidth ?? Math.ceil(frameHeight * videoRatio.value)
  const w = frameWidth + 10
  const left = Math.min(
    Math.max(frameNumberLeftPosition.value - frameWidth / 2, 0),
    width.value - frameWidth - 10
  )
  const top = `-${height + 30}px`
  return {
    height: `${height}px`,
    width: `${w}px`,
    top,
    left: `${left}px`
  }
})

const onWindowResize = () => {
  if (progress.value) {
    const coords = progress.value.getBoundingClientRect()
    width.value = coords.width
  }
}

watch(
  () => props.previewId,
  () => {
    tileGeometry.value = null
    if (!props.previewId) return
    const previewId = props.previewId
    const base = props.urlPrefix || '/api'
    getTileGeometry(`${base}/movies/tiles/preview-files/${previewId}.png`).then(
      geometry => {
        // Guard against a preview switch racing the load.
        if (props.previewId === previewId) tileGeometry.value = geometry
      }
    )
  },
  { immediate: true }
)

const getAnnotationPosition = annotation => {
  if (props.nbFrames === 0) return 0
  const frameNumber = Math.round(annotation.time / props.frameDuration)
  return frameToX(frameNumber)
}

// Remember the last frame pushed by the parent so the fill can be
// recomputed when the zoom window moves.
let lastProgressFrame = 0

const updateProgressBar = frameNumber => {
  lastProgressFrame = frameNumber
  const relative = frameNumber - viewStartFrame.value
  progress.value.value = props.empty
    ? relative * props.frameDuration
    : (relative + 1) * props.frameDuration
}

const startProgressDrag = () => {
  progressDragging.value = true
  emit('start-scrub')
}

const stopProgressDrag = () => {
  progressDragging.value = false
  emit('end-scrub')
}

const startHandleInDrag = () => {
  handleInDragging.value = true
}

const stopHandleInDrag = () => {
  if (handleInDragging.value) {
    handleInDragging.value = false
    const { frameNumber } = currentMouseFrame
    emit('handle-in-changed', { frameNumber, save: true })
  }
}

const startHandleOutDrag = () => {
  handleOutDragging.value = true
}

const stopHandleOutDrag = () => {
  if (handleOutDragging.value) {
    handleOutDragging.value = false
    let { frameNumber, position } = currentMouseFrame
    if (width.value - position < 4) frameNumber += 1
    emit('handle-out-changed', { frameNumber, save: true })
  }
}

const getMouseFrame = (event, annotation) => {
  let left = progress.value.getBoundingClientRect().left
  if (
    left === 0 &&
    !props.isFullScreen &&
    progress.value.parentElement.offsetParent
  ) {
    left = progress.value.parentElement.offsetParent.offsetLeft
  }
  let position = getClientX(event) - left
  if (position > width.value) position = width.value - 1
  // Clicking an annotation marker must land on that annotation's exact
  // frame so the annotation loads — not the pixel the cursor hit, which can
  // be a frame off and make the annotation lookup miss. Bar clicks (no
  // annotation) map the click position through the zoom window.
  let duration = annotation
    ? annotation.time
    : xToFrame(position) * props.frameDuration
  if (duration < 0) duration = 0

  const isChromium = !!window.chrome
  const change = isChromium ? props.frameDuration : 0
  const vd = props.nbFrames * props.frameDuration
  if (duration > vd) {
    duration = vd - change
  }
  // Annotation times sit exactly on the frame grid (N * frameDuration), but
  // the float quotient can land just below N — floor() would drop to the
  // previous frame. round() matches getAnnotationPosition, so the click lands
  // on the frame the marker is drawn on. Bar clicks keep floor(): their
  // duration is a continuous position, not a grid value.
  const frameNumber = annotation
    ? Math.round(annotation.time / props.frameDuration)
    : Math.floor(duration / props.frameDuration)
  return { frameNumber, position }
}

const doProgressDrag = event => {
  if (
    progressDragging.value ||
    handleInDragging.value ||
    handleOutDragging.value ||
    isFrameNumberVisible.value
  ) {
    currentMouseFrame = getMouseFrame(event)
    const { frameNumber } = currentMouseFrame
    hoverFrame.value = frameNumber + 1
    frameNumberLeftPosition.value = frameToX(frameNumber)
    if (progressDragging.value) {
      emit('progress-changed', frameNumber)
    } else if (handleInDragging.value) {
      emit('handle-in-changed', { frameNumber, save: false })
    } else if (handleOutDragging.value) {
      let { frameNumber, position } = currentMouseFrame
      if (width.value - position < 4) frameNumber += 1
      emit('handle-out-changed', { frameNumber, save: false })
    }
  }
}

const onProgressClicked = event => {
  emitProgressEvent(event)
}

const emitProgressEvent = (event, annotation) => {
  const { frameNumber } = getMouseFrame(event, annotation)
  if (frameNumber < 0) return
  emit('progress-changed', frameNumber)
}

const getFrameBackgroundStyle = frame => {
  if (!frame) return {}
  const previewId = props.previewId
  const base = props.urlPrefix || '/api'
  const tilePath = `${base}/movies/tiles/preview-files/${previewId}.png`
  // Measured sprite geometry beats recomputing the cell width from the
  // preview's stored dimensions, which drift from the file the sprite
  // was built from (source ratio ≠ production ratio, renormalisations).
  const geometry = tileGeometry.value
  const frameWidth =
    geometry?.cellWidth ?? Math.ceil(TILE_CELL_HEIGHT * videoRatio.value)
  const cellCount = geometry?.cellCount ?? 3840
  const cell = getTileCellIndex(frame - 1, props.nbFrames, cellCount)
  const frameX = cell % TILE_COLUMNS
  const frameY = Math.floor(cell / TILE_COLUMNS)
  return {
    background: `url(${tilePath})`,
    'background-position': `-${frameX * frameWidth}px -${
      frameY * TILE_CELL_HEIGHT
    }px`,
    width: `${frameWidth}px`
  }
}

const domEvents = [
  ['mousemove', doProgressDrag],
  ['touchmove', doProgressDrag],
  ['mouseup', stopProgressDrag],
  ['mouseleave', stopProgressDrag],
  ['touchend', stopProgressDrag],
  ['touchcancel', stopProgressDrag],
  ['mouseup', stopHandleInDrag],
  ['mouseleave', stopHandleInDrag],
  ['touchend', stopHandleInDrag],
  ['touchcancel', stopHandleInDrag],
  ['mouseup', stopHandleOutDrag],
  ['mouseleave', stopHandleOutDrag],
  ['touchend', stopHandleOutDrag],
  ['touchcancel', stopHandleOutDrag]
]

let resizeObserver = null

onMounted(() => {
  domEvents.forEach(([type, listener]) =>
    document.addEventListener(type, listener)
  )
  resizeObserver = new ResizeObserver(onWindowResize)
  resizeObserver.observe(progress.value)
  const coords = progress.value.getBoundingClientRect()
  width.value = coords.width
  setTimeout(() => {
    width.value = coords.width
  })
  progress.value.setAttribute('max', videoDuration.value)
})

watch(videoDuration, () => {
  const coords = progress.value.getBoundingClientRect()
  width.value = coords.width
  progress.value.setAttribute('max', videoDuration.value)
  updateProgressBar(0)
})

// Keep the fill consistent when the zoom window changes: the bar's max
// becomes the visible duration and the fill is recomputed against the
// last frame the parent pushed.
watch([zoomLevel, viewStartFrame], () => {
  if (!progress.value) return
  progress.value.setAttribute('max', visibleFrames.value * props.frameDuration)
  updateProgressBar(lastProgressFrame)
})

// A new preview means a new timeline: drop the zoom.
watch(
  () => props.previewId,
  () => {
    zoomLevel.value = 1
    viewStartFrame.value = 0
  }
)

onBeforeUnmount(() => {
  domEvents.forEach(([type, listener]) =>
    document.removeEventListener(type, listener)
  )
  resizeObserver?.disconnect()
})

defineExpose({ updateProgressBar })
</script>

<style lang="scss" scoped>
.annotation-mark {
  background: #ee2750;
  border-radius: 2px;
  cursor: pointer;
  display: inline-block;
  height: 20px;
  position: absolute;
  top: 4px;

  &.comparison-mark {
    opacity: 0.5;
  }
}

.timeline-minimap {
  background: rgb(40, 42, 47);
  cursor: grab;
  height: 6px;
  position: relative;
  width: 100%;

  .minimap-window {
    background: rgba(255, 255, 255, 0.35);
    border-radius: 2px;
    height: 100%;
    position: absolute;
    top: 0;
  }
}

.progress-wrapper {
  background: $grey;
  background-repeat: repeat-x;
  // Zoomed views position marks/handles outside the window: clip them.
  overflow: hidden;
  border: 0;
  cursor: pointer;
  flex-shrink: 0;
  height: 28px;
  margin: 0;
  // A horizontal pen / touch drag along the timeline would otherwise
  // trigger Chrome's two-finger swipe gesture and navigate back / forward,
  // dropping any unsaved comment text — issue #1700.
  overscroll-behavior-x: contain;
  touch-action: pan-y;
  padding: 0;
  position: relative;
  width: 100%;
}

progress::-moz-progress-bar {
  background-color: #43b581;
  opacity: 0.6;
}

progress::-webkit-progress-value {
  background-color: #43b581;
  opacity: 0.6;
}

progress[value]::-webkit-progress-bar,
progress {
  background-color: transparent;
  border: 0;
  border-top: 1px solid $dark-grey-light;
  border-bottom: 1px solid $dark-grey-light;
  border-radius: 0;
  display: block;
  height: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
}

.frame-number {
  background: $black;
  border-radius: 5px;
  color: $white;
  position: absolute;
  padding: 0.3em;
  text-align: center;
  top: -300px;
  width: 110px;
  z-index: 800;
  display: flex;
  flex-direction: column;
  font-variant-numeric: tabular-nums;

  .frame-tile {
    display: inline-block;
    background-repeat: no-repeat;
    height: 100px;
  }
}

.frame-number-rail {
  position: relative;
}

// Touch devices fire `touchstart` on the progress bar but never a clean
// hover-leave, so the frame thumbnail would otherwise stick on screen.
// Hide it entirely on hoverless / coarse pointers.
@media (hover: none), (pointer: coarse) {
  .frame-number {
    display: none !important;
  }
}

// Trim handles, NLE-bracket style: a thick vertical bar with top and
// bottom lips marking the in/out bounds, the excluded zones lightly
// veiled so the timeline stays readable, frame numbers always visible.
.handle-in,
.handle-out {
  background: rgba(0, 0, 0, 0.45);
  display: inline-block;
  height: 28px;
  position: absolute;
  z-index: 100;

  // Same number presentation as the legacy handles: vertically centered
  // in the veiled zone, next to the bracket.
  .handle-frame {
    color: $grey;
    font-variant-numeric: tabular-nums;
    line-height: 28px;
    position: absolute;
    top: 0;
    z-index: 130;
  }

  // The bracket: vertical bar + top/bottom lips pointing inward,
  // drawn as solid blocks (borders got visually truncated).
  &::after {
    background: $dark-purple;
    content: ' ';
    cursor: ew-resize;
    bottom: 0;
    position: absolute;
    top: 0;
    transition: width 0.1s ease-in-out;
    width: 4px;
    z-index: 120;
  }

  &::before {
    background:
      linear-gradient($dark-purple, $dark-purple) top / 100% 4px no-repeat,
      linear-gradient($dark-purple, $dark-purple) bottom / 100% 4px no-repeat;
    bottom: 0;
    content: ' ';
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 9px;
    z-index: 120;
  }

  &:hover,
  &.dragging {
    &::after {
      width: 6px;
    }
  }
}

.handle-in {
  left: 0;

  .handle-frame {
    right: 8px;
  }

  &::after {
    right: -4px;
  }

  &::before {
    right: -9px;
  }
}

.handle-out {
  overflow: visible;
  right: 0;

  .handle-frame {
    left: 8px;
  }

  &::after {
    left: -4px;
  }

  &::before {
    left: -9px;
  }
}
</style>

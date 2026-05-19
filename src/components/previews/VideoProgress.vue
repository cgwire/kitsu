<template>
  <div class="unselectable">
    <div
      class="progress-wrapper"
      :style="{
        'background-size': backgroundSize,
        ...(backgroundUrl
          ? { 'background-image': `url(${backgroundUrl})` }
          : {})
      }"
      @mouseenter="isFrameNumberVisible = true"
      @mouseleave="isFrameNumberVisible = false"
      @touchstart="isFrameNumberVisible = true"
      @touchend="isFrameNumberVisible = false"
      @touchcancel="isFrameNumberVisible = false"
    >
      <span
        class="handle-in"
        :style="{
          width: handleInWidth,
          'padding-right': handleIn > 1 ? '5px' : 0
        }"
        @mousedown="startHandleInDrag"
        @touchstart="startHandleInDrag"
        v-if="handleIn >= 0 && !isFullMode && !empty"
      >
        {{ handleIn !== 0 ? handleIn + 1 : '' }}
      </span>

      <span
        class="handle-out"
        :style="{
          width: frameSize * (nbFrames - handleOut) + 'px'
        }"
        @mousedown="startHandleOutDrag"
        @touchstart="startHandleOutDrag"
        v-if="handleOut >= 0 && !isFullMode && !empty"
      >
        {{ handleOut + 1 }}
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
          width: Math.max(frameSize - 1, 5) + 'px'
        }"
        @mouseenter="isFrameNumberVisible = true"
        @mouseleave="isFrameNumberVisible = false"
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
          width: Math.max(frameSize - 1, 5) + 'px'
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
  handleIn: {
    default: 3,
    type: Number
  },
  handleOut: {
    default: 3,
    type: Number
  },
  previewId: {
    default: '',
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

const progress = ref(null)
const isFrameNumberVisible = ref(false)
const handleInDragging = ref(false)
const handleOutDragging = ref(false)
const hoverFrame = ref(0)
const progressDragging = ref(false)
const width = ref(0)
const frameNumberLeftPosition = ref(0)

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

const frameSize = computed(() => width.value / props.nbFrames)

const videoRatio = computed(() =>
  props.movieDimensions.width
    ? props.movieDimensions.width / props.movieDimensions.height
    : 1
)

const handleInWidth = computed(
  () => Math.max(frameSize.value * props.handleIn, 0) + 'px'
)

const frameNumberStyle = computed(() => {
  const frameHeight = 100
  const height = frameHeight + 30
  const frameWidth = Math.ceil(frameHeight * videoRatio.value)
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

const getAnnotationPosition = annotation => {
  if (props.nbFrames === 0) return 0
  const frameNumber = Math.round(annotation.time / props.frameDuration)
  return frameNumber * frameSize.value
}

const updateProgressBar = frameNumber => {
  progress.value.value = props.empty
    ? frameNumber * props.frameDuration
    : (frameNumber + 1) * props.frameDuration
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
  const ratio = position / width.value
  let duration =
    annotation && frameSize.value < 3
      ? annotation.time
      : videoDuration.value * ratio
  if (duration < 0) duration = 0

  const isChromium = !!window.chrome
  const change = isChromium ? props.frameDuration : 0
  const vd = props.nbFrames * props.frameDuration
  if (duration > vd) {
    duration = vd - change
  }
  const frameNumber = Math.floor(duration / props.frameDuration)
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
    frameNumberLeftPosition.value = (width.value / props.nbFrames) * frameNumber
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
  frame = frame - 1
  if (props.nbFrames >= 3840) {
    frame = Math.ceil(frame / Math.ceil(props.nbFrames / 3840))
  }
  const frameX = frame % 8
  const frameY = Math.floor(frame / 8)
  const frameHeight = 100
  const frameWidth = Math.ceil(frameHeight * videoRatio.value)
  const tilePath = `/api/movies/tiles/preview-files/${previewId}.png`
  return {
    background: `url(${tilePath})`,
    'background-position': `-${frameX * frameWidth}px -${
      frameY * frameHeight
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

onMounted(() => {
  domEvents.forEach(([type, listener]) =>
    document.addEventListener(type, listener)
  )
  new ResizeObserver(onWindowResize).observe(progress.value)
  const coords = progress.value.getBoundingClientRect()
  width.value = coords.width
  setTimeout(() => {
    width.value = coords.width
  })
  progress.value.setAttribute('max', videoDuration.value)
})

onBeforeUnmount(() => {
  domEvents.forEach(([type, listener]) =>
    document.removeEventListener(type, listener)
  )
})

watch(videoDuration, () => {
  const coords = progress.value.getBoundingClientRect()
  width.value = coords.width
  progress.value.setAttribute('max', videoDuration.value)
  updateProgressBar(0)
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

.progress-wrapper {
  background: $grey;
  background-image: url('../../assets/background/player-timeslider.png');
  background-repeat: repeat-x;
  border: 0;
  cursor: pointer;
  flex-shrink: 0;
  height: 28px;
  margin: 0;
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

.handle-in {
  background: $black;
  color: $grey;
  display: inline-block;
  height: 28px;
  left: 0;
  opacity: 0.9;
  padding-top: 3px;
  position: absolute;
  z-index: 100;
  text-align: right;
}

.handle-in::after {
  bottom: 0;
  background: $dark-purple;
  content: ' ';
  cursor: pointer;
  height: 34px;
  position: absolute;
  right: -5px;
  top: -2px;
  width: 5px;
  z-index: 120;
}

.handle-out {
  background: $black;
  color: $grey;
  display: inline-block;
  height: 28px;
  overflow: hidden;
  padding-left: 10px;
  padding-top: 3px;
  position: absolute;
  opacity: 0.9;
  right: 0;
  z-index: 100;
}

.handle-out::before {
  bottom: 0;
  background: $dark-purple;
  content: ' ';
  cursor: pointer;
  height: 34px;
  left: 0;
  position: absolute;
  top: -2px;
  width: 5px;
  z-index: 120;
}
</style>

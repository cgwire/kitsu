<template>
  <div
    ref="container"
    class="video-player"
    :style="{
      'border-top-left-radius': isRoundedTopBorder ? '10px' : '',
      'border-top-right-radius': isRoundedTopBorder ? '10px' : ''
    }"
    @click="$emit('click')"
  >
    <div
      class="video-wrapper"
      :style="{
        'border-top-left-radius': isRoundedTopBorder ? '10px' : '',
        'border-top-right-radius': isRoundedTopBorder ? '10px' : ''
      }"
    >
      <div class="loading-background" v-if="isLoading">
        <spinner class="spinner" />
      </div>
      <video
        ref="movie"
        class="annotation-movie-decoder"
        :src="moviePath"
        :poster="posterPath"
        preload="auto"
        type="video/mp4"
        playsinline
      ></video>
      <canvas
        ref="displayCanvas"
        class="annotation-movie"
        v-show="!isLoading"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import createPanzoom from 'panzoom'
import { useStore } from 'vuex'

import {
  createFrameRenderer,
  supportsVideoFrameCallback
} from '@/lib/players/frameRenderer'
import { formatFrame } from '@/lib/video'

import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  big: {
    type: Boolean,
    default: false
  },
  currentFrame: {
    type: Number,
    default: 0
  },
  defaultHeight: {
    type: Number,
    default: 0
  },
  fps: {
    type: Number,
    default: null
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  isComparing: {
    type: Boolean,
    default: false
  },
  isComparisonOverlay: {
    type: Boolean,
    default: false
  },
  isDrawing: {
    type: Boolean,
    default: false
  },
  isHd: {
    type: Boolean,
    default: false
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isRepeating: {
    type: Boolean,
    default: false
  },
  isRoundedTopBorder: {
    type: Boolean,
    default: false
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  nbFrames: {
    type: Number,
    default: 0
  },
  panzoom: {
    type: Boolean,
    default: false
  },
  preview: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'click',
  'duration-changed',
  'frame-update',
  'panzoom-changed',
  'panzoom-ready',
  'play-ended',
  'size-changed',
  'time-update',
  'video-end',
  'video-loaded'
])

const store = useStore()

const container = ref(null)
const currentTimeRaw = ref(0)
const displayCanvas = ref(null)
const isLoading = ref(false)
const movie = ref(null)
const videoDuration = ref(0)

let panzoomInstance = null
let panzoomSilent = false
// Track whether the panzoom should be active across instance
// recreations. The instance is only built after the video metadata
// loads (so its bounds clamp doesn't race a 0×0 target), which can
// happen after PreviewPlayer already called resumeZoom() at mount —
// so we remember that intent here and apply it when the instance
// finally exists.
let panzoomActive = false
let currentTimeCalls = []
let lastEmittedFrame = null
let isPlaying = false
let previousDimensions = null

let renderer = null
let renderLoopHandle = null
let renderLoopIsRvfc = false
// mediaTime of the last frame the browser actually presented. The
// source of truth for emitted times/frames (currentTime lies during
// decode latency, which is the whole point of this pipeline).
let lastMediaTime = 0
// iOS Safari may not decode any frame before a user gesture: paint the
// poster so the canvas isn't black until the first rVFC tick.
let hasPaintedVideoFrame = false

const currentProduction = computed(() => store.getters.currentProduction)

const video = computed(() => movie.value)

const extension = computed(() => (props.preview ? props.preview.extension : ''))

const fps = computed(
  () => props.fps || parseFloat(currentProduction.value?.fps) || 25
)

const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

const isAvailable = computed(() => {
  const s =
    props.preview && props.preview.status ? props.preview.status : 'ready'
  return !['broken', 'missing', 'processing'].includes(s)
})

const isMovie = computed(() => extension.value === 'mp4')

const moviePath = computed(() => {
  if (extension.value === 'mp4' && isAvailable.value && !props.isHd) {
    return `/api/movies/low/preview-files/${props.preview.id}.mp4`
  } else if (extension.value === 'mp4' && isAvailable.value) {
    return `/api/movies/originals/preview-files/${props.preview.id}.mp4`
  } else {
    return null
  }
})

const posterPath = computed(() => {
  if (extension.value === 'mp4' && isAvailable.value) {
    return `/api/pictures/previews/preview-files/${props.preview.id}.png`
  } else {
    return null
  }
})

const getNaturalDimensions = () => ({
  height: video.value ? video.value.videoHeight : 0,
  width: video.value ? video.value.videoWidth : 0
})

const getDimensions = () => {
  const dimensions = getNaturalDimensions()
  const ratio = dimensions.height / dimensions.width || 1
  const fullWidth = container.value ? container.value.offsetWidth : 0
  const fullHeight = container.value ? container.value.offsetHeight : 0
  let width = fullWidth
  let height = Math.floor(width * ratio)
  if (height > fullHeight) {
    height = fullHeight
    width = height / ratio
  }
  return { width, height }
}

const getLastPushedCurrentTime = () => {
  const length = currentTimeCalls.length
  if (length > 0) {
    return currentTimeCalls[length - 1]
  } else {
    return currentTimeRaw.value
  }
}

// Seek to the middle of the target frame rather than its boundary.
// frame / fps lands right on the edge between two frames, and the rounding
// in frameDuration (0.0833 instead of 0.083333… at 12fps) drifts ~1ms per
// frame, so past ~frame 30 the seek tips into the previous frame and the
// player renders a duplicate. Half a frame of slack dwarfs any rounding
// error, so the correct frame is always decoded — and fps (unrounded) is
// used so there is no drift to begin with.
const frameToTime = frame => (frame + 0.5) / fps.value

const setCurrentFrame = frame => {
  setCurrentTime(frameToTime(frame))
}

const setCurrentTimeRaw = currentTime => {
  if (currentTime < frameDuration.value) currentTime = 0
  video.value.currentTime = currentTime
}

const runSetCurrentTime = () => {
  if (currentTimeCalls.length === 0) {
    return
  } else {
    const currentTime = currentTimeCalls.shift()
    if (video.value.currentTime !== currentTime) {
      video.value.currentTime = currentTime
    }
    setTimeout(() => {
      runSetCurrentTime()
    }, 10)
  }
}

const setCurrentTime = currentTime => {
  currentTimeCalls.push(currentTime)
  runSetCurrentTime()
}

const resetSize = () => {
  const { height: initialHeight } = getDimensions()
  if (initialHeight > 0) {
    container.value.style.height = props.defaultHeight + 'px'
    displayCanvas.value.style.height = initialHeight + 'px'
    const videoPosition = displayCanvas.value.getBoundingClientRect()
    const containerPosition = container.value.getBoundingClientRect()
    const top = videoPosition.top - containerPosition.top
    const left = videoPosition.left - containerPosition.left
    const width = videoPosition.width
    const height = videoPosition.height

    if (
      !previousDimensions ||
      previousDimensions.width !== width ||
      previousDimensions.height !== height ||
      previousDimensions.left !== left ||
      previousDimensions.top !== top
    ) {
      emit('size-changed', { width, height, top, left })
    }
    previousDimensions = { width, height, top, left }
  } else {
    emit('size-changed', { width: 0, height: 0, top: 0, left: 0 })
  }
}

const mountVideo = () => {
  if (!isMovie.value) return
  video.value.muted = props.isMuted
  videoDuration.value = video.value.duration
  isLoading.value = false
  emit('duration-changed', videoDuration.value)
  if (!renderer && displayCanvas.value) {
    renderer = createFrameRenderer(displayCanvas.value, video.value)
  }
  resizeRenderer()
  if (renderLoopHandle === null) startRenderLoop()
  paintPosterFallback()
  resetSize()
  setTimeout(() => {
    resetSize()
  }, 500)
}

const configureVideo = () => {
  video.value.onended = onVideoEnd
  if (video.value.currentTime === 0) {
    mountVideo()
  }
}

// rVFC mediaTime is the frame's PRESENTATION time (its start boundary),
// while every consumer is calibrated on the mid-frame currentTime that
// frameToTime() seeks produce. Re-center so all emitted values stay
// bit-identical to the old pipeline.
const playerTimeFromMediaTime = mediaTime => mediaTime + frameDuration.value / 2

const getFrameFromPlayer = () => {
  const raw =
    lastMediaTime > 0
      ? playerTimeFromMediaTime(lastMediaTime)
      : video.value
        ? video.value.currentTime
        : 0
  if (raw === 0) return 0
  let frame = Math.ceil(raw / frameDuration.value) + 1
  frame = Number(frame.toPrecision(4))
  frame = Math.min(frame, props.nbFrames)
  return frame
}

const emitFrameSignals = playerTime => {
  emit('time-update', playerTime)
  const frame = getFrameFromPlayer()
  if (frame !== lastEmittedFrame) {
    lastEmittedFrame = frame
    emit('frame-update', frame)
  }
}

// One continuous loop, play AND pause: a paused seek still presents a
// new frame, and that presentation is exactly when to repaint and
// announce the frame.
const startRenderLoop = () => {
  stopRenderLoop()
  if (supportsVideoFrameCallback()) {
    renderLoopIsRvfc = true
    const tick = (now, metadata) => {
      if (!video.value) return
      hasPaintedVideoFrame = true
      lastMediaTime = metadata.mediaTime
      currentTimeRaw.value = metadata.mediaTime
      renderer?.drawFrame()
      emitFrameSignals(playerTimeFromMediaTime(metadata.mediaTime))
      renderLoopHandle = video.value.requestVideoFrameCallback(tick)
    }
    renderLoopHandle = video.value.requestVideoFrameCallback(tick)
  } else {
    // Fallback (no rVFC): poll currentTime at rAF cadence. Same
    // accuracy as the old pipeline — no worse, just not better.
    renderLoopIsRvfc = false
    let lastDrawnTime = -1
    const tick = () => {
      if (video.value && video.value.currentTime !== lastDrawnTime) {
        hasPaintedVideoFrame = true
        lastDrawnTime = video.value.currentTime
        currentTimeRaw.value = lastDrawnTime
        renderer?.drawFrame()
        emitFrameSignals(lastDrawnTime)
      }
      renderLoopHandle = requestAnimationFrame(tick)
    }
    renderLoopHandle = requestAnimationFrame(tick)
  }
}

const stopRenderLoop = () => {
  if (renderLoopHandle === null) return
  if (renderLoopIsRvfc) {
    video.value?.cancelVideoFrameCallback?.(renderLoopHandle)
  } else {
    cancelAnimationFrame(renderLoopHandle)
  }
  renderLoopHandle = null
}

const getDisplaySurface = () => displayCanvas.value

const resizeRenderer = () => {
  if (!renderer || !video.value) return
  renderer.resize(video.value.videoWidth, video.value.videoHeight)
  renderer.drawFrame()
}

const paintPosterFallback = () => {
  if (hasPaintedVideoFrame || !renderer || !posterPath.value) return
  const poster = new Image()
  poster.onload = () => {
    if (!hasPaintedVideoFrame) renderer?.drawFrame(poster)
  }
  poster.src = posterPath.value
}

const play = () => {
  if (
    !isPlaying &&
    videoDuration.value === video.value.currentTime &&
    props.name.indexOf('comparison') < 0
  ) {
    setCurrentTime(0)
  }
  video.value.play()
}

const pause = () => {
  video.value.pause()
  video.value.currentTime = frameToTime(props.currentFrame)
  emit('frame-update', props.currentFrame)
}

const toggleMute = () => {
  video.value.muted = !video.value.muted
}

const goPreviousFrame = () => {
  const nextFrame = props.currentFrame - 1
  if (nextFrame < 0) return
  video.value.currentTime = frameToTime(nextFrame)
  emit('frame-update', nextFrame)
  return nextFrame
}

const goNextFrame = () => {
  const nextFrame = props.currentFrame + 1
  if (nextFrame >= props.nbFrames) return
  video.value.currentTime = frameToTime(nextFrame)
  emit('frame-update', nextFrame)
  return nextFrame
}

const onVideoEnd = () => {
  isPlaying = false
  // a queued 'ended' event can fire after unmount, once the ref is nulled
  if (!video.value) return
  if (props.isRepeating) {
    emit('video-end')
    video.value.currentTime = 0
    play()
  } else {
    emit('play-ended')
  }
}

const onWindowResize = () => {
  mountVideo()
}

const resetPanZoom = () => {
  if (panzoomInstance) {
    panzoomInstance.moveTo(0, 0)
    panzoomInstance.zoomAbs(0, 0, 1)
  }
}

const setPanZoom = (x, y, scale) => {
  if (!panzoomInstance) return
  panzoomSilent = true
  const actualScale = panzoomInstance.getTransform().scale
  const zoomFactor = scale / actualScale
  panzoomInstance.moveTo(x, y)
  panzoomInstance.setTransformOrigin({ x, y })
  panzoomInstance.zoomTo(x, y, zoomFactor)
  // null restores cursor-relative wheel zoom; {x:0,y:0} would lock the
  // focal point at the top-left corner.
  panzoomInstance.setTransformOrigin(null)
  nextTick(() => {
    panzoomSilent = false
  })
}

const emitPanZoom = () => {
  if (panzoomSilent || !panzoomInstance) return
  const { x, y, scale } = panzoomInstance.getTransform()
  emit('panzoom-changed', { x, y, scale, source: 'movie' })
}

// Bind panzoom to the canvas rather than the wrapping container: the
// canvas is flex-centered inside the wrapper, so scaling the wrapper
// multiplies the centering offset and the canvas drifts relative to the
// AnnotationCanvas overlay (which applies the same transform from its
// own top-left origin). Setup is deferred until metadata is loaded so
// panzoom's bounds clamp doesn't compute against a 0×0 target — that
// raced the load on slow connections and left the canvas off-centre.
const setupPanZoom = () => {
  if (!props.panzoom || !displayCanvas.value) return
  if (panzoomInstance) {
    panzoomInstance.dispose()
    panzoomInstance = null
  }
  // panzoom listens on `displayCanvas.parentElement` (.video-wrapper), which
  // is forced to 100% of the viewer and leaves gutters on the sides
  // of the canvas. Without these guards a click / wheel in the gutter
  // would still trigger pan or zoom. Ignore any event whose target
  // isn't the canvas itself. The AnnotationCanvas wheel forwarder
  // dispatches on displayCanvas.value directly, so wheel-from-overlay (zoom
  // while drawing) keeps working.
  panzoomInstance = createPanzoom(displayCanvas.value, {
    bounds: true,
    boundsPadding: 0.2,
    maxZoom: 5,
    minZoom: 1,
    smoothScroll: false,
    beforeMouseDown: e => e.target !== displayCanvas.value,
    beforeWheel: e => e.target !== displayCanvas.value,
    // panzoom otherwise puts tabindex=0 on the owner and steals arrow
    // keys / +/- to pan and zoom — those shortcuts are owned by the
    // player (frame stepping, annotation navigation), so disable them.
    disableKeyboardInteraction: true
  })
  panzoomInstance.on('zoom', emitPanZoom)
  panzoomInstance.on('pan', emitPanZoom)
  if (!panzoomActive) panzoomInstance.pause()
  // Tell the parent that a fresh instance exists so the comparison
  // sync can re-push the main viewer's transform — without this the
  // comparison stays at identity after a revision swap and drifts
  // out of sync with the main viewer.
  emit('panzoom-ready')
}

const pausePanZoom = () => {
  panzoomActive = false
  panzoomInstance?.pause()
}

const resumePanZoom = () => {
  panzoomActive = true
  panzoomInstance?.resume()
}

const setSpeed = rate => {
  if (video.value) video.value.playbackRate = rate
}

const setVolume = volume => {
  if (video.value) video.value.volume = volume / 100
}

// Watchers

watch(
  () => props.preview,
  () => {
    hasPaintedVideoFrame = false
    lastMediaTime = 0
    // Allow the first frame-update of the new preview even when it lands
    // on the same frame number the previous clip stopped at.
    lastEmittedFrame = null
    paintPosterFallback()
    resetPanZoom()
    pause()
    nextTick(() => {
      resetPanZoom()
      setTimeout(() => {
        resetPanZoom()
      }, 100)
    })
  }
)

watch(
  () => props.light,
  () => {
    resetPanZoom()
    mountVideo()
  }
)

watch(
  () => props.isComparing,
  () => {
    resetPanZoom()
    mountVideo()
  }
)

watch(
  () => props.isComparisonOverlay,
  () => {
    resetPanZoom()
    mountVideo()
  }
)

watch(
  () => props.isMuted,
  () => {
    video.value.muted = props.isMuted
  }
)

watch(
  () => props.fullScreen,
  () => {
    resetPanZoom()
  }
)

// Lifecycle

onMounted(() => {
  currentTimeCalls = []
  container.value.style.height = props.defaultHeight + 'px'
  isLoading.value = true
  if (props.isMuted) {
    video.value.muted = props.isMuted
  }
  setTimeout(() => {
    if (video.value) {
      if (video.value.readyState === 4) {
        configureVideo()
        onWindowResize()
        isLoading.value = false
        setCurrentTime(0)
        setCurrentTimeRaw(0)
        nextTick(() => {
          video.value.currentTime = 0
        })
        emit('video-loaded')
        setupPanZoom()
      }
      video.value.addEventListener('focus', e => e.target.blur())
      video.value.addEventListener('resize', () => {
        resizeRenderer()
        resetSize()
      })

      video.value.addEventListener('loadedmetadata', () => {
        if (!video.value) return
        configureVideo()
        onWindowResize()
        setCurrentTime(0)
        setCurrentTimeRaw(0)
        emit('video-loaded')
        setupPanZoom()
      })

      video.value.addEventListener('canplay', () => {
        isLoading.value = false
      })

      video.value.addEventListener('ended', () => {
        isLoading.value = false
      })

      video.value.addEventListener('error', err => {
        console.error('An error occurred while loading a video', err)
        if (movie.value) {
          movie.value.style.height = props.defaultHeight + 'px'
        }
        isLoading.value = false
      })

      video.value.addEventListener('loadstart', () => {
        isLoading.value = true
      })

      video.value.addEventListener('stalled', () => {
        isLoading.value = true
      })

      video.value.addEventListener('waiting', () => {
        if (props.name.indexOf('comparison') < 0) {
          isLoading.value = true
        }
      })

      window.addEventListener('resize', onWindowResize)
    }
  }, 0)
})

onBeforeUnmount(() => {
  if (video.value) video.value.onended = null
  pause()
  stopRenderLoop()
  renderer?.dispose()
  renderer = null
  window.removeEventListener('resize', onWindowResize)
  panzoomInstance?.dispose()
})

defineExpose({
  currentTimeRaw,
  video,
  formatFrame,
  getNaturalDimensions,
  getDimensions,
  getLastPushedCurrentTime,
  setCurrentFrame,
  setCurrentTimeRaw,
  setCurrentTime,
  configureVideo,
  mountVideo,
  getFrameFromPlayer,
  play,
  pause,
  toggleMute,
  goPreviousFrame,
  goNextFrame,
  resetPanZoom,
  setPanZoom,
  pausePanZoom,
  resumePanZoom,
  setSpeed,
  setVolume,
  resetSize,
  getDisplaySurface
})
</script>

<style lang="scss" scoped>
.loading-background {
  background: #00000088;
  position: absolute;
  display: flex;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.spinner {
  margin: auto;
}

.video-player {
  display: flex;
  flex-direction: column;
  align-content: flex-end;
  height: 100%;
  width: 100%;
  text-align: center;
  background: $dark-grey-2;
  overflow: hidden;
}

.video-wrapper {
  flex: 1;
  display: flex;
  background: black;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: auto;
  width: 100%;
  height: 100%;
  position: relative;
}

.annotation-movie-decoder {
  // Not display:none — some browsers suspend decoding entirely.
  position: absolute;
  visibility: hidden;
  pointer-events: none;
}

canvas.annotation-movie {
  // Same sizing behavior as the old <video>: resetSize() drives the CSS
  // height, the intrinsic bitmap ratio drives the width.
  object-fit: inherit;
}
</style>

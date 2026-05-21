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
        class="annotation-movie"
        :src="moviePath"
        :poster="posterPath"
        preload="auto"
        type="video/mp4"
        v-show="!isLoading"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import createPanzoom from 'panzoom'
import { useStore } from 'vuex'

import { formatFrame } from '@/lib/video'

import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  big: {
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
  isHd: {
    type: Boolean,
    default: false
  },
  isDrawing: {
    type: Boolean,
    default: false
  },
  isTyping: {
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
  light: {
    type: Boolean,
    default: false
  },
  currentFrame: {
    type: Number,
    default: 0
  },
  nbFrames: {
    type: Number,
    default: 0
  },
  preview: {
    type: Object,
    default: () => ({})
  },
  defaultHeight: {
    type: Number,
    default: 0
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  isRoundedTopBorder: {
    type: Boolean,
    default: false
  },
  panzoom: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'click',
  'duration-changed',
  'frame-update',
  'panzoom-changed',
  'play-ended',
  'size-changed',
  'video-end',
  'video-loaded'
])

const store = useStore()
const currentProduction = computed(() => store.getters.currentProduction)

const container = ref(null)
const movie = ref(null)
const isLoading = ref(false)
const videoDuration = ref(0)
const currentTimeRaw = ref(0)

let panzoomInstance = null
let panzoomSilent = false
let currentTimeCalls = []
let playLoop = null
let isPlaying = false
let previousDimensions = null

const video = computed(() => movie.value)

const extension = computed(() => (props.preview ? props.preview.extension : ''))

const fps = computed(() => parseFloat(currentProduction.value?.fps) || 25)

const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

const isAvailable = computed(() => {
  const s =
    props.preview && props.preview.status ? props.preview.status : 'ready'
  return !['broken', 'processing'].includes(s)
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

const setCurrentFrame = frame => {
  setCurrentTime(frame * frameDuration.value)
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
      video.value.currentTime = Number(currentTime.toPrecision(4)) + 0.001
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
    video.value.style.height = initialHeight + 'px'
    const videoPosition = video.value.getBoundingClientRect()
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

const getFrameFromPlayer = () => {
  const raw = video.value ? video.value.currentTime : 0
  if (raw === 0) return 0
  let frame = Math.ceil(raw / frameDuration.value) + 1
  frame = Number(frame.toPrecision(4))
  frame = Math.min(frame, props.nbFrames)
  return frame
}

const emitFrameChange = () => {
  const frame = getFrameFromPlayer()
  emit('frame-update', frame)
}

const runEmitTimeUpdateLoop = () => {
  clearInterval(playLoop)
  playLoop = setInterval(emitFrameChange, frameDuration.value)
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
  if (props.name.indexOf('comparison') < 0) {
    runEmitTimeUpdateLoop()
  }
}

const pause = () => {
  video.value.pause()
  clearInterval(playLoop)
  video.value.currentTime = props.currentFrame * frameDuration.value
  emit('frame-update', props.currentFrame)
}

const toggleMute = () => {
  video.value.muted = !video.value.muted
}

const goPreviousFrame = () => {
  const nextFrame = props.currentFrame - 1
  if (nextFrame < 0) return
  video.value.currentTime = nextFrame * frameDuration.value + 0.001
  emit('frame-update', nextFrame)
  return nextFrame
}

const goNextFrame = () => {
  const nextFrame = props.currentFrame + 1
  if (nextFrame >= props.nbFrames) return
  video.value.currentTime = nextFrame * frameDuration.value + 0.001
  emit('frame-update', nextFrame)
  return nextFrame
}

const onVideoEnd = () => {
  isPlaying = false
  clearInterval(playLoop)
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

const pausePanZoom = () => {
  if (panzoomInstance) panzoomInstance.pause()
}

const resumePanZoom = () => {
  if (panzoomInstance) panzoomInstance.resume()
}

const setSpeed = rate => {
  if (video.value) video.value.playbackRate = rate
}

const setVolume = volume => {
  if (video.value) video.value.volume = volume / 100
}

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
      }
      video.value.addEventListener('focus', e => e.target.blur())
      video.value.addEventListener('resize', resetSize)

      video.value.addEventListener('loadedmetadata', () => {
        if (!video.value) return
        configureVideo()
        onWindowResize()
        setCurrentTime(0)
        setCurrentTimeRaw(0)
        emit('video-loaded')
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

  if (props.panzoom) {
    // Attach panzoom to the <video> element rather than the wrapping
    // container: the video is flex-centered inside the wrapper, so
    // scaling the wrapper multiplies the centering offset and the
    // video drifts relative to the AnnotationCanvas overlay (which
    // applies the same transform from its own top-left origin).
    panzoomInstance = createPanzoom(movie.value, {
      bounds: true,
      boundsPadding: 0.2,
      maxZoom: 5,
      minZoom: 1,
      smoothScroll: false
    })
    panzoomInstance.on('zoom', emitPanZoom)
    panzoomInstance.on('pan', emitPanZoom)
    pausePanZoom()
  }
})

onBeforeUnmount(() => {
  pause()
  window.removeEventListener('resize', onWindowResize)
  panzoomInstance?.dispose()
})

watch(
  () => props.preview,
  () => {
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
  resetSize
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

video {
  object-fit: inherit;
}
</style>

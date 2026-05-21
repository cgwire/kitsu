<template>
  <div ref="container" class="video-wrapper filler flexrow-item">
    <div class="video-loader" v-show="isLoading">
      <spinner class="mt2" style="color: white" />
    </div>
    <video
      ref="player1"
      preload="auto"
      :muted="muted"
      @ended="$emit('play-next')"
    />
    <video
      ref="player2"
      preload="auto"
      :muted="muted"
      @ended="$emit('play-next')"
    />
  </div>
</template>

<script setup>
/*
 * To play several videos, to avoid blinking effects, it's required to use
 * two video players. When switching from a entity to another, we hide and show
 * players so the blink does not occur.
 * Videos are represented with a list of entities. Each entity has a
 * preview_file_id which is used to build the related movie path. The expected
 * format of entities is:
 * [{
 *    preview_file_id: 'preview-id',
 *    preview_file_extension: 'mp4'
 * }, ...]
 */
import createPanzoom from 'panzoom'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useTemplateRef,
  watch
} from 'vue'
import { useStore } from 'vuex'

import { floorToFrame, roundToFrame } from '@/lib/video'

import Spinner from '@/components/widgets/Spinner.vue'

// Composables

const store = useStore()

// Props / Emits

const props = defineProps({
  currentPreviewIndex: {
    type: Number,
    default: 0
  },
  entities: {
    type: Array,
    default: () => []
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  handleIn: {
    type: Number,
    default: 0
  },
  handleOut: {
    type: Number,
    default: 0
  },
  isHd: {
    type: Boolean,
    default: false
  },
  isRepeating: {
    type: Boolean,
    default: false
  },
  movieUrlPrefix: {
    type: String,
    default: null
  },
  muted: {
    type: Boolean,
    default: false
  },
  name: {
    // Debug purpose
    type: String,
    default: 'main'
  },
  panzoom: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'entity-change',
  'frame-update',
  'max-duration-update',
  'metadata-loaded',
  'panzoom-changed',
  'play-next',
  'repeat',
  'video-loaded'
])

// State

const containerRef = useTemplateRef('container')
const player1Ref = useTemplateRef('player1')
const player2Ref = useTemplateRef('player2')

const currentIndex = ref(0)
const currentPlayer = shallowRef(undefined)
const isLoading = ref(true)
const isPlaying = ref(false)
const nextPlayer = shallowRef(undefined)

// Non-reactive locals (instance-private state previously stashed on $options)
let containerResizeObserver = null
let currentTimeRaw = 0
let firstPanZoom = null
let panzoomInstances = []
let playLoop = null
let rate = 1
let secondPanZoom = null
let silent = false
let showLoadingTimer = null

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
const fps = computed(() => parseFloat(currentProduction.value?.fps) || 25)
const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

// Functions

const setupPanZoom = () => {
  if (props.panzoom) {
    firstPanZoom = createPanzoom(player1Ref.value, {
      bounds: true,
      boundsPadding: 0.2,
      maxZoom: 5,
      minZoom: 0.5
    })
    secondPanZoom = createPanzoom(player2Ref.value, {
      bounds: true,
      boundsPadding: 0.2,
      maxZoom: 3,
      minZoom: 0.5
    })
    panzoomInstances = [firstPanZoom, secondPanZoom]
    const events = ['zoom', 'pan', 'panend', 'transform']
    events.forEach(name => {
      firstPanZoom.on(name, () => {
        if (currentPlayer.value !== player1Ref.value) return
        emitPanZoomChanged(firstPanZoom)
      })
      secondPanZoom.on(name, () => {
        if (currentPlayer.value !== player2Ref.value) return
        emitPanZoomChanged(secondPanZoom)
      })
    })
    pausePanZoom()
  }
}

const emitPanZoomChanged = panzoomInstance => {
  if (silent) return
  const { x, y, scale } = panzoomInstance.getTransform()
  emit('panzoom-changed', { x, y, scale })
}

const hideLoading = () => {
  if (showLoadingTimer) {
    clearTimeout(showLoadingTimer)
    showLoadingTimer = null
  }
  isLoading.value = false
}

const showLoading = () => {
  if (showLoadingTimer) {
    clearTimeout(showLoadingTimer)
  }
  showLoadingTimer = setTimeout(() => {
    showLoadingTimer = null
    if (currentPlayer.value && currentPlayer.value.readyState < 3) {
      isLoading.value = true
    }
  }, 150) // Hack to avoid blinking effect
}

// Helpers

const emitLoadedEvent = event => {
  emit('metadata-loaded', event)
}

const getMoviePath = entity => {
  if (entity.preview_file_extension === 'mp4') {
    let previewId
    if (
      props.currentPreviewIndex === 0 ||
      props.currentPreviewIndex > entity.preview_file_previews.length
    ) {
      previewId = entity.preview_file_id
    } else {
      previewId = entity.preview_file_previews[props.currentPreviewIndex - 1].id
    }
    if (props.movieUrlPrefix) {
      return `${props.movieUrlPrefix}/movies/originals/preview-files/${previewId}.mp4`
    } else if (props.isHd) {
      return `/api/movies/originals/preview-files/${previewId}.mp4`
    } else {
      return `/api/movies/low/preview-files/${previewId}.mp4`
    }
  } else {
    return ''
  }
}

const getVideoRatio = () => {
  if (!currentPlayer.value) return 0
  const { videoWidth, videoHeight } = currentPlayer.value
  return videoHeight ? videoWidth / videoHeight : 0
}

const clear = () => {
  if (currentPlayer.value) {
    currentPlayer.value.src = ''
    currentPlayer.value.removeAttribute('src')
    currentPlayer.value.load()
  }
}

const resetHeight = () => {
  nextTick(() => {
    if (currentPlayer.value) currentPlayer.value.style.height = '0px'
    if (nextPlayer.value) nextPlayer.value.style.height = '0px'
    if (containerRef.value) {
      const height = containerRef.value.offsetHeight
      if (currentPlayer.value) currentPlayer.value.style.height = `${height}px`
      if (nextPlayer.value) nextPlayer.value.style.height = `${height}px`
    }
  })
}

// Navigation

const getNextIndex = index => {
  let i = index + 1 >= props.entities.length ? 0 : index + 1
  // While we don't come back to initial entity and we have video previews
  while (
    i !== index &&
    props.entities[i] &&
    props.entities[i].preview_file_extension !== 'mp4'
  ) {
    i++
    if (i >= props.entities.length) i = 0
  }
  return i
}

const goPreviousFrame = () => {
  if (currentPlayer.value) {
    const isChromium = !!window.chrome
    const change = isChromium ? frameDuration.value : 0
    const time = currentTimeRaw
    let newTime = floorToFrame(time - frameDuration.value, fps.value)
    newTime = newTime + change
    newTime = _setCurrentTime(newTime)
    const frameNumber = newTime / frameDuration.value
    emit('frame-update', frameNumber)
  }
}

const goNextFrame = () => {
  if (currentPlayer.value) {
    const time = currentTimeRaw
    let newTime = floorToFrame(time + frameDuration.value, fps.value)
    const isChromium = !!window.chrome
    const change = isChromium ? frameDuration.value : 0
    newTime = newTime + change
    newTime = _setCurrentTime(newTime)
    const frameNumber = newTime / frameDuration.value
    emit('frame-update', frameNumber)
  }
}

const loadNextEntity = () => {
  const newIndex = getNextIndex(currentIndex.value)
  loadEntity(newIndex)
  emit('entity-change', currentIndex.value)
}

const reloadCurrentEntity = (silentReload = false) => {
  loadEntity(currentIndex.value, currentPlayer.value.currentTime, silentReload)
}

const loadEntity = (index = 0, currentTime = 0, silentLoad = false) => {
  if (index < props.entities.length) {
    const nextIndex = getNextIndex(index)
    const entity = props.entities[index]
    const nextEntity = props.entities[nextIndex]

    currentIndex.value = index
    currentPlayer.value = player1Ref.value
    nextPlayer.value = player2Ref.value
    currentPlayer.value.removeEventListener('loadedmetadata', updateMaxDuration)
    currentPlayer.value.addEventListener('loadedmetadata', updateMaxDuration)

    if (entity.preview_file_extension === 'mp4' && currentPlayer.value) {
      currentPlayer.value.src = getMoviePath(entity)
    } else if (currentPlayer.value) {
      currentPlayer.value.src = ''
    }
    if (nextEntity?.preview_file_extension === 'mp4' && nextPlayer.value) {
      nextPlayer.value.src = getMoviePath(nextEntity)
    } else if (nextPlayer.value) {
      nextPlayer.value.src = ''
    }
    currentPlayer.value.style.display = 'block'
    nextPlayer.value.style.display = 'none'
    resetHeight()

    setSpeed(rate)
    _setCurrentTime(currentTime)
    if (!silentLoad) {
      emit('entity-change', currentIndex.value)
    }
  }
}

// Playing

const pause = () => {
  if (currentPlayer.value) {
    currentPlayer.value.pause()
    currentPlayer.value.curentTime = roundToFrame(
      currentPlayer.value.currentTime,
      fps.value
    )
    currentTimeRaw = currentPlayer.value.currentTime
    const frameNumber = Math.round(
      currentPlayer.value.currentTime / frameDuration.value
    )
    emit('frame-update', frameNumber)
    clearInterval(playLoop)
  }
  isPlaying.value = false
}

const play = () => {
  let entity = props.entities[currentIndex.value]
  if (entity) {
    if (!entity.preview_file_id) loadNextEntity()
    entity = props.entities[currentIndex.value]
    if (entity.preview_file_id) {
      if (currentPlayer.value) {
        if (props.name === 'main') {
          runEmitTimeUpdateLoop()
        }
        currentPlayer.value.play()
      }
      isPlaying.value = true
    }
  }
}

const runEmitTimeUpdateLoop = () => {
  clearInterval(playLoop)
  playLoop = setInterval(() => {
    updateTime(currentPlayer.value.currentTime)
  }, 1000 / fps.value)
}

const playNext = handleIn => {
  if (!isPlaying.value) return
  handleIn = handleIn || props.handleIn
  if (props.isRepeating) {
    currentPlayer.value.currentTime = props.handleIn
      ? props.handleIn * frameDuration.value
      : frameDuration.value
    currentPlayer.value.play()
    emit('repeat')
  } else {
    const nextIndex = getNextIndex(currentIndex.value)
    currentIndex.value = nextIndex
    emit('entity-change', currentIndex.value)

    if (currentPlayer.value) currentPlayer.value.style.display = 'none'
    if (nextPlayer.value) {
      nextPlayer.value.currentTime = handleIn
        ? handleIn * frameDuration.value
        : 0
      nextPlayer.value.style.display = 'block'
      nextPlayer.value.play()
    }

    switchPlayers()
    updateMaxDuration()
  }
}

const getCurrentTime = () =>
  currentPlayer.value ? currentPlayer.value.currentTime : 0

const getCurrentFrame = () => {
  let time = getCurrentTime()
  time = floorToFrame(time, fps.value)
  return time / frameDuration.value
}

const getCurrentTimeRaw = () =>
  currentPlayer.value ? currentPlayer.value.currentTime : 0

const setCurrentTimeRaw = currentTime => {
  if (currentPlayer.value) {
    currentPlayer.value.currentTime = currentTime
  }
}

const setCurrentFrame = frameNumber => {
  _setCurrentTime(frameNumber * frameDuration.value)
}

const _setCurrentTime = newTime => {
  if (!currentPlayer.value) {
    newTime = 0
  } else if (newTime < 0) {
    newTime = 0
  } else {
    const duration = floorToFrame(currentPlayer.value.duration, fps.value)
    if (newTime > duration) {
      newTime = duration
    }
  }
  runSetCurrentTime(newTime)
  return newTime
}

const runSetCurrentTime = currentTime => {
  if (currentPlayer.value && currentPlayer.value.currentTime !== currentTime) {
    // tweaks needed because the html video player is messy with frames
    currentPlayer.value.currentTime = currentTime + 0.001
    onTimeUpdate()
  }
}

const onTimeUpdate = () => {
  const isChromium = !!window.chrome
  const change = isChromium ? frameDuration.value : 0
  if (currentPlayer.value) {
    currentTimeRaw = currentPlayer.value.currentTime - change
  } else {
    currentTimeRaw = 0 + change
  }
  emit('frame-update', Math.round(currentTimeRaw / frameDuration.value))
}

const switchPlayers = () => {
  const nextIndex = getNextIndex(currentIndex.value)
  const nextEntity = props.entities[nextIndex]
  const tmpPlayer = currentPlayer.value
  currentPlayer.value = nextPlayer.value
  nextPlayer.value = tmpPlayer
  if (nextEntity) {
    nextPlayer.value.src = getMoviePath(nextEntity)
  }
  resetHeight()
  setSpeed(rate)
}

const updateTime = time => {
  const frameNumber = Math.round(time / frameDuration.value)
  if (props.name === 'main') {
    emit('frame-update', frameNumber)
  }
}

const updateMaxDuration = () => {
  if (currentPlayer.value) {
    emit('max-duration-update', currentPlayer.value.duration)
    emit('video-loaded')
  }
}

const setSpeed = newRate => {
  rate = newRate
  if (currentPlayer.value) currentPlayer.value.playbackRate = newRate
  if (nextPlayer.value) nextPlayer.value.playbackRate = newRate
}

const getNaturalDimensions = () => ({
  height: currentPlayer.value.videoHeight,
  width: currentPlayer.value.videoWidth
})

const pausePanZoom = () => {
  panzoomInstances.forEach(panzoomInstance => {
    panzoomInstance.pause()
  })
}

const resumePanZoom = () => {
  panzoomInstances.forEach(panzoomInstance => {
    panzoomInstance.resume()
  })
}

const resetPanZoom = () => {
  panzoomInstances.forEach(panzoomInstance => {
    panzoomInstance.moveTo(0, 0)
    panzoomInstance.zoomAbs(0, 0, 1)
  })
}

const setPanZoom = (x, y, scale) => {
  silent = true
  panzoomInstances.forEach(panzoomInstance => {
    const actualScale = panzoomInstance.getTransform().scale
    const zoomFactor = scale / actualScale
    panzoomInstance.moveTo(x, y)
    panzoomInstance.setTransformOrigin({ x, y })
    panzoomInstance.zoomTo(x, y, zoomFactor)
    panzoomInstance.setTransformOrigin({ x: 0, y: 0 })
  })
  nextTick(() => {
    silent = false
  })
}

const setVolume = volume => {
  if (!currentPlayer.value) return
  currentPlayer.value.volume = volume / 100
  nextPlayer.value.volume = volume / 100
}

const LOADING_HANDLERS = [
  ['canplay', hideLoading],
  ['stalled', showLoading],
  ['waiting', showLoading],
  ['loadstart', showLoading],
  ['error', hideLoading]
]

const bindLoadingHandlers = player => {
  LOADING_HANDLERS.forEach(([event, handler]) =>
    player.addEventListener(event, handler)
  )
}

const unbindLoadingHandlers = player => {
  LOADING_HANDLERS.forEach(([event, handler]) =>
    player?.removeEventListener(event, handler)
  )
}

// Watchers

watch(
  () => props.currentPreviewIndex,
  () => {
    if (!isPlaying.value) {
      setCurrentTimeRaw(0)
      reloadCurrentEntity(true)
    }
  }
)

watch(
  () => props.entities,
  () => {
    if (props.entities.length > 0) {
      loadEntity(0)
      pause()
      _setCurrentTime(0)

      const entity = props.entities[currentIndex.value]
      if (entity && !entity.preview_file_id) loadNextEntity()
    }
    setTimeout(() => {
      resetHeight()
    }, 300)
  }
)

watch(
  () => props.isHd,
  () => {
    if (currentPlayer.value) {
      reloadCurrentEntity()
      if (isPlaying.value) play()
    }
  }
)

// Lifecycle

// Video need to be resized after each window size change. It's due
// to a HTML5 limitation related to video height.
onMounted(() => {
  resetHeight()
  player1Ref.value.addEventListener('loadedmetadata', emitLoadedEvent)
  window.addEventListener('resize', resetHeight)
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    containerResizeObserver = new ResizeObserver(() => {
      resetHeight()
    })
    containerResizeObserver.observe(containerRef.value)
  }

  bindLoadingHandlers(player1Ref.value)
  bindLoadingHandlers(player2Ref.value)

  setupPanZoom()
})

onBeforeUnmount(() => {
  clearInterval(playLoop)
  window.removeEventListener('resize', resetHeight)
  containerResizeObserver?.disconnect()
  player1Ref.value?.removeEventListener('loadedmetadata', emitLoadedEvent)

  unbindLoadingHandlers(player1Ref.value)
  unbindLoadingHandlers(player2Ref.value)

  firstPanZoom?.dispose()
  secondPanZoom?.dispose()
})

// Expose public surface for parent components ($refs['raw-player'])

defineExpose({
  // State
  currentIndex,
  currentPlayer,
  isPlaying,
  // Navigation
  loadEntity,
  loadNextEntity,
  reloadCurrentEntity,
  // Playback
  pause,
  play,
  playNext,
  // Time / frames
  getCurrentFrame,
  getCurrentTime,
  getCurrentTimeRaw,
  goNextFrame,
  goPreviousFrame,
  setCurrentFrame,
  setCurrentTimeRaw,
  // Speed / volume
  setSpeed,
  setVolume,
  // Dimensions
  getNaturalDimensions,
  getVideoRatio,
  // Layout
  clear,
  resetHeight,
  // Pan-zoom
  pausePanZoom,
  resetPanZoom,
  resumePanZoom,
  setPanZoom
})
</script>

<style lang="scss" scoped>
.video-wrapper {
  height: 100%;
  position: relative;
  overflow: hidden;

  video {
    margin: auto;
  }
}

@media screen and (max-width: 768px) {
  .video-wrapper {
    align-items: center;
    display: flex;
    justify-content: center;

    video {
      margin: 0 auto;
    }
  }
}

.video-loader {
  align-items: center;
  background: #00000088;
  color: white;
  display: flex;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 300;
}
</style>

<template>
  <div
    ref="container"
    class="video-wrapper filler flexrow-item"
    @wheel="swallowBrowserZoom"
  >
    <div class="video-loader" v-show="isLoading">
      <spinner class="mt2" style="color: white" />
    </div>
    <video
      ref="player1"
      class="playlist-movie-decoder"
      preload="auto"
      playsinline
      :muted="muted"
      @ended="$emit('play-next')"
    />
    <video
      ref="player2"
      class="playlist-movie-decoder"
      preload="auto"
      playsinline
      :muted="muted"
      @ended="$emit('play-next')"
    />
    <canvas ref="displayCanvas" class="playlist-movie" />
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

import { swallowBrowserZoom } from '@/lib/players/wheel'
import { DEFAULT_FPS, floorToFrame, roundToFrame } from '@/lib/video'
import {
  createFrameRenderer,
  supportsVideoFrameCallback
} from '@/lib/players/frameRenderer'

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
  muted: {
    type: Boolean,
    default: false
  },
  name: {
    // Debug purpose
    type: String,
    default: 'main'
  },
  nextHandleIn: {
    // Handle-in frame of the next entity, used to pre-seek its decoder
    type: Number,
    default: 0
  },
  panzoom: {
    type: Boolean,
    default: false
  },
  urlPrefix: {
    type: String,
    default: null
  }
})

const emit = defineEmits([
  'entity-change',
  'frame-update',
  'max-duration-update',
  'metadata-loaded',
  'panzoom-changed',
  'panzoom-ready',
  'play-next',
  'repeat',
  'time-update',
  'video-loaded'
])

// State

const containerRef = useTemplateRef('container')
const player1Ref = useTemplateRef('player1')
const player2Ref = useTemplateRef('player2')
const displayCanvasRef = useTemplateRef('displayCanvas')

const currentIndex = ref(0)
const currentPlayer = shallowRef(null)
const isLoading = ref(true)
const isPlaying = ref(false)
const nextPlayer = shallowRef(undefined)

// Non-reactive locals (instance-private state previously stashed on $options)
let containerResizeObserver = null
let currentTimeRaw = 0
let isSeeking = false
let firstPanZoom = null
let panzoomInstances = []
let renderer = null
let renderLoopHandle = null
let renderLoopIsRvfc = false
let renderLoopPlayer = null
let renderLoopGeneration = 0
// Target of a seek issued while playing — the render loop skips stale
// presentations until the target frame lands (same guard as VideoViewer).
let seekGuardTarget = null
// Latest scrub target, applied once the in-flight seek lands.
let pendingSeekTime = null
// One play-next per trim end: entity switches to non-movie previews are
// asynchronous, and extra presentations past the handle-out would emit
// again and skip entities.
let trimEndFired = false
let lastEmittedFrame = null
let rate = 1
let silent = false
let showLoadingTimer = null
// Track whether the panzoom should be active across instance
// recreations. The instances are only built after each video's
// metadata loads (so their bounds clamp doesn't race a 0×0 target),
// which can happen after PlaylistPlayer already called resumePanZoom
// at mount — remember that intent here and apply it when each
// instance finally exists.
let panzoomActive = false

// Computed

const currentProduction = computed(() => store.getters.currentProduction)
// Use the currently-playing entity's fps (a playlist can mix fps); fall
// back to the production default. Reactive to currentIndex so it switches
// as the playlist advances.
const fps = computed(() => {
  const entityFps = parseFloat(props.entities[currentIndex.value]?.fps)
  return entityFps || parseFloat(currentProduction.value?.fps) || DEFAULT_FPS
})
const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

// Functions

const PANZOOM_EVENTS = ['zoom', 'pan', 'panend', 'transform']

// Setup is deferred until the canvas has metadata so the bounds
// clamp doesn't compute against a 0×0 target.
const setupPanZoom = () => {
  if (!props.panzoom || !displayCanvasRef.value) return
  firstPanZoom?.dispose()
  firstPanZoom = createPanzoom(displayCanvasRef.value, {
    bounds: true,
    boundsPadding: 0.2,
    maxZoom: 5,
    minZoom: 0.5,
    beforeMouseDown: e => e.target !== displayCanvasRef.value,
    // Zoom is a Ctrl+wheel gesture: a plain wheel keeps scrolling the
    // surrounding widgets/page.
    beforeWheel: e => !e.ctrlKey || e.target !== displayCanvasRef.value,
    disableKeyboardInteraction: true
  })
  PANZOOM_EVENTS.forEach(name => {
    firstPanZoom.on(name, () => emitPanZoomChanged(firstPanZoom))
  })
  if (!panzoomActive) firstPanZoom.pause()
  refreshPanzoomInstances()
  emit('panzoom-ready')
}

const refreshPanzoomInstances = () => {
  panzoomInstances = [firstPanZoom].filter(Boolean)
}

const getDisplaySurface = () => displayCanvasRef.value

const resizeRenderer = () => {
  if (!renderer || !currentPlayer.value) return
  // Keep the renderer's default source on the active decoder so a
  // no-argument drawFrame() can never paint the inactive player.
  renderer.video = currentPlayer.value
  renderer.resize(
    currentPlayer.value.videoWidth,
    currentPlayer.value.videoHeight
  )
  renderer.drawFrame(currentPlayer.value)
}

const startRenderLoop = () => {
  stopRenderLoop()
  const player = currentPlayer.value
  if (!player) return
  renderLoopPlayer = player
  renderLoopGeneration++
  const generation = renderLoopGeneration
  if (supportsVideoFrameCallback()) {
    renderLoopIsRvfc = true
    const tick = (now, metadata) => {
      if (renderLoopGeneration !== generation) return
      // Skip presentations far from an in-flight seek target (loop on
      // handle-in, handle-in jump): frames queued behind the seek point
      // keep presenting for a tick or two and painting them overflows
      // past the trim before the seek lands.
      if (
        seekGuardTarget !== null &&
        Math.abs(metadata.mediaTime - seekGuardTarget) > 2 * frameDuration.value
      ) {
        renderLoopHandle = player.requestVideoFrameCallback(tick)
        return
      }
      seekGuardTarget = null
      // Enforce the trim end at the paint decision: the parent detects
      // it through the time channel, which lags the presented frame by
      // one, so it always paints the first excluded frame. Here the
      // presented frame is known exactly — loop or chain before painting.
      if (
        isPlaying.value &&
        props.handleOut > 0 &&
        Math.round(metadata.mediaTime * fps.value) >= props.handleOut
      ) {
        if (props.isRepeating) {
          const target = props.handleIn / fps.value
          seekGuardTarget = target
          player.currentTime = target
          emit('repeat')
        } else if (!trimEndFired) {
          trimEndFired = true
          emit('play-next')
        }
        renderLoopHandle = player.requestVideoFrameCallback(tick)
        return
      }
      trimEndFired = false
      renderer?.drawFrame(player)
      if (isPlaying.value && props.name === 'main') {
        updateTime(player.currentTime)
      }
      renderLoopHandle = player.requestVideoFrameCallback(tick)
    }
    renderLoopHandle = player.requestVideoFrameCallback(tick)
  } else {
    renderLoopIsRvfc = false
    let lastDrawnTime = -1
    const tick = () => {
      if (renderLoopGeneration !== generation) return
      // Mid-seek (no rVFC, e.g. Firefox): currentTime already reads the
      // target while the decoder still holds the old position — drawing
      // would paint stale frames past the trim and emit stale times.
      if (player.seeking) {
        renderLoopHandle = requestAnimationFrame(tick)
        return
      }
      if (player.currentTime !== lastDrawnTime) {
        lastDrawnTime = player.currentTime
        renderer?.drawFrame(player)
        if (isPlaying.value && props.name === 'main') {
          updateTime(player.currentTime)
        }
      }
      renderLoopHandle = requestAnimationFrame(tick)
    }
    renderLoopHandle = requestAnimationFrame(tick)
  }
}

const stopRenderLoop = () => {
  if (renderLoopHandle === null) return
  if (renderLoopIsRvfc) {
    renderLoopPlayer?.cancelVideoFrameCallback?.(renderLoopHandle)
  } else {
    cancelAnimationFrame(renderLoopHandle)
  }
  renderLoopHandle = null
  renderLoopPlayer = null
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

const getMoviePath = (entity, previewIndex = 0) => {
  // Check the extension on the element actually selected (main preview or
  // one of the additional previews): a revision whose main element is a
  // picture can still carry video elements, and vice versa.
  const subPreviews = entity.preview_file_previews || []
  const preview =
    previewIndex > 0 && previewIndex <= subPreviews.length
      ? subPreviews[previewIndex - 1]
      : { id: entity.preview_file_id, extension: entity.preview_file_extension }
  if (preview.extension !== 'mp4') return ''
  const base = props.urlPrefix || '/api'
  // Originals for shared links or HD mode; the lighter low variant otherwise
  if (props.urlPrefix || props.isHd) {
    return `${base}/movies/originals/preview-files/${preview.id}.mp4`
  } else {
    return `${base}/movies/low/preview-files/${preview.id}.mp4`
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
    if (displayCanvasRef.value) displayCanvasRef.value.style.height = '0px'
    if (containerRef.value) {
      const height = containerRef.value.offsetHeight
      if (displayCanvasRef.value) {
        displayCanvasRef.value.style.height = `${height}px`
      }
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

// Park the preloaded decoder on the next entity's handle-in frame so its
// first frame (slate) is never the one painted when players switch.
const preseekNextPlayer = () => {
  const player = nextPlayer.value
  if (!player || !player.getAttribute('src') || props.nextHandleIn <= 0) return
  const nextEntity = props.entities[getNextIndex(currentIndex.value)]
  const nextFps =
    parseFloat(nextEntity?.fps) ||
    parseFloat(currentProduction.value?.fps) ||
    DEFAULT_FPS
  player.currentTime = props.nextHandleIn / nextFps
}

const loadEntity = (index = 0, currentTime = 0, silentLoad = false) => {
  if (index < props.entities.length) {
    const nextIndex = getNextIndex(index)
    const entity = props.entities[index]
    const nextEntity = props.entities[nextIndex]

    currentIndex.value = index
    pendingSeekTime = null
    // Reuse the decoder that already holds the target movie (usually the
    // one that preloaded the next entity): swapping keeps its buffer
    // instead of re-downloading on every manual navigation.
    const moviePath = getMoviePath(entity, props.currentPreviewIndex)
    const preloadedPlayer = [player1Ref.value, player2Ref.value].find(
      player => moviePath && player?.src.endsWith(moviePath)
    )
    currentPlayer.value = preloadedPlayer || player1Ref.value
    nextPlayer.value =
      currentPlayer.value === player1Ref.value
        ? player2Ref.value
        : player1Ref.value
    currentPlayer.value.removeEventListener('loadedmetadata', updateMaxDuration)
    currentPlayer.value.addEventListener('loadedmetadata', updateMaxDuration)

    if (moviePath) {
      if (!currentPlayer.value.src.endsWith(moviePath)) {
        currentPlayer.value.src = moviePath
      }
    } else if (currentPlayer.value) {
      currentPlayer.value.src = ''
    }
    // The next entity always starts on its main preview: preload index 0.
    const nextMoviePath = nextEntity ? getMoviePath(nextEntity) : ''
    if (nextMoviePath) {
      if (!nextPlayer.value.src.endsWith(nextMoviePath)) {
        nextPlayer.value.src = nextMoviePath
      }
      preseekNextPlayer()
    } else if (nextPlayer.value) {
      nextPlayer.value.src = ''
    }
    resetHeight()

    setSpeed(rate)
    if (!renderer && displayCanvasRef.value) {
      renderer = createFrameRenderer(
        displayCanvasRef.value,
        currentPlayer.value
      )
    }
    startRenderLoop()
    // A reused decoder fires no loadedmetadata event: refresh the
    // duration and renderer dimensions from what it already knows.
    if (currentPlayer.value.readyState >= HTMLMediaElement.HAVE_METADATA) {
      updateMaxDuration()
    }
    _setCurrentTime(currentTime)
    if (!silentLoad) {
      emit('entity-change', currentIndex.value)
    }
  }
}

// Playing

const pause = () => {
  seekGuardTarget = null
  if (currentPlayer.value) {
    currentPlayer.value.pause()
    seekNow(roundToFrame(getCurrentTime(), fps.value))
    currentTimeRaw = currentPlayer.value.currentTime
    const frameNumber = Math.round(
      currentPlayer.value.currentTime / frameDuration.value
    )
    emit('frame-update', frameNumber)
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
        currentPlayer.value.play()?.catch(() => {})
      }
      isPlaying.value = true
    }
  }
}

const playNext = handleIn => {
  if (!isPlaying.value) return
  handleIn = handleIn || props.handleIn
  if (props.isRepeating) {
    seekNow(
      props.handleIn
        ? props.handleIn * frameDuration.value
        : frameDuration.value
    )
    currentPlayer.value.play()?.catch(() => {})
    emit('repeat')
  } else {
    const nextIndex = getNextIndex(currentIndex.value)
    currentIndex.value = nextIndex
    emit('entity-change', currentIndex.value)

    if (nextPlayer.value) {
      nextPlayer.value.currentTime = handleIn
        ? handleIn * frameDuration.value
        : 0
      nextPlayer.value.play()?.catch(() => {})
    }

    switchPlayers()
    updateMaxDuration()
  }
}

const getCurrentTime = () =>
  currentPlayer.value ? (pendingSeekTime ?? currentPlayer.value.currentTime) : 0

// Direct seeks (pause, loops, raw sync) win over a held scrub target.
const seekNow = currentTime => {
  pendingSeekTime = null
  currentPlayer.value.currentTime = currentTime
}

const getCurrentFrame = () => {
  let time = getCurrentTime()
  time = floorToFrame(time, fps.value)
  return time / frameDuration.value
}

const getCurrentTimeRaw = getCurrentTime

const setCurrentTimeRaw = currentTime => {
  if (currentPlayer.value) {
    if (isPlaying.value) seekGuardTarget = currentTime
    seekNow(currentTime)
  }
}

const setCurrentFrame = frameNumber => {
  // Seek with the unrounded 1/fps, not frameNumber * frameDuration:
  // frameDuration is rounded to 4 decimals (0.0833 at 12fps), so the
  // target drifts ~1ms per frame and tips into the previous frame past
  // ~frame 30 (duplicate). The +0.001 nudge in runSetCurrentTime then
  // lands it inside the correct frame. Readback math is left untouched.
  _setCurrentTime(frameNumber / fps.value)
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
  // onTimeUpdate emits frame-update, which PlaylistPlayer can answer with
  // another seek: ignore those re-entrant calls so the loop can't recurse.
  if (isSeeking) return
  if (currentPlayer.value && getCurrentTime() !== currentTime) {
    isSeeking = true
    try {
      if (isPlaying.value) seekGuardTarget = currentTime
      // tweaks needed because the html video player is messy with frames
      const target = currentTime + 0.001
      // Scrubbing asks for a seek per mousemove and each one aborts the
      // in-flight seek, so no frame landed until the cursor stopped.
      if (currentPlayer.value.seeking) pendingSeekTime = target
      else seekNow(target)
      onTimeUpdate()
    } finally {
      isSeeking = false
    }
  }
}

const onTimeUpdate = () => {
  const isChromium = !!window.chrome
  const change = isChromium ? frameDuration.value : 0
  if (currentPlayer.value) {
    currentTimeRaw = getCurrentTime() - change
  } else {
    currentTimeRaw = 0 + change
  }
  emit('frame-update', Math.round(currentTimeRaw / frameDuration.value))
}

const onSeeked = event => {
  if (pendingSeekTime !== null && event.target === currentPlayer.value) {
    seekNow(pendingSeekTime)
  }
}

const switchPlayers = () => {
  pendingSeekTime = null
  const nextIndex = getNextIndex(currentIndex.value)
  const nextEntity = props.entities[nextIndex]
  const tmpPlayer = currentPlayer.value
  currentPlayer.value = nextPlayer.value
  nextPlayer.value = tmpPlayer
  if (nextEntity) {
    nextPlayer.value.src = getMoviePath(nextEntity)
    preseekNextPlayer()
  }
  resetHeight()
  setSpeed(rate)
  resizeRenderer()
  startRenderLoop()
}

const updateTime = time => {
  if (props.name !== 'main') return
  // Continuous time drives the smooth playlist playhead.
  emit('time-update', time)
  // The integer frame drives frame-based logic; only emit on change.
  const frameNumber = Math.round(time / frameDuration.value)
  if (frameNumber !== lastEmittedFrame) {
    lastEmittedFrame = frameNumber
    emit('frame-update', frameNumber)
  }
}

const updateMaxDuration = () => {
  if (currentPlayer.value) {
    resizeRenderer()
    emit('max-duration-update', currentPlayer.value.duration)
    emit('video-loaded')
    if (renderLoopHandle === null) startRenderLoop()
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
  panzoomActive = false
  panzoomInstances.forEach(panzoomInstance => {
    panzoomInstance.pause()
  })
}

const resumePanZoom = () => {
  panzoomActive = true
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
    // null restores cursor-relative wheel zoom; {x:0,y:0} would lock the
    // focal point at the top-left corner.
    panzoomInstance.setTransformOrigin(null)
  })
  nextTick(() => {
    silent = false
  })
}

const setVolume = volume => {
  if (currentPlayer.value) currentPlayer.value.volume = volume / 100
  if (nextPlayer.value) nextPlayer.value.volume = volume / 100
}

const LOADING_HANDLERS = [
  ['canplay', hideLoading],
  ['stalled', showLoading],
  ['waiting', showLoading],
  ['loadstart', showLoading],
  ['error', hideLoading],
  ['seeked', onSeeked]
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
    // Reload even mid-playback: keeping the old source makes the "sub"
    // resume the previous video at its old position and stop at that
    // video's end. Resume on the new source when it was playing.
    const wasPlaying = isPlaying.value
    setCurrentTimeRaw(0)
    reloadCurrentEntity(true)
    if (wasPlaying) {
      currentPlayer.value?.play()?.catch(() => {})
    }
  }
)

// At switch time the prop still holds the previous "next" value: re-apply
// the pre-seek once the parent pushes the new next entity's handle-in.
watch(
  () => props.nextHandleIn,
  () => {
    preseekNextPlayer()
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
  // Defer panzoom binding until metadata loads so the bounds
  // clamp doesn't compute against a 0×0 target.
  player1Ref.value.addEventListener('loadedmetadata', setupPanZoom)
  window.addEventListener('resize', resetHeight)
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    containerResizeObserver = new ResizeObserver(() => {
      resetHeight()
    })
    containerResizeObserver.observe(containerRef.value)
  }

  bindLoadingHandlers(player1Ref.value)
  bindLoadingHandlers(player2Ref.value)

  // Cached-video case: metadata may already be present, in which case
  // the load events above won't fire.
  if (player1Ref.value.readyState >= 1) setupPanZoom()
})

onBeforeUnmount(() => {
  stopRenderLoop()
  renderer?.dispose()
  renderer = null
  window.removeEventListener('resize', resetHeight)
  containerResizeObserver?.disconnect()
  player1Ref.value?.removeEventListener('loadedmetadata', emitLoadedEvent)
  player1Ref.value?.removeEventListener('loadedmetadata', setupPanZoom)

  unbindLoadingHandlers(player1Ref.value)
  unbindLoadingHandlers(player2Ref.value)

  firstPanZoom?.dispose()
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
  setPanZoom,
  getDisplaySurface
})
</script>

<style lang="scss" scoped>
.video-wrapper {
  height: 100%;
  position: relative;
  overflow: hidden;

  .playlist-movie-decoder {
    // Not display:none — some browsers suspend decoding entirely.
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  }

  canvas.playlist-movie {
    margin: auto;
    max-width: 100%;
    object-fit: contain;
  }
}

@media screen and (max-width: 768px) {
  .video-wrapper {
    align-items: center;
    display: flex;
    justify-content: center;

    canvas.playlist-movie {
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

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
      @ended="onEnded"
    />
    <video
      ref="player2"
      class="playlist-movie-decoder"
      preload="auto"
      playsinline
      :muted="muted"
      @ended="onEnded"
    />
    <canvas
      ref="displayCanvas"
      class="playlist-movie"
      :style="{ visibility: isBroken ? 'hidden' : null }"
    />
    <div class="processing" v-if="isProcessing">
      <spinner :is-processing="true" />
      <p>{{ $t('preview.processing') }}</p>
    </div>
    <p class="broken" v-else-if="isBroken">
      {{ $t('preview.broken') }}
    </p>
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

import { panPanzoomBy, zoomPanzoomAt } from '@/lib/players/panzoom'
import { swallowBrowserZoom } from '@/lib/players/wheel'
import { latestPreviewFileStatus } from '@/lib/preview'
import { DEFAULT_FPS, frameStartTime, SEEK_NUDGE } from '@/lib/video'
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
  'play-failed',
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
const isBroken = ref(false)
const isLoading = ref(true)
const isPlaying = ref(false)
const nextPlayer = shallowRef(undefined)

// Non-reactive locals (instance-private state previously stashed on $options)
// Movies whose status turned ready: a decoder that kept their 404 asks for
// them again, and the entry goes once no decoder keeps that 404.
const processedIds = new Set()
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
// The frame painted last: the movie time runs a frame behind it.
let presentedFrame = null
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
// Zou answers 404 for the movie of a preview file it is still processing.
// The watcher on the statuses fills processedIds before the render reads it.
const isProcessing = computed(() => {
  const entity = props.entities[currentIndex.value]
  if (!isBroken.value || !entity) return false
  const preview = getMoviePreview(entity, props.currentPreviewIndex)
  return (
    getMovieStatus(preview) === 'processing' || processedIds.has(preview.id)
  )
})
const movieStatuses = computed(
  () =>
    new Map(
      props.entities
        .flatMap(entity => [
          getMoviePreview(entity),
          ...(entity.preview_file_previews || [])
        ])
        .filter(preview => preview.extension === 'mp4')
        .map(preview => [preview.id, getKnownMovieStatus(preview)])
    )
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
  presentedFrame = null
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
          const target = frameStartTime(props.handleIn, fps.value)
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
      presentedFrame = Math.round(metadata.mediaTime * fps.value)
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
    if (
      currentPlayer.value &&
      currentPlayer.value.readyState < 3 &&
      !isBroken.value
    ) {
      isLoading.value = true
    }
  }, 150) // Hack to avoid blinking effect
}

// Helpers

const emitLoadedEvent = event => {
  emit('metadata-loaded', event)
}

const getMoviePreview = (entity, previewIndex = 0) => {
  const subPreviews = entity.preview_file_previews || []
  return previewIndex > 0 && previewIndex <= subPreviews.length
    ? subPreviews[previewIndex - 1]
    : {
        id: entity.preview_file_id,
        extension: entity.preview_file_extension,
        status: entity.preview_file_status
      }
}

// The shared playlist reads the statuses of its payload, the Playlists page
// those the socket keeps in the store.
const getKnownMovieStatus = preview =>
  latestPreviewFileStatus(
    preview.status,
    store.getters.previewFileStatusMap?.get(preview.id)
  )

const getMovieStatus = preview => getKnownMovieStatus(preview) || 'ready'

const getMoviePath = (entity, previewIndex = 0) => {
  // Check the extension on the element actually selected (main preview or
  // one of the additional previews): a revision whose main element is a
  // picture can still carry video elements, and vice versa.
  const preview = getMoviePreview(entity, previewIndex)
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

// A viewer left without entities, like a closed comparison, drops its movies:
// its hidden decoders would go on downloading them, or playing one.
// Removing the source alone does not stop a download: load() does.
const releasePlayers = () => {
  stopRenderLoop()
  isPlaying.value = false
  const players = [player1Ref.value, player2Ref.value]
  players
    .filter(player => player?.hasAttribute('src'))
    .forEach(player => {
      player.pause()
      player.removeAttribute('src')
      player.load()
    })
}

const clear = () => {
  isBroken.value = false
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

// Frames count on the exact rate: a time divided by the frame duration,
// rounded to 4 decimals (0.0333 at 30 fps), drifts a frame every 1000. A
// time right on a frame start can read a hair under it once multiplied.
const floorToFrameNumber = time => Math.floor(time * fps.value + 1e-6)

const stepFrame = step => {
  if (currentPlayer.value) {
    const isChromium = !!window.chrome
    const change = isChromium ? 1 : 0
    const frame = floorToFrameNumber(currentTimeRaw) + step + change
    const newTime = _setCurrentTime(frame / fps.value)
    emit('frame-update', Math.round(newTime * fps.value))
  }
}

const goPreviousFrame = () => stepFrame(-1)

const goNextFrame = () => stepFrame(1)

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
  player.currentTime = frameStartTime(props.nextHandleIn, nextFps)
}

// The shared playlist has no socket to hear that a movie is processed:
// coming back to a movie still being processed asks for its file again.
const setMovieSource = (player, moviePath, preview) => {
  if (!player.src.endsWith(moviePath)) {
    player.src = moviePath
  } else if (
    player.error &&
    (getMovieStatus(preview) === 'processing' || processedIds.has(preview.id))
  ) {
    player.load()
  }
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
    // instead of re-downloading on every manual navigation. The current one
    // first: with a single movie in the playlist, both decoders hold it.
    const moviePath = getMoviePath(entity, props.currentPreviewIndex)
    const preloadedPlayer = [
      currentPlayer.value,
      player1Ref.value,
      player2Ref.value
    ].find(player => moviePath && player?.src.endsWith(moviePath))
    currentPlayer.value = preloadedPlayer || player1Ref.value
    nextPlayer.value =
      currentPlayer.value === player1Ref.value
        ? player2Ref.value
        : player1Ref.value
    // The other decoder only preloads. It can still hold the movie played
    // until now, which would go on, hidden, and end in place of this one.
    nextPlayer.value?.pause()
    currentPlayer.value.removeEventListener('loadedmetadata', updateMaxDuration)
    currentPlayer.value.addEventListener('loadedmetadata', updateMaxDuration)

    if (moviePath) {
      setMovieSource(
        currentPlayer.value,
        moviePath,
        getMoviePreview(entity, props.currentPreviewIndex)
      )
    } else {
      // Nothing to play: the playback stops with the movie left.
      isPlaying.value = false
      if (currentPlayer.value) currentPlayer.value.src = ''
    }
    // The next entity always starts on its main preview: preload index 0.
    const nextMoviePath = nextEntity ? getMoviePath(nextEntity) : ''
    if (nextMoviePath) {
      setMovieSource(
        nextPlayer.value,
        nextMoviePath,
        getMoviePreview(nextEntity)
      )
      preseekNextPlayer()
    } else if (nextPlayer.value) {
      nextPlayer.value.src = ''
    }
    refreshBroken()
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
  if (
    currentPlayer.value?.error &&
    holdsMovieOf(currentPlayer.value, processedIds)
  ) {
    reloadPlayer(currentPlayer.value)
  }
  if (currentPlayer.value) {
    const player = currentPlayer.value
    const onScreen =
      isPlaying.value && presentedFrame !== null
        ? presentedFrame
        : Math.round(getCurrentTime() * fps.value)
    // The very end of the movie shows no frame and holds no drawing.
    const lastFrame = Number.isFinite(player.duration)
      ? floorToFrameNumber(player.duration) - 1
      : onScreen
    player.pause()
    const frame = Math.max(0, Math.min(onScreen, lastFrame))
    seekNow(frameStartTime(frame, fps.value))
    currentTimeRaw = currentPlayer.value.currentTime
    emit('frame-update', Math.round(currentTimeRaw * fps.value))
  }
  isPlaying.value = false
}

const play = () => {
  let entity = props.entities[currentIndex.value]
  if (entity) {
    if (!entity.preview_file_id) loadNextEntity()
    entity = props.entities[currentIndex.value]
    if (entity.preview_file_id) {
      if (currentPlayer.value && !isBroken.value) {
        currentPlayer.value.play()?.catch(() => {})
      }
      isPlaying.value = true
      if (isBroken.value) emit('play-failed')
    }
  }
}

const playNext = handleIn => {
  if (!isPlaying.value) return
  handleIn = handleIn || props.handleIn
  if (props.isRepeating) {
    seekNow(frameStartTime(props.handleIn || 1, fps.value))
    currentPlayer.value.play()?.catch(() => {})
    emit('repeat')
  } else {
    const nextIndex = getNextIndex(currentIndex.value)
    currentIndex.value = nextIndex
    emit('entity-change', currentIndex.value)

    if (nextPlayer.value) {
      nextPlayer.value.currentTime = frameStartTime(handleIn || 0, fps.value)
      nextPlayer.value.play()?.catch(() => {})
    }

    switchPlayers()
    updateMaxDuration()
    if (isBroken.value) emit('play-failed')
  }
}

const getCurrentTime = () =>
  currentPlayer.value ? (pendingSeekTime ?? currentPlayer.value.currentTime) : 0

// Direct seeks (pause, loops, raw sync) win over a held scrub target.
const seekNow = currentTime => {
  pendingSeekTime = null
  currentPlayer.value.currentTime = currentTime
}

const getCurrentFrame = () => floorToFrameNumber(getCurrentTime())

const getCurrentTimeRaw = getCurrentTime

const setCurrentTimeRaw = currentTime => {
  if (currentPlayer.value) {
    if (isPlaying.value) seekGuardTarget = currentTime
    // The comparison viewer is re-synced on every scrub move: hold the
    // target like setCurrentTime does, or each seek aborts the previous one.
    if (currentPlayer.value.seeking) pendingSeekTime = currentTime
    else seekNow(currentTime)
  }
}

const setCurrentFrame = frameNumber => {
  // Seek with the unrounded 1/fps, not frameNumber * frameDuration:
  // frameDuration is rounded to 4 decimals (0.0833 at 12fps), so the
  // target drifts ~1ms per frame and tips into the previous frame past
  // ~frame 30 (duplicate). The +0.001 nudge in runSetCurrentTime then
  // lands it inside the correct frame.
  _setCurrentTime(frameNumber / fps.value)
}

const _setCurrentTime = newTime => {
  if (!currentPlayer.value) {
    newTime = 0
  } else if (newTime < 0) {
    newTime = 0
  } else {
    const duration =
      floorToFrameNumber(currentPlayer.value.duration) / fps.value
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
      const target = currentTime + SEEK_NUDGE
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
  const change = isChromium ? 1 / fps.value : 0
  if (currentPlayer.value) {
    currentTimeRaw = getCurrentTime() - change
  } else {
    currentTimeRaw = 0 + change
  }
  emit('frame-update', Math.round(currentTimeRaw * fps.value))
}

const onSeeked = event => {
  if (pendingSeekTime !== null && event.target === currentPlayer.value) {
    seekNow(pendingSeekTime)
  }
}

// A seek can land a paused movie on its very end, where the browser fires
// ended as well: only a playback reaching the end moves on.
const onEnded = () => {
  if (isPlaying.value) emit('play-next')
}

// A movie the browser cannot read (a missing file, a file that is no movie)
// fails on its decoder, which keeps the error, and never ends. The empty
// source of an entity without movie fails too, but is not broken.
const refreshBroken = () => {
  const player = currentPlayer.value
  isBroken.value = Boolean(player?.error && player.getAttribute('src'))
  if (isBroken.value) hideLoading()
}

const holdsMovieOf = (player, previewFileIds) =>
  [...previewFileIds].some(id =>
    player.src.includes(`/preview-files/${id}.mp4`)
  )

const reloadPlayer = player => {
  player.load()
  if (player === currentPlayer.value) refreshBroken()
  else preseekNextPlayer()
}

// Any new load of a movie asks for its file: if that fails too, the movie
// is broken. A movie alone in a playlist sits on both decoders, and the
// other one may still have to ask again.
const onLoadStart = event => {
  const otherPlayer = [player1Ref.value, player2Ref.value].find(
    player => player && player !== event.target
  )
  Array.from(processedIds)
    .filter(id => holdsMovieOf(event.target, [id]))
    .filter(id => !(otherPlayer?.error && holdsMovieOf(otherPlayer, [id])))
    .forEach(id => processedIds.delete(id))
  showLoading()
}

// The other decoder only preloads: its error waits for the switch.
const onError = event => {
  hideLoading()
  if (event.target !== currentPlayer.value) return
  refreshBroken()
  if (isBroken.value && isPlaying.value) emit('play-failed')
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
  refreshBroken()
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
  const frameNumber = Math.round(time * fps.value)
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

const panBy = (dx, dy) => {
  panzoomInstances.forEach(panzoomInstance => {
    panPanzoomBy(panzoomInstance, dx, dy)
  })
}

const zoomAt = (clientX, clientY, ratio) => {
  panzoomInstances.forEach(panzoomInstance => {
    zoomPanzoomAt(
      panzoomInstance,
      displayCanvasRef.value,
      clientX,
      clientY,
      ratio
    )
  })
}

// Both decoders, not the current and the next one: the playlist gives the
// volume before the first movie sets them.
const setVolume = volume => {
  const players = [player1Ref.value, player2Ref.value]
  players.filter(Boolean).forEach(player => {
    player.volume = volume / 100
  })
}

const LOADING_HANDLERS = [
  ['canplay', hideLoading],
  ['stalled', showLoading],
  ['waiting', showLoading],
  ['loadstart', onLoadStart],
  ['error', onError],
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

// The store may never have known the movie as processing: a ready status
// it learns still means the file is there. The movie of a slot the playlist
// holds waits for a pause: loading it would stop the playback, and end the
// slot.
watch(movieStatuses, (statuses, previousStatuses) => {
  const turnedReadyIds = [...statuses]
    .filter(
      ([id, status]) =>
        status === 'ready' &&
        previousStatuses.has(id) &&
        previousStatuses.get(id) !== 'ready'
    )
    .map(([id]) => id)
  turnedReadyIds.forEach(id => processedIds.add(id))
  const players = isPlaying.value
    ? [nextPlayer.value]
    : [currentPlayer.value, nextPlayer.value]
  players
    .filter(
      player =>
        (player?.error ||
          player?.readyState === HTMLMediaElement.HAVE_NOTHING) &&
        holdsMovieOf(player, turnedReadyIds)
    )
    .forEach(reloadPlayer)
})

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
    } else {
      releasePlayers()
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
  // The decoders keep loading once closed, and this one restarts the loop.
  player1Ref.value?.removeEventListener('loadedmetadata', updateMaxDuration)
  player2Ref.value?.removeEventListener('loadedmetadata', updateMaxDuration)

  unbindLoadingHandlers(player1Ref.value)
  unbindLoadingHandlers(player2Ref.value)

  firstPanZoom?.dispose()
})

// Expose public surface for parent components ($refs['raw-player'])

defineExpose({
  // State
  currentIndex,
  currentPlayer,
  isBroken,
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
  panBy,
  zoomAt,
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

.broken {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% - 0.75em);
  color: $white;
  text-align: center;
}

.processing {
  align-items: center;
  color: $white;
  display: flex;
  flex-direction: column;
  gap: 1em;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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

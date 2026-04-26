<template>
  <div class="shared-player playlist-player" ref="container">
    <shared-playlist-header
      :current-entity-display-name="currentEntityDisplayName"
      :entity-count="entityList.length"
      :guest-display-name="guestDisplayName"
      :guest-id="guestId"
      :playing-entity-index="playingEntityIndex"
      :playlist-name="playlistName"
      :project-name="projectName"
      @logout="emit('logout')"
      @next-entity="nextEntity"
      @previous-entity="previousEntity"
    />

    <div class="player-row">
      <div class="player-area">
        <div class="video-container" ref="videoContainer" @contextmenu.prevent>
          <raw-video-player
            ref="rawPlayer"
            class="raw-player"
            :entities="entityList"
            :current-preview-index="currentPreviewIndex"
            :is-hd="isHd"
            :is-repeating="isRepeating"
            :muted="isMuted"
            :movie-url-prefix="movieUrlPrefix"
            :panzoom="true"
            @entity-change="onEntityChange"
            @frame-update="onFrameUpdate"
            @max-duration-update="onMaxDurationUpdate"
            @panzoom-changed="onPanzoomChanged"
            @play-next="onPlayNext"
            @video-loaded="onVideoLoaded"
            v-show="isMovie && !loading"
          />

          <picture-viewer
            ref="picturePlayer"
            :big="true"
            :default-height="600"
            :full-screen="false"
            :light="false"
            :margin-bottom="0"
            :panzoom="true"
            :preview="currentPreview"
            high-quality
            v-show="isPicture && !loading"
          />

          <sound-viewer
            ref="soundPlayer"
            :preview-url="currentPreviewUrl"
            @play-ended="pause"
            v-if="isSound && !loading"
          />

          <div
            class="other-file"
            v-if="isOtherFile && !loading && currentPreview"
          >
            <a
              class="other-file-link"
              :href="downloadUrl"
              :download="downloadFileName"
              target="_blank"
              rel="noopener"
            >
              <download-icon class="icon" :size="20" />
              <span>{{ $t('share.download_preview') }}</span>
              <span class="other-file-extension">.{{ extension }}</span>
            </a>
          </div>

          <shared-annotation-overlay
            :annotations="currentAnnotations"
            :current-frame="currentFrameNumber"
            :frame-duration="frameDuration"
            :guest-id="guestId"
            :is-editable="canComment && !!guestId && isAnnotating"
            :is-picture="isPicture"
            :is-playing="isPlaying"
            :movie-dimensions="overlayDimensions"
            :panzoom-transform="panzoomTransform"
            :preview-file-id="currentPreview?.id || ''"
            :token="token"
            @saved="onAnnotationsSaved"
            v-if="(isMovie || isPicture) && !loading && currentPreview"
          />

          <div class="loading-background" v-if="loading">
            <spinner />
          </div>

          <p
            class="has-text-centered mt2 no-preview"
            v-if="!loading && !currentPreview"
          >
            {{ $t('share.no_preview') }}
          </p>
        </div>
      </div>

      <shared-comments-panel
        :token="token"
        :guest-id="guestId"
        :current-task-id="currentTaskId"
        :can-comment="canComment"
        :current-frame="currentFrameNumber"
        :entity="currentEntity || {}"
        @status-changed="onStatusChanged"
        @time-code-clicked="onTimeCodeClicked"
        v-if="!isCommentsHidden && token"
      />
    </div>

    <video-progress
      ref="videoProgressRef"
      class="video-progress pull-bottom"
      :annotations="currentAnnotations"
      :background-url="darkTimesliderUrl"
      :empty="!isMovie"
      :frame-duration="frameDuration"
      :is-full-mode="false"
      :is-full-screen="false"
      :movie-dimensions="movieDimensions"
      :nb-frames="nbFrames"
      :handle-in="-1"
      :handle-out="-1"
      :preview-id="currentPreview ? currentPreview.id : ''"
      @progress-changed="onProgressChanged"
      v-show="!!currentPreview"
    />

    <shared-playlist-button-bar
      :can-comment="canComment"
      :current-frame-display="currentFrameDisplay"
      :current-time-formatted="currentTimeFormatted"
      :guest-id="guestId"
      :is-full-screen="isFullScreen"
      :is-movie="isMovie"
      :is-picture="isPicture"
      :is-playing="isPlaying"
      :is-sound="isSound"
      :max-duration-formatted="maxDurationFormatted"
      :nb-frames-display="nbFramesDisplay"
      :token="token"
      v-model:is-annotating="isAnnotating"
      v-model:is-comments-hidden="isCommentsHidden"
      v-model:is-entities-hidden="isEntitiesHidden"
      v-model:is-hd="isHd"
      v-model:is-muted="isMuted"
      v-model:is-repeating="isRepeating"
      v-model:is-zoom-enabled="isZoomEnabled"
      v-model:volume="volume"
      @pause="pause"
      @play="play"
      @toggle-full-screen="toggleFullScreen"
      @toggle-sound="onToggleSoundClicked"
    />

    <playlist-progress
      :entity-list="entityListForProgress"
      :fps="fps"
      :frame-duration="frameDuration"
      :is-full-mode="false"
      :is-full-screen="false"
      :movie-dimensions="movieDimensions"
      :nb-frames="nbFrames"
      :preview-id="currentPreview ? currentPreview.id : ''"
      :playlist-duration="playlistDuration"
      :playlist-progress="currentPlaylistProgress"
      :playlist-shot-position="playlistShotPosition"
      :url-prefix="sharedApiPrefix || '/api'"
      @progress-playlist-changed="onProgressPlaylistChanged"
      v-if="entityList.length > 1 && playlistDuration > 0"
    />

    <div
      :class="{
        'playlisted-entities': true,
        flexrow: true,
        hidden: isEntitiesHidden
      }"
      ref="playlistedEntities"
      @wheel="onEntitiesWheel"
    >
      <div
        class="flexrow-item has-text-centered playlisted-wrapper"
        :data-entity-index="index"
        :key="entity.id || index"
        v-for="(entity, index) in entityList"
      >
        <playlisted-entity
          :entity="entity"
          :index="index"
          :is-playing="playingEntityIndex === index"
          :read-only="true"
          :thumbnail-url-prefix="sharedApiPrefix"
          @play-click="selectEntity"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { DownloadIcon } from 'lucide-vue-next'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect
} from 'vue'
import { useStore } from 'vuex'

import darkTimesliderUrl from '@/assets/background/video-timeslider-dark.png'
import { floorToFrame, formatTime } from '@/lib/video'

import PictureViewer from '@/components/previews/PictureViewer.vue'
import PlaylistedEntity from '@/components/pages/playlists/PlaylistedEntity.vue'
import PlaylistProgress from '@/components/previews/PlaylistProgress.vue'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer.vue'
import SharedAnnotationOverlay from '@/components/previews/SharedAnnotationOverlay.vue'
import SharedCommentsPanel from '@/components/previews/SharedCommentsPanel.vue'
import SharedPlaylistButtonBar from '@/components/previews/SharedPlaylistButtonBar.vue'
import SharedPlaylistHeader from '@/components/previews/SharedPlaylistHeader.vue'
import SoundViewer from '@/components/previews/SoundViewer.vue'
import VideoProgress from '@/components/previews/VideoProgress.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Props / Emits

const props = defineProps({
  playlist: { type: Object, default: () => ({}) },
  entities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  token: { type: String, default: '' },
  guestId: { type: String, default: '' },
  canComment: { type: Boolean, default: false }
})

const emit = defineEmits(['logout'])

const store = useStore()

// State

const container = ref(null)
const rawPlayer = ref(null)
const picturePlayer = ref(null)
const playlistedEntities = ref(null)
const videoProgressRef = ref(null)

const playingEntityIndex = ref(0)
const currentPreviewIndex = ref(0)
const currentFrameNumber = ref(0)
const currentPlaylistProgress = ref(0)
const maxDuration = ref(0)
const movieDimensions = ref({ width: 0, height: 0 })
const panzoomTransform = ref({ x: 0, y: 0, scale: 1 })
const volume = ref(100)

const isPlaying = ref(false)
const isRepeating = ref(false)
const isMuted = ref(false)
const isHd = ref(true)
const isZoomEnabled = ref(false)
const isAnnotating = ref(false)
const isFullScreen = ref(false)
const isEntitiesHidden = ref(false)
const isCommentsHidden = ref(
  typeof window !== 'undefined' &&
    window.matchMedia?.('(max-width: 768px)').matches
)

// Tracks whether the very first entity has been auto-loaded after mount.
// Plain `let` (not ref) — only used by the watchers below.
let firstEntityLoaded = false

// Computed

const entityList = computed(() => props.entities || [])

const projectName = computed(() => props.playlist?.project_name || '')
const playlistName = computed(() => props.playlist?.name || '')

const sharedApiPrefix = computed(() =>
  props.token ? `/api/shared/playlists/${props.token}` : ''
)
const movieUrlPrefix = computed(() => sharedApiPrefix.value)

const fps = computed(() => parseFloat(props.playlist?.project_fps) || 25)
const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

const currentEntity = computed(() => entityList.value[playingEntityIndex.value])
const currentTaskId = computed(
  () => currentEntity.value?.preview_file_task_id || ''
)

const currentEntityDisplayName = computed(() => {
  const entity = currentEntity.value
  if (!entity) return ''
  const parent = entity.parent_name || ''
  const name = entity.name || ''
  if (parent && name) return `${parent} / ${name}`
  return parent || name
})

const guestDisplayName = computed(() => {
  const user = store.getters.user
  if (!user?.is_guest) return ''
  return `${user.first_name || ''} ${user.last_name || ''}`.trim()
})

const currentPreview = computed(() => {
  const entity = currentEntity.value
  if (!entity) return null
  if (currentPreviewIndex.value === 0) {
    return {
      id: entity.preview_file_id,
      extension: entity.preview_file_extension,
      task_id: entity.preview_file_task_id,
      revision: entity.preview_file_revision,
      width: entity.preview_file_width,
      height: entity.preview_file_height,
      annotations: entity.preview_file_annotations || [],
      duration: entity.preview_file_duration || 0
    }
  }
  return entity.preview_file_previews?.[currentPreviewIndex.value - 1]
})

const currentPreviewUrl = computed(() => {
  if (!currentPreview.value) return ''
  if (props.token) {
    return `/api/shared/playlists/${props.token}/movies/originals/preview-files/${currentPreview.value.id}.mp4`
  }
  return `/api/pictures/originals/preview-files/${currentPreview.value.id}/download`
})

const currentAnnotations = computed(
  () => currentPreview.value?.annotations || []
)

const extension = computed(() => currentPreview.value?.extension || '')
const isMovie = computed(() => extension.value === 'mp4')
const isPicture = computed(() =>
  ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension.value)
)
const isSound = computed(() =>
  ['mp3', 'wav', 'ogg', 'flac', 'aiff'].includes(extension.value)
)
const isOtherFile = computed(
  () =>
    !!currentPreview.value &&
    !isMovie.value &&
    !isPicture.value &&
    !isSound.value
)

const downloadUrl = computed(() => {
  if (!currentPreview.value) return ''
  if (props.token) {
    return `/api/shared/playlists/${props.token}/movies/originals/preview-files/${currentPreview.value.id}.${extension.value}`
  }
  return `/api/pictures/originals/preview-files/${currentPreview.value.id}/download`
})

const downloadFileName = computed(() => {
  const entityName = currentEntity.value?.name || 'preview'
  return extension.value ? `${entityName}.${extension.value}` : entityName
})

const overlayDimensions = computed(() => {
  if (isPicture.value) {
    return {
      width: currentPreview.value?.width || 0,
      height: currentPreview.value?.height || 0
    }
  }
  return movieDimensions.value
})

const nbFrames = computed(() => {
  const isChromium = !!window.chrome
  const change = isChromium ? frameDuration.value : 0
  const duration =
    maxDuration.value > 0
      ? maxDuration.value + change
      : currentPreview.value?.duration || 0
  if (duration > 0) return Math.round(duration * fps.value)
  if (isPicture.value) return Math.round(2 * fps.value)
  return 0
})

const currentFrameDisplay = computed(() =>
  String(Math.max(currentFrameNumber.value, 0) + 1).padStart(3, '0')
)
const nbFramesDisplay = computed(() =>
  String(nbFrames.value || 0).padStart(3, '0')
)
const currentTimeFormatted = computed(() =>
  formatTime(currentFrameNumber.value * frameDuration.value, fps.value)
)
const maxDurationFormatted = computed(() =>
  formatTime(maxDuration.value, fps.value)
)

const playlistFrameData = computed(() => {
  const position = {}
  const startDurationByIndex = []
  const entitiesWithStart = []
  let duration = 0
  let currentFrame = 0
  const fpsValue = fps.value
  const defaultPictureFrames = Math.round(2 * fpsValue)

  entityList.value.forEach((entity, index) => {
    const entityNbFrames =
      Math.round((entity.preview_file_duration || 0) * fpsValue) ||
      entity.preview_nb_frames ||
      defaultPictureFrames
    const startDuration = (currentFrame + 1) / fpsValue
    startDurationByIndex[index] = startDuration
    entitiesWithStart.push({ ...entity, start_duration: startDuration })
    for (let i = 0; i < entityNbFrames; i++) {
      position[currentFrame + i] = {
        index,
        name: entity.name,
        extension: entity.preview_file_extension,
        start: startDuration,
        width: entity.preview_file_width,
        height: entity.preview_file_height,
        id: entity.preview_file_id
      }
    }
    currentFrame += entityNbFrames
    duration += entityNbFrames / fpsValue
  })
  return {
    playlistShotPosition: position,
    playlistDuration: duration,
    startDurationByIndex,
    entitiesWithStart
  }
})

const playlistShotPosition = computed(
  () => playlistFrameData.value.playlistShotPosition
)
const playlistDuration = computed(
  () => playlistFrameData.value.playlistDuration
)
const entityListForProgress = computed(
  () => playlistFrameData.value.entitiesWithStart
)

// Functions — playback

const play = () => {
  isPlaying.value = true
  rawPlayer.value?.play()
}

const pause = () => {
  isPlaying.value = false
  rawPlayer.value?.pause()
}

const togglePlay = () => (isPlaying.value ? pause() : play())

const selectEntity = index => {
  if (index < 0 || index >= entityList.value.length) return
  const wasPlaying = isPlaying.value
  pause()
  playingEntityIndex.value = index
  currentPreviewIndex.value = 0
  currentFrameNumber.value = 0
  rawPlayer.value?.loadEntity(index)
  if (wasPlaying) nextTick(play)
}

const previousEntity = () => selectEntity(playingEntityIndex.value - 1)
const nextEntity = () => selectEntity(playingEntityIndex.value + 1)

const goPreviousFrame = () => {
  if (!rawPlayer.value) return
  const previousFrame = currentFrameNumber.value - 1
  if (previousFrame < 0) return
  rawPlayer.value.goPreviousFrame()
  onFrameUpdate(previousFrame)
}

const goNextFrame = () => {
  if (!rawPlayer.value) return
  const nextFrame = currentFrameNumber.value + 1
  if (nbFrames.value > 0 && nextFrame >= nbFrames.value) return
  rawPlayer.value.goNextFrame()
  onFrameUpdate(nextFrame)
}

const loadFirstEntity = () => {
  if (firstEntityLoaded) return
  if (entityList.value.length > 0 && rawPlayer.value?.player1) {
    firstEntityLoaded = true
    rawPlayer.value.loadEntity(0)
  }
}

// Functions — fullscreen / sound

const isDocumentFullScreen = () =>
  Boolean(document.fullscreenElement || document.webkitIsFullScreen)

const toggleFullScreen = async () => {
  if (isDocumentFullScreen()) {
    await (document.exitFullscreen?.() || document.webkitCancelFullScreen?.())
  } else if (container.value) {
    await (container.value.requestFullscreen?.() ||
      container.value.webkitRequestFullScreen?.())
  }
}

const onFullScreenChange = () => {
  isFullScreen.value = isDocumentFullScreen()
}

const onToggleSoundClicked = () => {
  isMuted.value = !isMuted.value
}

// Functions — player events

const onEntityChange = index => {
  playingEntityIndex.value = index
}

const onFrameUpdate = rawFrameNumber => {
  const frameNumber = Math.round(Number(rawFrameNumber) || 0)
  currentFrameNumber.value = frameNumber
  videoProgressRef.value?.updateProgressBar(frameNumber)
  const startDuration =
    playlistFrameData.value.startDurationByIndex[playingEntityIndex.value]
  if (typeof startDuration === 'number' && playlistDuration.value > 0) {
    currentPlaylistProgress.value =
      startDuration + frameNumber / (fps.value || 25)
  }
}

const onProgressChanged = frameNumber => {
  if (!isMovie.value) return
  rawPlayer.value?.setCurrentFrame(frameNumber)
  onFrameUpdate(frameNumber)
}

const onProgressPlaylistChanged = frameNumber => {
  const position = playlistShotPosition.value[frameNumber]
  if (!position) return
  const { index, start } = position
  const localFrame = Math.round(frameNumber - start * fps.value)
  if (index !== playingEntityIndex.value) {
    selectEntity(index)
    nextTick(() => rawPlayer.value?.setCurrentFrame(Math.max(localFrame, 0)))
  } else {
    rawPlayer.value?.setCurrentFrame(Math.max(localFrame, 0))
  }
}

const onPlayNext = () => {
  if (!isPlaying.value) return
  const isLast = playingEntityIndex.value >= entityList.value.length - 1
  if (isLast) isPlaying.value = false
  else rawPlayer.value?.playNext()
}

const onVideoLoaded = () => {
  const dimensions = rawPlayer.value?.getNaturalDimensions?.() || {}
  movieDimensions.value = {
    width: dimensions.width || 0,
    height: dimensions.height || 0
  }
}

const onMaxDurationUpdate = duration => {
  maxDuration.value = duration ? floorToFrame(duration, fps.value) : 0
}

const onPanzoomChanged = ({ x, y, scale }) => {
  panzoomTransform.value = { x, y, scale }
}

const onTimeCodeClicked = ({ frame }) => {
  if (!isMovie.value) return
  const frameNumber = Math.max(parseInt(frame, 10) || 0, 0)
  rawPlayer.value?.setCurrentFrame(frameNumber)
  onFrameUpdate(frameNumber)
}

const onAnnotationsSaved = annotations => {
  const entity = currentEntity.value
  if (entity) entity.preview_file_annotations = annotations
}

const onStatusChanged = ({ taskStatusId, color }) => {
  const entity = currentEntity.value
  if (!entity) return
  if (color) entity.task_status_color = color
  if (taskStatusId) entity.task_status_id = taskStatusId
}

// Functions — entity strip

const onEntitiesWheel = event => {
  if (playlistedEntities.value) {
    playlistedEntities.value.scrollLeft += event.deltaY
  }
}

const scrollPlayingEntityIntoView = () => {
  const stripContainer = playlistedEntities.value
  if (!stripContainer || stripContainer.classList.contains('hidden')) return
  const target = stripContainer.querySelector(
    `[data-entity-index="${playingEntityIndex.value}"]`
  )
  if (!target) return
  const containerRect = stripContainer.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const targetCenter = targetRect.left + targetRect.width / 2
  const containerCenter = containerRect.left + containerRect.width / 2
  stripContainer.scrollTo({
    left: stripContainer.scrollLeft + (targetCenter - containerCenter),
    behavior: 'smooth'
  })
}

// Tell the embedded video player its container size has changed: dispatch
// a resize synchronously so flex layout recomputes, then let the DOM paint
// before asking the raw player to re-measure.
const triggerPlayerResize = () => {
  window.dispatchEvent(new Event('resize'))
  setTimeout(() => {
    rawPlayer.value?.resetHeight?.()
    window.dispatchEvent(new Event('resize'))
  }, 50)
}

// Functions — keyboard

const onKeyDown = event => {
  if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return

  const stop = () => {
    event.preventDefault()
    event.stopPropagation()
  }

  switch (event.code) {
    case 'Space':
      stop()
      togglePlay()
      break
    case 'ArrowLeft':
      stop()
      if (event.altKey) previousEntity()
      else goPreviousFrame()
      break
    case 'ArrowRight':
      stop()
      if (event.altKey) nextEntity()
      else goNextFrame()
      break
    case 'KeyJ':
      if (event.altKey) {
        stop()
        previousEntity()
      }
      break
    case 'KeyK':
      if (event.altKey) {
        stop()
        nextEntity()
      }
      break
    case 'Home':
      rawPlayer.value?.setCurrentFrame(0)
      onFrameUpdate(0)
      break
    case 'End':
      if (nbFrames.value > 0) {
        const lastFrame = nbFrames.value - 1
        rawPlayer.value?.setCurrentFrame(lastFrame)
        onFrameUpdate(lastFrame)
      }
      break
  }
}

// Watchers

watchEffect(() => {
  if (!firstEntityLoaded && entityList.value.length > 0 && rawPlayer.value) {
    nextTick(loadFirstEntity)
  }
})

watch(
  () => entityList.value.length,
  newLength => {
    if (newLength > 0) loadFirstEntity()
  }
)

watch(volume, newVolume => {
  nextTick(() => rawPlayer.value?.setVolume(newVolume))
})

watch(isZoomEnabled, enabled => {
  const target = isMovie.value ? rawPlayer.value : picturePlayer.value
  if (enabled) {
    target?.resumePanZoom?.()
  } else {
    target?.pausePanZoom?.()
    target?.resetPanZoom?.()
    panzoomTransform.value = { x: 0, y: 0, scale: 1 }
  }
})

watch(isCommentsHidden, triggerPlayerResize)

watch(isEntitiesHidden, hidden => {
  triggerPlayerResize()
  if (!hidden) nextTick(scrollPlayingEntityIntoView)
})

watch(playingEntityIndex, () => nextTick(scrollPlayingEntityIntoView))

// Lifecycle

onMounted(() => {
  window.addEventListener('keydown', onKeyDown, false)
  document.addEventListener('fullscreenchange', onFullScreenChange)
  document.addEventListener('webkitfullscreenchange', onFullScreenChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('fullscreenchange', onFullScreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullScreenChange)
})
</script>

<style lang="scss" scoped>
// Theme

.shared-player {
  --accent: #7c5cff;
  --accent-soft: rgba(124, 92, 255, 0.16);
  --border-soft: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.12);
  --surface: #14141a;
  --surface-inset: #0e0e13;
  --surface-raised: #1d1d26;
  --text: #f4f5fa;
  --text-muted: rgba(244, 245, 250, 0.6);

  background:
    radial-gradient(
      120% 120% at 10% -10%,
      rgba(124, 92, 255, 0.12) 0%,
      transparent 45%
    ),
    radial-gradient(
      100% 100% at 90% 110%,
      rgba(255, 120, 180, 0.08) 0%,
      transparent 50%
    ),
    var(--surface);
  color: var(--text);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

// Layout & containers

.entity-name {
  color: var(--text-muted);
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-background {
  align-items: center;
  background: black;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.mr1 {
  margin-right: 1em;
}

.no-preview {
  color: var(--text-muted);
}

.other-file {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  padding: 2em;
  width: 100%;
}

.other-file-link {
  align-items: center;
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  color: var(--text);
  display: inline-flex;
  font-size: 0.95em;
  font-weight: 500;
  gap: 0.6em;
  padding: 0.8em 1.4em;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: var(--accent-soft);
    border-color: rgba(124, 92, 255, 0.55);
    box-shadow: 0 8px 22px rgba(124, 92, 255, 0.32);
    color: var(--text);
  }
}

.other-file-extension {
  color: var(--text-muted);
  font-size: 0.85em;
  text-transform: uppercase;
}

.player-area {
  align-items: center;
  background: black;
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.player-row {
  align-items: stretch;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.playlisted-entities {
  align-items: flex-start;
  background: var(--surface-inset);
  border-top: 1px solid var(--border-soft);
  flex-shrink: 0;
  height: 200px;
  min-height: 200px;
  overflow-x: auto;
  padding: 0.6em 0.4em 0.3em 0.6em;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  scrollbar-width: thin;

  &.hidden {
    display: none;
  }

  :deep(.entity-title) {
    color: var(--text);
    font-size: 0.85em;
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  :deep(.playlisted-entity) {
    background: var(--surface-raised);
    border: 1px solid var(--border-soft);
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    padding: 0.4em;
    position: relative;
    transition:
      background 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.25s ease;

    > * {
      position: relative;
      z-index: 1;
    }

    &::after {
      background: linear-gradient(
        135deg,
        rgba(124, 92, 255, 0.35) 0%,
        rgba(255, 120, 180, 0.2) 100%
      );
      border-radius: 12px;
      content: '';
      inset: 0;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      transition: opacity 0.25s ease;
      z-index: 0;
    }

    &.playing {
      border: 1px solid rgba(124, 92, 255, 0.55);
      box-shadow:
        0 0 0 2px rgba(124, 92, 255, 0.18),
        0 6px 22px rgba(124, 92, 255, 0.25);
    }

    &:hover {
      background: #22222e;
      border-color: rgba(124, 92, 255, 0.45);
      box-shadow:
        0 0 0 1px rgba(124, 92, 255, 0.25),
        0 14px 32px rgba(124, 92, 255, 0.28),
        0 6px 18px rgba(0, 0, 0, 0.45);
      transform: translateY(-2px) scale(1.015);

      &::after {
        opacity: 0.1;
      }
    }
  }

  :deep(.playlisted-entity:hover .thumbnail-wrapper img) {
    transform: scale(1.03);
  }

  :deep(.preview-meta) {
    color: var(--text-muted);
    font-size: 0.78em;

    .revision {
      color: var(--text);
      font-weight: 600;
    }
  }

  :deep(.thumbnail-picture) {
    background-color: #000 !important;
    border-color: transparent !important;
  }

  :deep(.thumbnail-wrapper) {
    background: #000;
    border-radius: 8px;
    overflow: hidden;

    img {
      border-radius: 8px;
      transition: transform 0.35s ease;
    }
  }

  :deep(span.thumbnail-empty) {
    background: #000;
  }
}

.raw-player {
  margin-right: 0;
  max-height: 100%;
  max-width: 100%;
}

.video-container {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
}

.video-progress {
  flex-shrink: 0;
  width: 100%;
}

// :deep overrides on the shared player

.shared-player :deep(progress),
.shared-player :deep(progress[value]::-webkit-progress-bar) {
  background-color: transparent;
  border: 0;
}

.shared-player :deep(progress::-moz-progress-bar) {
  background-color: rgba(124, 92, 255, 0.75);
  opacity: 1;
}

.shared-player :deep(progress::-webkit-progress-value) {
  background-color: rgba(124, 92, 255, 0.75);
  opacity: 1;
}

.shared-player :deep(.annotation-mark) {
  background: #ff578c;
  border-radius: 3px;
  box-shadow: 0 0 0 2px rgba(255, 87, 140, 0.25);
}

.shared-player :deep(.entity-status) {
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  height: 14px;
  opacity: 0.55;
  transition:
    opacity 0.2s ease,
    height 0.2s ease;

  &:hover {
    opacity: 0.95;
  }

  span {
    background: var(--surface-raised);
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
    color: var(--text);
    font-size: 0.8em;
    padding: 0.25em 0.6em;
  }
}

.shared-player :deep(.frame-number) {
  background: var(--surface-raised);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  color: var(--text);
}

.shared-player :deep(.handle-in),
.shared-player :deep(.handle-out) {
  background: rgba(14, 14, 19, 0.85);
  color: var(--text-muted);
  opacity: 1;
}

.shared-player :deep(.handle-in::after),
.shared-player :deep(.handle-out::before) {
  background: var(--accent);
}

.shared-player :deep(.playlist-progress) {
  background: #08080c !important;
  border-bottom: 1px solid var(--border-soft) !important;
  border-top: 1px solid var(--border-soft) !important;
  flex-shrink: 0;
  height: 14px;
  transition: height 0.2s ease-in-out;

  &:hover {
    height: 14px;
  }
}

.shared-player :deep(.playlist-progress-position) {
  border-left: 3px solid var(--accent);
  border-radius: 0;
  box-shadow: 0 0 10px rgba(124, 92, 255, 0.6);
  height: 14px;
  top: 0;
}

// Responsive

@media screen and (max-width: 900px) and (orientation: landscape) {
  .video-progress {
    display: none;
  }

  .shared-player :deep(.playlist-progress) {
    display: none !important;
  }
}
</style>

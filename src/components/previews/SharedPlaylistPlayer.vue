<template>
  <div class="shared-player playlist-player" ref="container">
    <header class="shared-header flexrow">
      <a
        class="kitsu-logo-link"
        href="https://www.cg-wire.com/kitsu"
        target="_blank"
        rel="noopener"
        :title="$t('share.kitsu_homepage')"
      >
        <img class="kitsu-logo" src="@/assets/kitsu.png" alt="Kitsu" />
      </a>
      <span class="project-name uppercase" v-if="projectName">
        {{ projectName }}
      </span>
      <span class="header-separator" v-if="projectName">|</span>
      <span class="playlist-name">{{ playlistName }}</span>
      <span class="header-separator" v-if="playlistName">|</span>

      <div class="flexrow flexrow-item entity-nav">
        <button-simple
          class="playlist-button flexrow-item"
          icon="back"
          :title="$t('playlists.actions.previous_shot')"
          @click="previousEntity"
        />
        <button-simple
          class="playlist-button flexrow-item"
          icon="forward"
          :title="$t('playlists.actions.next_shot')"
          @click="nextEntity"
        />
        <span class="flexrow-item entity-counter">
          {{ entityList.length > 0 ? playingEntityIndex + 1 : 0 }}
          /
          {{ entityList.length }}
        </span>
      </div>

      <span
        class="flexrow-item current-entity-name"
        :title="currentEntityDisplayName"
        v-if="currentEntityDisplayName"
      >
        {{ currentEntityDisplayName }}
      </span>

      <div class="filler"></div>

      <span
        class="flexrow-item guest-name"
        :title="guestDisplayName"
        v-if="guestDisplayName"
      >
        {{ guestDisplayName }}
      </span>
      <button
        class="logout-button flexrow-item"
        :title="$t('share.logout')"
        @click="emit('logout')"
        v-if="guestId"
      >
        <log-out-icon class="icon" :size="16" />
      </button>
    </header>

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

          <shared-annotation-overlay
            :annotations="currentAnnotations"
            :current-frame="currentFrameNumber"
            :frame-duration="frameDuration"
            :guest-id="guestId"
            :is-editable="canComment && !!guestId && isAnnotating"
            :is-picture="isPicture"
            :is-playing="isPlaying"
            :movie-dimensions="overlayDimensions"
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
        @time-code-clicked="onTimeCodeClicked"
        v-if="!isCommentsHidden && token"
      />
    </div>

    <video-progress
      ref="videoProgress"
      class="video-progress pull-bottom"
      :annotations="currentAnnotations"
      :background-url="videoProgressBackgroundUrl"
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

    <div class="playlist-footer flexrow">
      <div class="flexrow flexrow-item" v-if="isMovie || isSound">
        <button-simple
          class="playlist-button flexrow-item"
          icon="play"
          :title="$t('playlists.actions.play')"
          @click="play"
          v-if="!isPlaying"
        />
        <button-simple
          class="playlist-button flexrow-item"
          icon="pause"
          :title="$t('playlists.actions.pause')"
          @click="pause"
          v-else
        />
      </div>

      <div class="flexrow flexrow-item time-info" v-if="isMovie">
        <span
          class="flexrow-item time-indicator"
          :title="$t('playlists.actions.current_time')"
        >
          {{ currentTimeFormatted }}
        </span>
        <span class="flexrow-item time-indicator">/</span>
        <span
          class="flexrow-item time-indicator"
          :title="$t('playlists.actions.max_duration')"
        >
          {{ maxDurationFormatted }}
        </span>
        <span
          class="flexrow-item frame-counter mr05 nowrap"
          :title="$t('playlists.actions.frame_number')"
        >
          {{ currentFrameDisplay }} / {{ nbFramesDisplay }}
        </span>
      </div>

      <div class="flexrow flexrow-item" v-if="isMovie">
        <button-simple
          class="playlist-button flexrow-item"
          :active="isRepeating"
          :title="$t('playlists.actions.looping')"
          icon="repeat"
          @click="isRepeating = !isRepeating"
        />
        <button-simple
          class="playlist-button flexrow-item"
          :title="$t('playlists.actions.' + (isHd ? 'switch_ld' : 'switch_hd'))"
          :text="isHd ? 'HD' : 'LD'"
          @click="isHd = !isHd"
        />
        <button-sound
          class="flexrow-item playlist-button"
          @change-sound="onToggleSoundClicked"
          v-model:muted="isMuted"
          v-model:volume="volume"
        />
      </div>

      <div class="filler"></div>

      <button-simple
        class="playlist-button flexrow-item"
        :active="!isCommentsHidden"
        icon="comment"
        :title="$t('playlists.actions.comments')"
        @click="isCommentsHidden = !isCommentsHidden"
        v-if="token"
      />
      <button-simple
        class="playlist-button flexrow-item"
        :active="isAnnotating"
        icon="pencil"
        :title="$t('playlists.actions.annotation_draw')"
        @click="isAnnotating = !isAnnotating"
        v-if="canComment && guestId"
      />
      <button-simple
        class="playlist-button flexrow-item"
        :active="isZoomEnabled"
        icon="loupe"
        :title="$t('playlists.actions.annotation_zoom_pan')"
        @click="isZoomEnabled = !isZoomEnabled"
        v-if="isMovie || isPicture"
      />
      <button-simple
        class="playlist-button flexrow-item"
        :active="!isEntitiesHidden"
        icon="film"
        :title="$t('playlists.actions.entity_list')"
        @click="isEntitiesHidden = !isEntitiesHidden"
      />
      <button-simple
        class="playlist-button flexrow-item"
        :active="isFullScreen"
        :title="$t('playlists.actions.fullscreen')"
        icon="maximize"
        @click="toggleFullScreen"
      />
    </div>

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
      :playlist-progress="playlistProgress"
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
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect
} from 'vue'

import { LogOutIcon } from 'lucide-vue-next'
import { useStore } from 'vuex'

import { floorToFrame, formatTime } from '@/lib/video'

import darkTimesliderUrl from '@/assets/background/video-timeslider-dark.png'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ButtonSound from '@/components/widgets/ButtonSound.vue'
import PictureViewer from '@/components/previews/PictureViewer.vue'
import PlaylistedEntity from '@/components/pages/playlists/PlaylistedEntity.vue'
// eslint-disable-next-line no-unused-vars
import PlaylistProgress from '@/components/previews/PlaylistProgress.vue'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer.vue'
// eslint-disable-next-line no-unused-vars
import SharedAnnotationOverlay from '@/components/previews/SharedAnnotationOverlay.vue'
// eslint-disable-next-line no-unused-vars
import SharedCommentsPanel from '@/components/previews/SharedCommentsPanel.vue'
import SoundViewer from '@/components/previews/SoundViewer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
// eslint-disable-next-line no-unused-vars
import VideoProgress from '@/components/previews/VideoProgress.vue'

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
const guestDisplayName = computed(() => {
  const user = store.getters.user
  if (!user?.is_guest) return ''
  const name = `${user.first_name || ''} ${user.last_name || ''}`.trim()
  return name
})

const currentEntityDisplayName = computed(() => {
  const entity = props.entities[playingEntityIndex.value]
  if (!entity) return ''
  const parent = entity.parent_name || ''
  const name = entity.name || ''
  if (parent && name) return `${parent} / ${name}`
  return parent || name
})

const container = ref(null)
const rawPlayer = ref(null)
const picturePlayer = ref(null)
const playlistedEntities = ref(null)
const videoProgress = ref(null)
const isFullScreen = ref(false)

const playingEntityIndex = ref(0)
const currentPreviewIndex = ref(0)
const isPlaying = ref(false)
const isRepeating = ref(false)
const isMuted = ref(false)
const isHd = ref(true)
const isZoomEnabled = ref(false)
const isEntitiesHidden = ref(false)
const isCommentsHidden = ref(
  typeof window !== 'undefined' &&
    window.matchMedia?.('(max-width: 768px)').matches
)
const isAnnotating = ref(false)
const volume = ref(100)
const currentFrameNumber = ref(0)
const maxDuration = ref(0)
const movieDimensions = ref({ width: 0, height: 0 })
const playlistProgress = ref(0)

const entityList = computed(() => props.entities || [])

const projectName = computed(() => props.playlist?.project_name || '')
const playlistName = computed(() => props.playlist?.name || '')

const sharedApiPrefix = computed(() =>
  props.token ? `/api/shared/playlists/${props.token}` : ''
)

const movieUrlPrefix = computed(() => sharedApiPrefix.value)

const videoProgressBackgroundUrl = darkTimesliderUrl

const currentEntity = computed(() => entityList.value[playingEntityIndex.value])

const currentTaskId = computed(
  () => currentEntity.value?.preview_file_task_id || ''
)

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

const extension = computed(() => currentPreview.value?.extension || '')

const isMovie = computed(() => extension.value === 'mp4')
const isPicture = computed(() =>
  ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension.value)
)
const isSound = computed(() =>
  ['mp3', 'wav', 'ogg', 'flac', 'aiff'].includes(extension.value)
)

const currentPreviewUrl = computed(() => {
  if (!currentPreview.value) return ''
  if (props.token) {
    return `/api/shared/playlists/${props.token}/movies/originals/preview-files/${currentPreview.value.id}.mp4`
  }
  return `/api/pictures/originals/preview-files/${currentPreview.value.id}/download`
})

const fps = computed(() => parseFloat(props.playlist?.project_fps) || 25)

const frameDuration = computed(
  () => Math.round((1 / fps.value) * 10000) / 10000
)

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

const currentAnnotations = computed(
  () => currentPreview.value?.annotations || []
)

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

const selectEntity = index => {
  if (index < 0 || index >= entityList.value.length) return
  const wasPlaying = isPlaying.value
  pause()
  playingEntityIndex.value = index
  currentPreviewIndex.value = 0
  currentFrameNumber.value = 0
  rawPlayer.value?.loadEntity(index)
  if (wasPlaying) {
    nextTick(() => play())
  }
}

const previousEntity = () => selectEntity(playingEntityIndex.value - 1)

const nextEntity = () => selectEntity(playingEntityIndex.value + 1)

const play = () => {
  isPlaying.value = true
  rawPlayer.value?.play()
}

const pause = () => {
  isPlaying.value = false
  rawPlayer.value?.pause()
}

const togglePlay = () => (isPlaying.value ? pause() : play())

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

const onEntityChange = index => {
  playingEntityIndex.value = index
}

const onFrameUpdate = rawFrameNumber => {
  const frameNumber = Math.round(Number(rawFrameNumber) || 0)
  currentFrameNumber.value = frameNumber
  if (videoProgress.value) {
    videoProgress.value.updateProgressBar(frameNumber)
  }
  const startDuration =
    playlistFrameData.value.startDurationByIndex[playingEntityIndex.value]
  if (typeof startDuration === 'number' && playlistDuration.value > 0) {
    const fpsValue = fps.value || 25
    playlistProgress.value = startDuration + frameNumber / fpsValue
  }
}

const onProgressPlaylistChanged = frameNumber => {
  const position = playlistShotPosition.value[frameNumber]
  if (!position) return
  const { index, start } = position
  const localFrame = Math.round(frameNumber - start * fps.value)
  if (index !== playingEntityIndex.value) {
    selectEntity(index)
    nextTick(() => {
      rawPlayer.value?.setCurrentFrame(Math.max(localFrame, 0))
    })
  } else {
    rawPlayer.value?.setCurrentFrame(Math.max(localFrame, 0))
  }
}

const onPlayNext = () => {
  if (!isPlaying.value) return
  const isLast = playingEntityIndex.value >= entityList.value.length - 1
  if (isLast) {
    isPlaying.value = false
  } else {
    rawPlayer.value?.playNext()
  }
}

const onVideoLoaded = () => {
  const dimensions = rawPlayer.value?.getNaturalDimensions?.() || {}
  movieDimensions.value = {
    width: dimensions.width || 0,
    height: dimensions.height || 0
  }
}

const overlayDimensions = computed(() => {
  if (isPicture.value) {
    return {
      width: currentPreview.value?.width || 0,
      height: currentPreview.value?.height || 0
    }
  }
  return movieDimensions.value
})

const onMaxDurationUpdate = duration => {
  maxDuration.value = duration ? floorToFrame(duration, fps.value) : 0
}

const onProgressChanged = frameNumber => {
  if (isMovie.value) {
    rawPlayer.value?.setCurrentFrame(frameNumber)
    onFrameUpdate(frameNumber)
  }
}

const onTimeCodeClicked = ({ frame }) => {
  if (!isMovie.value) return
  const frameNumber = Math.max(parseInt(frame, 10) || 0, 0)
  rawPlayer.value?.setCurrentFrame(frameNumber)
  onFrameUpdate(frameNumber)
}

const onAnnotationsSaved = annotations => {
  const entity = currentEntity.value
  if (entity) {
    entity.preview_file_annotations = annotations
  }
}

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

const onEntitiesWheel = event => {
  if (playlistedEntities.value) {
    playlistedEntities.value.scrollLeft += event.deltaY
  }
}

let firstEntityLoaded = false
const loadFirstEntity = () => {
  if (firstEntityLoaded) return
  if (entityList.value.length > 0 && rawPlayer.value?.player1) {
    firstEntityLoaded = true
    rawPlayer.value.loadEntity(0)
  }
}

const onKeyDown = event => {
  if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return

  const HOMEKEY = 36
  const ENDKEY = 35
  const LEFTKEY = 37
  const RIGHTKEY = 39
  const SPACEKEY = 32
  const JKEY = 74
  const KKEY = 75

  if (event.keyCode === SPACEKEY) {
    event.preventDefault()
    event.stopPropagation()
    togglePlay()
  } else if (event.keyCode === LEFTKEY) {
    event.preventDefault()
    event.stopPropagation()
    if (event.altKey) previousEntity()
    else goPreviousFrame()
  } else if (event.keyCode === RIGHTKEY) {
    event.preventDefault()
    event.stopPropagation()
    if (event.altKey) nextEntity()
    else goNextFrame()
  } else if (event.altKey && event.keyCode === JKEY) {
    event.preventDefault()
    event.stopPropagation()
    previousEntity()
  } else if (event.altKey && event.keyCode === KKEY) {
    event.preventDefault()
    event.stopPropagation()
    nextEntity()
  } else if (event.keyCode === HOMEKEY) {
    rawPlayer.value?.setCurrentFrame(0)
    onFrameUpdate(0)
  } else if (event.keyCode === ENDKEY) {
    if (nbFrames.value > 0) {
      const lastFrame = nbFrames.value - 1
      rawPlayer.value?.setCurrentFrame(lastFrame)
      onFrameUpdate(lastFrame)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown, false)
  document.addEventListener('fullscreenchange', onFullScreenChange)
  document.addEventListener('webkitfullscreenchange', onFullScreenChange)
})

watchEffect(() => {
  if (!firstEntityLoaded && entityList.value.length > 0 && rawPlayer.value) {
    nextTick(loadFirstEntity)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('fullscreenchange', onFullScreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullScreenChange)
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
  if (enabled) target?.resumePanZoom?.()
  else {
    target?.pausePanZoom?.()
    target?.resetPanZoom?.()
  }
})

const triggerPlayerResize = () => {
  // Dispatch synchronously so flex layout recomputes; then let the DOM
  // paint before asking the raw player to re-measure its container.
  window.dispatchEvent(new Event('resize'))
  setTimeout(() => {
    rawPlayer.value?.resetHeight?.()
    window.dispatchEvent(new Event('resize'))
  }, 50)
}

watch(isEntitiesHidden, triggerPlayerResize)
watch(isCommentsHidden, triggerPlayerResize)
</script>

<style lang="scss" scoped>
.shared-player {
  --accent: #7c5cff;
  --accent-soft: rgba(124, 92, 255, 0.16);
  --surface: #14141a;
  --surface-raised: #1d1d26;
  --surface-inset: #0e0e13;
  --border-soft: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.12);
  --text: #f4f5fa;
  --text-muted: rgba(244, 245, 250, 0.6);

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
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
}

.shared-header {
  align-items: center;
  background: rgba(20, 20, 26, 0.7);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-muted);
  gap: 0.8em;
  height: 52px;
  padding: 0 1.4em;
  flex-shrink: 0;

  .kitsu-logo-link {
    display: inline-flex;
    align-items: center;
    line-height: 0;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.75;
    }
  }

  .kitsu-logo {
    height: 26px;
    width: auto;
  }

  .project-name {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.78em;
    color: var(--text-muted);
  }

  .playlist-name {
    color: var(--text);
    font-size: 0.95em;
    font-weight: 600;
    margin: 0;
  }

  .filler {
    flex: 1;
  }

  .entity-nav {
    align-items: center;
    background: var(--surface-inset);
    border: 1px solid var(--border-soft);
    border-radius: 999px;
    gap: 0.25em;
    padding: 0.15em 0.5em;
  }

  .entity-counter {
    color: var(--text-muted);
    font-size: 0.82em;
    font-variant-numeric: tabular-nums;
    margin: 0 0.4em;
  }

  .current-entity-name {
    color: var(--text);
    font-size: 0.9em;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 320px;
  }

  .guest-name {
    color: var(--text-muted);
    font-size: 0.85em;
    margin-left: 0.8em;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout-button {
    align-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 999px;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    margin-right: -0.6em;
    padding: 0.45em 0.55em;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--border-strong);
      color: var(--text);
    }
  }
}

.player-row {
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.player-area {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: black;
}

.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.raw-player {
  max-width: 100%;
  max-height: 100%;
}

.loading-background {
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-preview {
  color: var(--text-muted);
}

.video-progress {
  width: 100%;
  flex-shrink: 0;
}

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

.shared-player :deep(.annotation-mark) {
  background: #ff578c;
  border-radius: 3px;
  box-shadow: 0 0 0 2px rgba(255, 87, 140, 0.25);
}

.shared-player :deep(.playlist-progress) {
  background: #08080c !important;
  border-top: 1px solid var(--border-soft) !important;
  border-bottom: 1px solid var(--border-soft) !important;
  flex-shrink: 0;
  height: 14px;
  transition: height 0.2s ease-in-out;

  &:hover {
    height: 14px;
  }
}

.shared-player :deep(.playlist-progress-position) {
  border-left: 3px solid var(--accent);
  box-shadow: 0 0 10px rgba(124, 92, 255, 0.6);
  height: 14px;
  top: 0;
  border-radius: 0;
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

.playlist-footer {
  background: rgba(20, 20, 26, 0.7);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--border-soft);
  color: var(--text-muted);
  width: 100%;
  height: 44px;
  flex-shrink: 0;
  padding: 0 0.8em;
  align-items: center;
  gap: 0.3em;
}

.playlist-button {
  margin: 0 0.1em;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--text-muted);
  padding: 0.35em 0.6em;
  transition: all 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--border-strong);
    color: var(--text);
  }

  &.active {
    background: var(--accent-soft);
    border-color: rgba(124, 92, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.15);
    color: var(--accent);
  }
}

.time-indicator {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.entity-name {
  color: var(--text-muted);
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlisted-entities {
  background: var(--surface-inset);
  border-top: 1px solid var(--border-soft);
  padding: 0.6em 0.4em 0.3em 0.6em;
  overflow-x: auto;
  align-items: flex-start;
  flex-shrink: 0;
  height: 200px;
  min-height: 200px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;

  &.hidden {
    display: none;
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

    > * {
      position: relative;
      z-index: 1;
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

    &.playing {
      border: 1px solid rgba(124, 92, 255, 0.55);
      box-shadow:
        0 0 0 2px rgba(124, 92, 255, 0.18),
        0 6px 22px rgba(124, 92, 255, 0.25);
    }
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

  :deep(.playlisted-entity:hover .thumbnail-wrapper img) {
    transform: scale(1.03);
  }

  :deep(.thumbnail-picture) {
    background-color: #000 !important;
    border-color: transparent !important;
  }

  :deep(span.thumbnail-empty) {
    background: #000;
  }

  :deep(.entity-title) {
    color: var(--text);
    font-size: 0.85em;
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  :deep(.preview-meta) {
    color: var(--text-muted);
    font-size: 0.78em;

    .revision {
      color: var(--text);
      font-weight: 600;
    }
  }
}

.mr1 {
  margin-right: 1em;
}

@media screen and (max-width: 768px) {
  .shared-header {
    .project-name,
    .header-separator,
    .entity-nav,
    .current-entity-name,
    .guest-name {
      display: none;
    }

    .playlist-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .playlist-footer {
    gap: 0;
    padding: 0 0.2em;

    .flexrow-item {
      margin-right: 0;
    }

    .time-info {
      .time-indicator {
        display: none;
        font-size: 0.75em;
      }

      .frame-counter {
        margin-right: 0.2em;
      }
    }

    .playlist-button {
      box-sizing: border-box;
      justify-content: center;
      margin: 0;
      min-width: 30px;
      padding: 0.3em 0.25em;

      :deep(.icon) {
        height: 14px;
        width: 14px;
      }
    }
  }
}

@media screen and (max-width: 900px) and (orientation: landscape) {
  .shared-header,
  .video-progress {
    display: none;
  }

  .shared-player :deep(.playlist-progress) {
    display: none !important;
  }
}
</style>

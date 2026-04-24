<template>
  <div class="shared-player playlist-player" ref="container">
    <header class="shared-header flexrow">
      <img class="kitsu-logo" src="@/assets/kitsu.png" alt="Kitsu" />
      <span class="project-name uppercase" v-if="projectName">
        {{ projectName }}
      </span>
      <span v-if="projectName">|</span>
      <span class="playlist-name">{{ playlistName }}</span>

      <div class="filler"></div>

      <div class="flexrow flexrow-item entity-nav">
        <span class="flexrow-item entity-counter">
          {{ entityList.length > 0 ? playingEntityIndex + 1 : 0 }}
          /
          {{ entityList.length }}
        </span>
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
      </div>
    </header>

    <div class="player-area">
      <div class="video-container" ref="videoContainer">
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

    <video-progress
      ref="videoProgress"
      class="video-progress pull-bottom"
      :annotations="currentAnnotations"
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

      <div class="flexrow flexrow-item" v-if="isMovie">
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
          class="flexrow-item time-indicator mr05 nowrap"
          :title="$t('playlists.actions.frame_number')"
        >
          ({{ currentFrameDisplay }} / {{ nbFramesDisplay }})
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

      <div class="flexrow flexrow-item" v-if="currentEntity">
        <span class="entity-name">
          {{ currentEntity.entity_name || currentEntity.name }}
        </span>
      </div>

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

import { floorToFrame, formatTime } from '@/lib/video'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ButtonSound from '@/components/widgets/ButtonSound.vue'
import PictureViewer from '@/components/previews/PictureViewer.vue'
import PlaylistedEntity from '@/components/pages/playlists/PlaylistedEntity.vue'
// eslint-disable-next-line no-unused-vars
import PlaylistProgress from '@/components/previews/PlaylistProgress.vue'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer.vue'
import SoundViewer from '@/components/previews/SoundViewer.vue'
import Spinner from '@/components/widgets/Spinner.vue'
// eslint-disable-next-line no-unused-vars
import VideoProgress from '@/components/previews/VideoProgress.vue'

const props = defineProps({
  playlist: { type: Object, default: () => ({}) },
  entities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  token: { type: String, default: '' }
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

const currentEntity = computed(() => entityList.value[playingEntityIndex.value])

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

const onMaxDurationUpdate = duration => {
  maxDuration.value = duration ? floorToFrame(duration, fps.value) : 0
}

const onProgressChanged = frameNumber => {
  if (isMovie.value) {
    rawPlayer.value?.setCurrentFrame(frameNumber)
    onFrameUpdate(frameNumber)
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

watch(isEntitiesHidden, () => {
  // Dispatch synchronously so flex layout recomputes; then let the DOM
  // paint before asking the raw player to re-measure its container.
  window.dispatchEvent(new Event('resize'))
  setTimeout(() => {
    rawPlayer.value?.resetHeight?.()
    window.dispatchEvent(new Event('resize'))
  }, 50)
})
</script>

<style lang="scss" scoped>
.shared-player {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $dark-grey;
}

.shared-header {
  align-items: center;
  background: $dark-grey-light;
  border-bottom: 1px solid $dark-grey-strong;
  color: $white-grey;
  gap: 0.6em;
  height: 44px;
  padding: 0 1em;
  flex-shrink: 0;

  .kitsu-logo {
    height: 24px;
    width: auto;
  }

  .project-name {
    text-transform: uppercase;
  }

  .project-name,
  .playlist-name {
    color: $white;
    font-size: 0.95em;
    font-weight: 600;
    margin: 0;
  }

  .filler {
    flex: 1;
  }

  .entity-nav {
    align-items: center;
    gap: 0.3em;
  }

  .entity-counter {
    color: $white-grey;
    font-size: 0.9em;
    font-variant-numeric: tabular-nums;
  }
}

.player-area {
  flex: 1;
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
  color: $white-grey;
}

.video-progress {
  width: 100%;
}

.playlist-footer {
  background: $dark-grey-light;
  color: $white-grey;
  width: 100%;
  height: 32px;
  padding: 0 0.5em;
  align-items: center;
}

.playlist-button {
  margin: 0;
  background: none;
  border: 0;
  border-radius: 0;
  color: $white-grey;

  &:hover {
    background: var(--background-tag-button);
    border-radius: 5px;
  }
}

.time-indicator {
  color: $white-grey;
  font-size: 0.9em;
}

.entity-name {
  color: $white-grey;
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlisted-entities {
  background: $dark-grey-light;
  border-top: 1px solid $dark-grey-strong;
  padding: 0.4em 0 0 0.4em;
  overflow-x: auto;
  align-items: flex-start;
  height: 240px;
  min-height: 240px;

  &.hidden {
    display: none;
  }
}

.mr1 {
  margin-right: 1em;
}
</style>

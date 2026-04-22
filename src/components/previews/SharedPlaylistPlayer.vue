<template>
  <div class="shared-player playlist-player">
    <div class="player-area">
      <div class="video-container" ref="videoContainer">
        <raw-video-player
          ref="rawPlayer"
          class="raw-player"
          :entities="entityList"
          :current-preview-index="currentPreviewIndex"
          :is-hd="true"
          :is-repeating="isRepeating"
          :muted="isMuted"
          :movie-url-prefix="movieUrlPrefix"
          @entity-change="onEntityChange"
          @frame-update="onFrameUpdate"
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

    <div class="playlist-footer flexrow">
      <div class="flexrow flexrow-item">
        <span class="flexrow-item time-indicator">
          {{ entityList.length > 0 ? playingEntityIndex + 1 : 0 }}
        </span>
        <span class="flexrow-item time-indicator"> / </span>
        <span class="flexrow-item time-indicator mr1">
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

      <div class="filler"></div>

      <div class="flexrow flexrow-item" v-if="currentEntity">
        <span class="entity-name">
          {{ currentEntity.entity_name || currentEntity.name }}
        </span>
      </div>
    </div>

    <div
      class="playlisted-entities flexrow"
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import PictureViewer from '@/components/previews/PictureViewer.vue'
import PlaylistedEntity from '@/components/pages/playlists/PlaylistedEntity.vue'
import RawVideoPlayer from '@/components/pages/playlists/RawVideoPlayer.vue'
import SoundViewer from '@/components/previews/SoundViewer.vue'
import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  playlist: { type: Object, default: () => ({}) },
  entities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  token: { type: String, default: '' }
})

const rawPlayer = ref(null)
const playlistedEntities = ref(null)

const playingEntityIndex = ref(0)
const currentPreviewIndex = ref(0)
const isPlaying = ref(false)
const isRepeating = ref(false)
const isMuted = ref(false)

const entityList = computed(() => props.entities || [])

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

const selectEntity = index => {
  playingEntityIndex.value = index
  currentPreviewIndex.value = 0
  isPlaying.value = false
}

const previousEntity = () => {
  if (playingEntityIndex.value > 0) {
    selectEntity(playingEntityIndex.value - 1)
  }
}

const nextEntity = () => {
  if (playingEntityIndex.value < entityList.value.length - 1) {
    selectEntity(playingEntityIndex.value + 1)
  }
}

const play = () => {
  isPlaying.value = true
  rawPlayer.value?.play()
}

const pause = () => {
  isPlaying.value = false
  rawPlayer.value?.pause()
}

const onEntityChange = index => {
  playingEntityIndex.value = index
}

const onFrameUpdate = () => {}
const onPlayNext = () => nextEntity()
const onVideoLoaded = () => {}

const onEntitiesWheel = event => {
  if (playlistedEntities.value) {
    playlistedEntities.value.scrollLeft += event.deltaY
  }
}

const loadFirstEntity = () => {
  nextTick(() => {
    if (entityList.value.length > 0 && rawPlayer.value) {
      rawPlayer.value.loadEntity(0)
    }
  })
}

onMounted(loadFirstEntity)

watch(
  () => entityList.value.length,
  newLength => {
    if (newLength > 0) loadFirstEntity()
  }
)
</script>

<style lang="scss" scoped>
.shared-player {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $dark-grey;
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
}

.mr1 {
  margin-right: 1em;
}
</style>

<template>
  <div class="playlist-footer flexrow">
    <div class="flexrow flexrow-item" v-if="isMovie || isSound || isPicture">
      <button-simple
        class="playlist-button flexrow-item"
        icon="play"
        :title="$t('playlists.actions.play')"
        @click="$emit('play')"
        v-if="!isPlaying"
      />
      <button-simple
        class="playlist-button flexrow-item"
        icon="pause"
        :title="$t('playlists.actions.pause')"
        @click="$emit('pause')"
        v-else
      />
    </div>

    <div
      class="flexrow flexrow-item sub-preview-nav"
      v-if="entityPreviewLength > 1"
    >
      <button-simple
        class="playlist-button flexrow-item"
        icon="left"
        :title="$t('playlists.actions.files_previous')"
        :disabled="isPlaying"
        @click="$emit('previous-preview')"
      />
      <span class="flexrow-item nowrap sub-preview-position">
        {{ currentPreviewIndex + 1 }} / {{ entityPreviewLength }}
      </span>
      <button-simple
        class="playlist-button flexrow-item"
        icon="right"
        :title="$t('playlists.actions.files_next')"
        :disabled="isPlaying"
        @click="$emit('next-preview')"
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
        v-model:muted="isMuted"
        v-model:volume="volume"
        @change-sound="$emit('toggle-sound')"
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
      icon="loupe"
      :title="$t('playlists.actions.annotation_zoom_pan')"
      @click="$emit('reset-zoom')"
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
      @click="$emit('toggle-full-screen')"
    />
  </div>
</template>

<script setup>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ButtonSound from '@/components/widgets/ButtonSound.vue'

defineProps({
  canComment: { type: Boolean, default: false },
  currentFrameDisplay: { type: String, default: '' },
  currentPreviewIndex: { type: Number, default: 0 },
  currentTimeFormatted: { type: String, default: '' },
  entityPreviewLength: { type: Number, default: 0 },
  guestId: { type: String, default: '' },
  isFullScreen: { type: Boolean, default: false },
  isMovie: { type: Boolean, default: false },
  isPicture: { type: Boolean, default: false },
  isPlaying: { type: Boolean, default: false },
  isSound: { type: Boolean, default: false },
  maxDurationFormatted: { type: String, default: '' },
  nbFramesDisplay: { type: String, default: '' },
  token: { type: String, default: '' }
})

defineEmits([
  'next-preview',
  'pause',
  'play',
  'previous-preview',
  'reset-zoom',
  'toggle-full-screen',
  'toggle-sound'
])

const isAnnotating = defineModel('isAnnotating', {
  type: Boolean,
  default: false
})
const isCommentsHidden = defineModel('isCommentsHidden', {
  type: Boolean,
  default: false
})
const isEntitiesHidden = defineModel('isEntitiesHidden', {
  type: Boolean,
  default: false
})
const isHd = defineModel('isHd', { type: Boolean, default: true })
const isMuted = defineModel('isMuted', { type: Boolean, default: false })
const isRepeating = defineModel('isRepeating', {
  type: Boolean,
  default: false
})
const volume = defineModel('volume', { type: Number, default: 100 })
</script>

<style lang="scss" scoped>
.playlist-button {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: rgba(244, 245, 250, 0.6);
  margin: 0 0.1em;
  padding: 0.35em 0.6em;
  transition: all 0.18s ease;

  &.active {
    background: rgba(124, 92, 255, 0.16);
    border-color: rgba(124, 92, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.15);
    color: #7c5cff;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
    color: #f4f5fa;
  }
}

.playlist-footer {
  align-items: center;
  backdrop-filter: blur(14px);
  background: rgba(20, 20, 26, 0.7);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(244, 245, 250, 0.6);
  flex-shrink: 0;
  gap: 0.3em;
  height: 44px;
  padding: 0 0.8em;
  width: 100%;
}

.time-indicator {
  color: rgba(244, 245, 250, 0.6);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.sub-preview-position {
  color: rgba(244, 245, 250, 0.6);
  font-variant-numeric: tabular-nums;
  padding: 0 0.3em;
}

@media screen and (max-width: 768px) {
  .playlist-footer {
    gap: 0;
    padding: 0 0.2em;

    .flexrow-item {
      margin-right: 0;
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

    .time-info {
      .frame-counter {
        margin-right: 0.2em;
      }

      .time-indicator {
        display: none;
        font-size: 0.75em;
      }
    }
  }
}
</style>

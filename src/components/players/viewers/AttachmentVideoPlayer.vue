<template>
  <div class="attachment-video-player">
    <div class="attachment-error" v-if="hasError">
      <video-off-icon class="attachment-error-icon" :size="18" />
      <span class="attachment-error-text">
        <span class="attachment-error-label">
          {{ $t('comments.player.video_unavailable') }}
        </span>
        <span class="attachment-error-name" v-if="name">{{ name }}</span>
      </span>
    </div>

    <template v-else>
      <div
        class="attachment-video"
        :class="{ 'is-paused': !isPlaying }"
        ref="wrapperEl"
      >
        <video
          class="attachment-video-el"
          ref="mediaEl"
          :src="src"
          preload="metadata"
          playsinline
          @click="togglePlay"
          @error="onError"
        />

        <div class="player-controls">
          <button
            class="player-button play-button"
            :aria-label="
              $t(isPlaying ? 'comments.player.pause' : 'comments.player.play')
            "
            @click="togglePlay"
          >
            <pause-icon :size="14" v-if="isPlaying" />
            <play-icon :size="14" v-else />
          </button>

          <div class="player-progress" @click="onSeek">
            <div
              class="player-progress-fill"
              :style="{ width: `${progress * 100}%` }"
            ></div>
          </div>

          <span class="player-time">{{ formattedTime }}</span>

          <button
            class="player-button"
            :aria-label="
              $t(isMuted ? 'comments.player.unmute' : 'comments.player.mute')
            "
            @click="toggleMute"
          >
            <volume-x-icon :size="14" v-if="isMuted" />
            <volume-2-icon :size="14" v-else />
          </button>

          <button
            class="player-button fullscreen-button"
            :aria-label="$t('comments.player.fullscreen')"
            @click="toggleFullscreen"
          >
            <maximize-icon :size="14" />
          </button>

          <a
            class="player-button download-button"
            :href="downloadHref || src"
            :title="name"
            :aria-label="$t('comments.player.download')"
            download
          >
            <download-icon :size="14" />
          </a>
        </div>
      </div>
      <span class="attachment-name" :title="name" v-if="showName && name">{{
        name
      }}</span>
    </template>
  </div>
</template>

<script setup>
import {
  DownloadIcon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  VideoOffIcon,
  Volume2Icon,
  VolumeXIcon
} from 'lucide-vue-next'
import { ref } from 'vue'

import { useMediaPlayer } from '@/composables/players/mediaPlayer'

defineProps({
  src: { type: String, required: true },
  name: { type: String, default: '' },
  downloadHref: { type: String, default: '' },
  showName: { type: Boolean, default: true }
})

const mediaEl = ref(null)
const wrapperEl = ref(null)
const hasError = ref(false)

const {
  isPlaying,
  isMuted,
  progress,
  formattedTime,
  togglePlay,
  seek,
  toggleMute
} = useMediaPlayer(mediaEl)

const onSeek = event => {
  const rect = event.currentTarget.getBoundingClientRect()
  seek((event.clientX - rect.left) / rect.width)
}

const toggleFullscreen = () => {
  const el = wrapperEl.value
  if (!el) return
  // Compare against OUR element: with the player itself in fullscreen
  // (the comments column lives inside it), a truthy-only check exited
  // the app fullscreen instead of fullscreening the attachment.
  if (document.fullscreenElement === el) {
    document.exitFullscreen?.()
  } else {
    el.requestFullscreen?.()
  }
}

const onError = () => {
  hasError.value = true
}
</script>

<style lang="scss" scoped>
.attachment-video-player {
  display: inline-block;
  margin: 0.5em 0;
  max-width: 32em;
}

.attachment-video {
  background: #000;
  border: 1px solid var(--border);
  border-radius: 8px;
  display: block;
  max-width: 32em;
  overflow: hidden;
  position: relative;
}

.attachment-name {
  color: var(--text);
  display: block;
  font-size: 0.8em;
  margin-top: 0.25em;
  opacity: 0.7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-video-el {
  cursor: pointer;
  display: block;
  max-height: 24em;
  width: 100%;
}

// In fullscreen the wrapper fills the screen; let the video grow to fit it
// (keeping aspect ratio) instead of staying capped at its inline size.
.attachment-video:fullscreen {
  height: 100%;
  max-width: none;
  width: 100%;
}

.attachment-video:fullscreen .attachment-video-el {
  height: 100%;
  max-height: none;
  object-fit: contain;
  width: 100%;
}

// YouTube-style overlay: hidden while playing, revealed on hover and on pause.
.player-controls {
  align-items: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  bottom: 0;
  display: flex;
  gap: 0.5em;
  left: 0;
  opacity: 0;
  padding: 1.2em 0.6em 0.4em;
  pointer-events: none;
  position: absolute;
  right: 0;
  transition: opacity 0.2s ease;
}

.attachment-video:hover .player-controls,
.attachment-video.is-paused .player-controls {
  opacity: 1;
  pointer-events: auto;
}

.player-button {
  align-items: center;
  background: none;
  border: 0;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  padding: 0.2em;

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
}

.player-progress {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  flex: 1;
  height: 6px;
  overflow: hidden;
}

.player-progress-fill {
  background: $purple-strong;
  height: 100%;
}

.player-time {
  color: #fff;
  font-size: 0.85em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.attachment-error {
  align-items: center;
  background: var(--background-page);
  border: 1px solid var(--border-alt);
  border-radius: 8px;
  color: var(--text);
  display: flex;
  gap: 0.6em;
  max-width: 32em;
  padding: 0.6em 0.8em;
}

.attachment-error-icon {
  color: var(--text-alt);
  flex-shrink: 0;
}

.dark .attachment-error {
  border-color: #565a62;
}

.dark .attachment-error-icon,
.dark .attachment-error-name {
  opacity: 0.7;
}

.attachment-error-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.1em;
  margin-left: 0.3em;
  min-width: 0;
}

.attachment-error-label {
  font-size: 0.85em;
  font-weight: 600;
}

.attachment-error-name {
  color: var(--text-alt);
  font-size: 0.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

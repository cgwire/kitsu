<template>
  <div class="attachment-video-player">
    <div
      class="attachment-video"
      :class="{ 'is-paused': !isPlaying }"
      ref="wrapperEl"
    >
      <a
        class="flexrow attachment-fallback"
        :href="downloadHref || src"
        :title="name"
        target="_blank"
        v-if="hasError"
      >
        <paperclip-icon class="flexrow-item attachment-icon icon-1x" />
        <span class="flexrow-item">{{ name }}</span>
      </a>

      <template v-else>
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
      </template>
    </div>
    <span class="attachment-name" :title="name" v-if="!hasError">{{
      name
    }}</span>
  </div>
</template>

<script setup>
import {
  DownloadIcon,
  MaximizeIcon,
  PaperclipIcon,
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon
} from 'lucide-vue-next'
import { ref } from 'vue'

import { useMediaPlayer } from '@/composables/players/mediaPlayer'

defineProps({
  src: { type: String, required: true },
  name: { type: String, default: '' },
  downloadHref: { type: String, default: '' }
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
  if (document.fullscreenElement) {
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

.attachment-fallback {
  color: var(--text);
}
</style>

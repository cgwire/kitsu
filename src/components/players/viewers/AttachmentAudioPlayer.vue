<template>
  <div class="attachment-audio-player">
    <div class="attachment-error" v-if="hasError">
      <volume-x-icon class="attachment-error-icon" :size="18" />
      <span class="attachment-error-text">
        <span class="attachment-error-label">
          {{ $t('comments.player.audio_unavailable') }}
        </span>
        <span class="attachment-error-name" v-if="name">{{ name }}</span>
      </span>
    </div>

    <template v-else>
      <div class="attachment-audio">
        <audio ref="mediaEl" :src="src" preload="metadata" @error="onError" />
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
      <span class="attachment-name" :title="name" v-if="showName && name">{{
        name
      }}</span>
    </template>
  </div>
</template>

<script setup>
import {
  DownloadIcon,
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
  downloadHref: { type: String, default: '' },
  showName: { type: Boolean, default: true }
})

const mediaEl = ref(null)
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

const onError = () => {
  hasError.value = true
}
</script>

<style lang="scss" scoped>
.attachment-audio-player {
  margin: 0.5em 0;
  max-width: 32em;
}

.attachment-audio {
  align-items: center;
  background: var(--background-alt, rgba(127, 127, 127, 0.08));
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex;
  gap: 0.5em;
  padding: 0.4em 0.6em;
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

.player-button {
  align-items: center;
  background: none;
  border: 0;
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  padding: 0.2em;

  &:hover {
    color: var(--selectable-accent, $purple-strong);
  }
}

.player-progress {
  background: var(--border);
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
  color: var(--text);
  font-variant-numeric: tabular-nums;
  font-size: 0.85em;
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

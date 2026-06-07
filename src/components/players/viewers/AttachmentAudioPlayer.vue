<template>
  <div class="attachment-audio-player">
    <div class="attachment-audio">
      <audio ref="mediaEl" :src="src" preload="metadata" @error="onError" />

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
    color: var(--background-selectable, $purple-strong);
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

.attachment-fallback {
  color: var(--text);
}
</style>

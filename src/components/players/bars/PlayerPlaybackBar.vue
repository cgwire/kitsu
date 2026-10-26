<template>
  <div
    class="left flexrow"
    v-if="isMovie || isSound || (is3DModel && is3DAnimation) || isPicture"
  >
    <button-simple
      class="flexrow-item"
      :title="
        $t(isPlaying ? 'playlists.actions.pause' : 'playlists.actions.play')
      "
      :icon="isPlaying ? 'pause' : 'play'"
      @click="$emit('play-pause-clicked')"
    />

    <combobox-styled
      class="flexrow-item"
      :options="available3DAnimations"
      :is-dark="true"
      :thin="true"
      v-model="current3DAnimation"
      v-if="is3DModel && is3DAnimation"
    />
  </div>

  <div class="left flexrow" v-if="(isMovie || isSound) && !compact">
    <template v-if="!phone">
      <span
        class="flexrow-item time-indicator current-time"
        :class="{ 'narrow-hidden': isMovie }"
        :title="$t('playlists.actions.current_time')"
      >
        {{ currentTime }}
      </span>
      <span class="flexrow-item time-indicator" v-if="fullScreen"> / </span>
      <span
        class="flexrow-item time-indicator"
        :title="$t('playlists.actions.max_duration')"
        v-if="fullScreen"
      >
        {{ maxDuration }}
      </span>
    </template>

    <div
      class="flexrow-item time-indicator mr1 nowrap"
      :title="$t('playlists.actions.frame_number')"
      v-if="isMovie"
    >
      {{ frameIndicator }}
    </div>

    <template v-if="isMovie && !phone">
      <div class="separator"></div>

      <button-simple
        :active="isRepeating"
        :title="$t('playlists.actions.looping')"
        icon="repeat"
        @click="$emit('repeat-clicked')"
        v-if="!light || fullScreen"
      />
      <button-simple
        class="flexrow-item"
        :title="
          $t(
            isHd ? 'playlists.actions.switch_ld' : 'playlists.actions.switch_hd'
          )
        "
        :text="isHd ? 'HD' : 'LD'"
        @click="isHd = !isHd"
        v-if="!light || fullScreen"
      />

      <speed-button class="flexrow-item" v-model="speed" />

      <button-simple
        class="flexrow-item"
        :active="isShowAnnotationsWhilePlaying"
        :title="$t('playlists.actions.toggle_playing_annotations')"
        icon="triangle"
        @click="isShowAnnotationsWhilePlaying = !isShowAnnotationsWhilePlaying"
        v-if="
          isShowAnnotationsWhilePlaying !== undefined && (!light || fullScreen)
        "
      />

      <button-sound
        class="flexrow-item"
        @change-sound="$emit('toggle-sound-clicked')"
        v-model:muted="isMuted"
        v-model:volume="volume"
      />

      <button-simple
        class="flexrow-item"
        :active="isWaveformDisplayed"
        :title="$t('playlists.actions.toggle_waveform')"
        icon="waveform"
        @click="isWaveformDisplayed = !isWaveformDisplayed"
        v-if="isWaveformDisplayed !== undefined && (!light || fullScreen)"
      />
    </template>
  </div>

  <slot name="extra-controls" />
</template>

<script setup>
import { computed } from 'vue'

import { formatFrame } from '@/lib/video'

import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ButtonSound from '@/components/widgets/ButtonSound.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import SpeedButton from '@/components/widgets/SpeedButton.vue'

// Props / Emits
const props = defineProps({
  available3DAnimations: {
    type: Array,
    default: () => []
  },
  compact: {
    type: Boolean,
    default: false
  },
  currentFrameLabel: {
    type: String,
    default: ''
  },
  currentTime: {
    type: String,
    default: '00:00:00:00'
  },
  frameStart: {
    type: Number,
    default: undefined
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  is3DAnimation: {
    type: Boolean,
    default: false
  },
  is3DModel: {
    type: Boolean,
    default: false
  },
  isMovie: {
    type: Boolean,
    default: false
  },
  isPicture: {
    type: Boolean,
    default: false
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  isRepeating: {
    type: Boolean,
    default: false
  },
  isSound: {
    type: Boolean,
    default: false
  },
  light: {
    type: Boolean,
    default: false
  },
  maxDuration: {
    type: String,
    default: '00:00:00:00'
  },
  nbFrames: {
    type: Number,
    default: 0
  },
  // phones keep play and the frame number only
  phone: {
    type: Boolean,
    default: false
  }
})

defineEmits(['play-pause-clicked', 'repeat-clicked', 'toggle-sound-clicked'])

const current3DAnimation = defineModel('current3DAnimation', {
  type: String,
  default: null
})
const isHd = defineModel('isHd', { type: Boolean, default: false })
const isMuted = defineModel('isMuted', { type: Boolean, default: false })
const isShowAnnotationsWhilePlaying = defineModel(
  'isShowAnnotationsWhilePlaying',
  { default: undefined }
)
const isWaveformDisplayed = defineModel('isWaveformDisplayed', {
  default: undefined
})
const speed = defineModel('speed', { type: Number, default: 3 })
const volume = defineModel('volume', { type: Number, default: 50 })

// Computed

// Display-only shift so the first frame reads as `frameStart` (e.g. a shot
// with data.frame_in = 1001) instead of 1. Internal frame math is untouched.
const frameStartOffset = computed(() =>
  props.frameStart > 0 ? props.frameStart - 1 : 0
)

const frameIndicator = computed(() => {
  const frameLabel = frameStartOffset.value
    ? formatFrame(Number(props.currentFrameLabel) + frameStartOffset.value)
    : props.currentFrameLabel
  if (props.light && !props.fullScreen) {
    return `(${frameLabel})`
  }
  const nbFrames = String(props.nbFrames + frameStartOffset.value).padStart(
    3,
    '0'
  )
  return `(${frameLabel} / ${nbFrames})`
})
</script>

<style lang="scss" scoped>
.time-indicator {
  color: $light-grey;
  padding-left: 0.2em;
  margin-right: 0;
}

// Hide the timecode of a movie when PreviewPlayer is narrow: the frame
// counter next to it carries enough position info on its own.
@container preview-player (max-width: 600px) {
  .narrow-hidden {
    display: none;
  }
}
</style>

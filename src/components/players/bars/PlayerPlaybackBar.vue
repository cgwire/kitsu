<template>
  <div
    class="left flexrow"
    v-if="isMovie || isSound || (is3DModel && is3DAnimation) || isPicture"
  >
    <button-simple
      class="flexrow-item"
      :title="$t('playlists.actions.play')"
      icon="play"
      @click="$emit('play-pause-clicked')"
      v-if="!isPlaying"
    />
    <button-simple
      class="flexrow-item"
      :title="$t('playlists.actions.pause')"
      icon="pause"
      @click="$emit('play-pause-clicked')"
      v-else
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

  <div class="left flexrow" v-if="isMovie && !compact">
    <span
      class="flexrow-item time-indicator current-time"
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

    <div
      class="flexrow-item time-indicator mr1"
      :title="$t('playlists.actions.frame_number')"
    >
      <span> ({{ currentFrameLabel }}</span
      ><span v-if="!light || fullScreen"> / </span
      ><span v-if="!light || fullScreen">{{
        (nbFrames + '').padStart(3, '0')
      }}</span
      >)
    </div>

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
      :title="$t('playlists.actions.' + (isHd ? 'switch_ld' : 'switch_hd'))"
      :text="isHd ? 'HD' : 'LD'"
      @click="isHd = !isHd"
      v-if="(!light || fullScreen) && isMovie"
    />

    <speed-button class="flexrow-item" v-model="speed" v-if="isMovie" />

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
  </div>

  <slot name="extra-controls" />
</template>

<script setup>
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'
import ButtonSound from '@/components/widgets/ButtonSound.vue'
import ComboboxStyled from '@/components/widgets/ComboboxStyled.vue'
import SpeedButton from '@/components/widgets/SpeedButton.vue'

defineProps({
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
  }
})

defineEmits(['play-pause-clicked', 'repeat-clicked', 'toggle-sound-clicked'])

const current3DAnimation = defineModel('current3DAnimation')
const isHd = defineModel('isHd', { default: false })
const isMuted = defineModel('isMuted', { default: false })
const isShowAnnotationsWhilePlaying = defineModel(
  'isShowAnnotationsWhilePlaying',
  { default: undefined }
)
const isWaveformDisplayed = defineModel('isWaveformDisplayed', {
  default: undefined
})
const speed = defineModel('speed', { default: 3 })
const volume = defineModel('volume', { default: 50 })
</script>

<style lang="scss" scoped>
.time-indicator {
  color: $light-grey;
  padding-left: 0.2em;
  margin-right: 0;
}

// Hide the timecode when PreviewPlayer is narrow — the frame counter
// next to it carries enough position info on its own.
@container preview-player (max-width: 600px) {
  .current-time {
    display: none;
  }
}
</style>

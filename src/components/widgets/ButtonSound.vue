<template>
  <div class="sound-control-container">
    <button-simple
      :title="
        isMuted ? $t('playlists.actions.unmute') : $t('playlists.actions.mute')
      "
      :icon="isMuted ? 'soundoff' : 'soundon'"
      @click="onToggleSoundClicked"
    />
    <div class="volume-bar">
      <input
        class="volume-slider"
        min="0"
        max="100"
        type="range"
        :title="$t('playlists.volume_level', { level: volume })"
        :value="volume"
        @input.passive="onVolumeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

defineOptions({
  name: 'button-sound'
})

const DEFAULT_VOLUME = 50

const isMuted = defineModel('muted', { default: false })
const volume = defineModel('volume', { default: DEFAULT_VOLUME })
const previousVolume = ref(DEFAULT_VOLUME)

const onToggleSoundClicked = () => {
  if (isMuted.value) {
    isMuted.value = false
    volume.value = previousVolume.value || DEFAULT_VOLUME
  } else {
    previousVolume.value = volume.value
    isMuted.value = true
    volume.value = 0
  }
}

const onVolumeChange = event => {
  const newVolume = event.target.valueAsNumber
  volume.value = newVolume
  isMuted.value = newVolume === 0
  if (newVolume > 0) {
    previousVolume.value = newVolume
  }
}
</script>

<style lang="scss" scoped>
.sound-control-container {
  margin: 0;
  position: relative;

  .button {
    background: transparent;
    border: none;
  }

  &:hover .volume-bar {
    display: block;
  }
}

.volume-bar {
  background: $dark-grey-2;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: none;
  height: 36px;
  left: 50%;
  width: 105px;
  padding: 4px 12px;
  position: absolute;
  top: -34px;
  transform: translateX(-45%);
  white-space: nowrap;
  z-index: 1000;
}

.volume-slider {
  border-radius: 3px;
  background: var(--background-alt);
  cursor: pointer;
  height: 6px;
  outline: none;
  width: 80px;

  &::-webkit-slider-thumb {
    appearance: none;
    background: $dark-purple;
    border-radius: 50%;
    border: 2px solid var(--background);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    height: 16px;
    width: 16px;
    z-index: 10;
  }

  &::-moz-range-thumb {
    background: $dark-purple;
    border-radius: 50%;
    border: 2px solid var(--background);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    height: 16px;
    width: 16px;
    z-index: 10;
  }

  &::-webkit-slider-track {
    background: var(--background-alt);
    border-radius: 3px;
  }

  &::-moz-range-track {
    background: var(--background-alt);
    border-radius: 3px;
    height: 6px;
  }

  &::-moz-range-progress {
    background-color: $blue;
    height: 5px;
    border-radius: 3px;
  }
}
</style>

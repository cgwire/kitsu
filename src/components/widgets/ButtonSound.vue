<template>
  <div class="sound-control-container">
    <button-simple
      class="flexrow-item"
      :title="$t('playlists.actions.unmute')"
      icon="soundoff"
      @click="onToggleSoundClicked"
      v-if="isMuted"
    />
    <button-simple
      class="flexrow-item"
      :title="$t('playlists.actions.mute')"
      icon="soundon"
      @click="onToggleSoundClicked"
      v-else
    />

    <div class="volume-bar">
      <input
        class="volume-slider"
        min="0"
        max="100"
        type="range"
        :title="$t('playlists.volume_level', { level: volume })"
        :value="volume"
        @input="onVolumeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import ButtonSimple from '@/components/widgets/ButtonSimple.vue'

const isMuted = defineModel()
const volume = defineModel('volume', { default: 50 })

const onToggleSoundClicked = () => {
  isMuted.value = !isMuted.value
}

const onVolumeChange = event => {
  volume.value = parseInt(event.target.value)
  if (volume.value === 0) {
    isMuted.value = true
  } else if (isMuted.value) {
    isMuted.value = false
  }
}

watch(volume, newVolume => {
  if (newVolume === 0) {
    isMuted.value = true
  }
})

watch(isMuted, muted => {
  if (muted && volume.value > 0) {
    volume.value = 0
  } else if (!muted && volume.value === 0) {
    volume.value = 50
  }
})
</script>

<style lang="scss" scoped>
.sound-control-container {
  display: inline-block;
  margin: 0;
  position: relative;

  .button {
    background: transparent;
    border: 0;
    margin: 0;
  }

  &:hover .volume-bar {
    display: block;
  }
}

.volume-bar {
  background: #36393f;
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

.volume-track {
  background: var(--background-alt);
  border-radius: 3px;
  height: 6px;
  overflow: hidden;
  position: relative;
}

.volume-fill {
  background: #ccc;
  border-radius: 3px;
  height: 6px;
  left: 12px;
  position: absolute;
  top: 14px;
  transition: width 0.1s ease;
  z-index: 0;
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

<template>
  <div
    id="sound-container"
    :style="{
      height: defaultHeight + 'px',
      width: '100%'
    }"
  >
    <div class="loading" v-show="isLoading">
      <spinner />
    </div>
    <div class="file-name" v-show="!isLoading">
      {{ fileName }}
    </div>
    <div ref="waveform" class="waveform"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import WaveSurfer from 'wavesurfer.js'

import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  defaultHeight: {
    type: Number,
    default: 200
  },
  fileName: {
    type: String,
    default: ''
  },
  previewUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['play-ended'])

// A template ref, not a global '#waveform' id: PreviewPlayer mounts a
// main and a comparison PreviewViewer, each with its own SoundViewer, so
// an id selector would bind every WaveSurfer instance to the first match.
const waveform = ref(null)
const isLoading = ref(false)
let wavesurfer = null

const play = () => {
  wavesurfer.play()?.catch(() => {})
}

const pause = () => {
  wavesurfer.pause()
}

// destroy() aborts the in-flight fetch on teardown, rejecting load() with an
// expected AbortError; ignore it and surface only real load failures.
const onLoadError = err => {
  if (err?.name === 'AbortError') {
    return
  }
  isLoading.value = false
  console.error('Error loading sound preview:', err)
}

onMounted(() => {
  isLoading.value = true
  wavesurfer = WaveSurfer.create({
    container: waveform.value,
    waveColor: '#00B242',
    progressColor: '#008732',
    height: props.defaultHeight
  })
  wavesurfer.on('ready', () => {
    isLoading.value = false
  })
  wavesurfer.on('finish', () => {
    emit('play-ended')
  })
  if (props.previewUrl) {
    isLoading.value = true
    wavesurfer.load(props.previewUrl).catch(onLoadError)
  }
})

watch(
  () => props.previewUrl,
  () => {
    if (props.previewUrl && props.previewUrl.length > 0) {
      isLoading.value = true
      wavesurfer.load(props.previewUrl).catch(onLoadError)
    } else {
      // The parent blanks the URL when another preview kind takes over:
      // stop playback instead of letting the loaded audio run on.
      wavesurfer.pause()
    }
  }
)

onBeforeUnmount(() => {
  wavesurfer?.destroy()
  wavesurfer = null
})

defineExpose({ play, pause })
</script>

<style lang="scss" scoped>
#sound-container {
  position: relative;
  display: flex;
}

.file-name {
  position: absolute;
  left: 4px;
  bottom: 4px;
  color: $white;
}

.loading {
  position: absolute;
  left: calc(50% - 10px);
  top: calc(50% - 10px);
  color: white;
}

.waveform {
  flex: 1;
  margin: auto;
}
</style>

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
    <div id="waveform"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import WaveSurfer from 'wavesurfer.js'

import Spinner from '@/components/widgets/Spinner.vue'

const props = defineProps({
  previewUrl: {
    default: '',
    type: String
  },
  fileName: {
    default: '',
    type: String
  },
  defaultHeight: {
    type: Number,
    default: 200
  },
  fullScreen: {
    default: false,
    type: Boolean
  }
})

const emit = defineEmits(['play-ended'])

const isLoading = ref(false)
let wavesurfer = null

const play = () => {
  wavesurfer.play()
}

const pause = () => {
  wavesurfer.pause()
}

onMounted(() => {
  isLoading.value = true
  wavesurfer = WaveSurfer.create({
    container: '#waveform',
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
    wavesurfer.load(props.previewUrl)
  }
})

watch(
  () => props.previewUrl,
  () => {
    if (props.previewUrl && props.previewUrl.length > 0) {
      isLoading.value = true
      wavesurfer.load(props.previewUrl)
    }
  }
)

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

#waveform {
  flex: 1;
  margin: auto;
}
</style>

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
    <p class="broken" v-if="isBroken">
      {{ $t('preview.broken') }}
    </p>
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
  isMuted: {
    type: Boolean,
    default: false
  },
  previewUrl: {
    type: String,
    default: ''
  },
  // Out of 100, like the volume of the movies.
  volume: {
    type: Number,
    default: 100
  }
})

const emit = defineEmits([
  'duration-changed',
  'play-ended',
  'play-failed',
  'time-update'
])

// A template ref, not a global '#waveform' id: PreviewPlayer mounts a
// main and a comparison PreviewViewer, each with its own SoundViewer, so
// an id selector would bind every WaveSurfer instance to the first match.
const waveform = ref(null)
const isLoading = ref(false)
const isBroken = ref(false)
let wavesurfer = null
let isPlayPending = false
// The media element of a sound that fails while it plays may be paused
// already when its error comes: the play asked for is kept here.
let isPlayRequested = false

// load() gives the media element its file only once fetched: a play()
// before that would start nothing, so it waits for the ready event.
const play = () => {
  if (isBroken.value) {
    emit('play-failed')
  } else if (isLoading.value) {
    isPlayPending = true
  } else {
    isPlayRequested = true
    wavesurfer?.play()?.catch(() => {})
  }
}

const pause = () => {
  isPlayPending = false
  isPlayRequested = false
  wavesurfer?.pause()
}

const setCurrentTime = time => {
  wavesurfer?.setTime(time)
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

// PreviewViewer keeps a hidden sound viewer under every preview, two per
// player: the waveform is set up for the first sound only.
const loadSound = () => {
  if (!wavesurfer) {
    wavesurfer = WaveSurfer.create({
      container: waveform.value,
      waveColor: '#00B242',
      progressColor: '#008732',
      height: props.defaultHeight
    })
    // load() keeps the media element, and with it the volume and the mute.
    wavesurfer.setVolume(props.volume / 100)
    wavesurfer.setMuted(props.isMuted)
    wavesurfer.on('ready', duration => {
      isLoading.value = false
      emit('duration-changed', duration)
      // A seek while the sound decoded was told as its start.
      emit('time-update', wavesurfer.getCurrentTime())
      if (isPlayPending) {
        isPlayPending = false
        play()
      }
    })
    // A sound the browser cannot decode fails on the media element, and
    // load() never settles. Web Audio can fail to decode a sound the media
    // element reads: it plays without its waveform.
    wavesurfer.on('error', err => {
      isLoading.value = false
      if (err?.name === 'EncodingError') {
        emit('duration-changed', wavesurfer.getDuration())
        emit('time-update', wavesurfer.getCurrentTime())
      } else {
        isBroken.value = true
      }
      // A sound can also fail past its ready event, while it plays.
      if (isPlayPending || (isPlayRequested && isBroken.value)) {
        isPlayPending = false
        play()
      }
    })
    wavesurfer.on('finish', () => {
      isPlayRequested = false
      emit('play-ended')
    })
    // Sent while playing and on every seek, a click on the waveform included.
    // A load pauses the sound before, whose time then comes in: a sound that
    // loads stands at its start.
    wavesurfer.on('timeupdate', time => {
      emit('time-update', isLoading.value ? 0 : time)
    })
  }
  isLoading.value = true
  isBroken.value = false
  isPlayRequested = false
  emit('duration-changed', 0)
  wavesurfer.load(props.previewUrl).catch(onLoadError)
}

onMounted(() => {
  if (props.previewUrl) loadSound()
})

watch(
  () => props.previewUrl,
  () => {
    if (props.previewUrl) {
      loadSound()
    } else {
      // The parent blanks the URL when another preview kind takes over:
      // stop playback instead of letting the loaded audio run on, and drop
      // a play still waiting for the sound to load.
      pause()
    }
  }
)

watch(
  () => props.volume,
  () => wavesurfer?.setVolume(props.volume / 100)
)

watch(
  () => props.isMuted,
  () => wavesurfer?.setMuted(props.isMuted)
)

onBeforeUnmount(() => {
  wavesurfer?.destroy()
  wavesurfer = null
})

defineExpose({ play, pause, setCurrentTime })
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

.broken {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% - 0.75em);
  color: $white;
  text-align: center;
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

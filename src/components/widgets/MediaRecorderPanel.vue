<template>
  <div class="recorder-panel">
    <p class="recorder-error" v-if="error">
      {{ $t(`main.recording.${error}`) }}
      <button class="button is-small cancel-button" @click="onCancel">
        {{ $t('main.recording.cancel') }}
      </button>
    </p>

    <!-- Audio: nothing starts until the user asks for it. -->
    <div class="recorder-start" v-else-if="needsStart && mode === 'audio'">
      <select
        class="mic-select"
        :aria-label="$t('main.recording.microphone')"
        v-model="selectedDeviceId"
        v-if="devices.length > 1"
      >
        <option
          v-for="(device, index) in devices"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{
            device.label || `${$t('main.recording.microphone')} ${index + 1}`
          }}
        </option>
      </select>
      <button class="button is-primary start-button" @click="beginAudio">
        <mic-icon :size="18" />
        <span>{{ $t('main.record_audio') }}</span>
      </button>
      <button class="button cancel-button" @click="onCancel">
        {{ $t('main.recording.cancel') }}
      </button>
    </div>

    <!-- Video: pick a source first. -->
    <div class="recorder-sources" v-else-if="needsStart">
      <button class="button" @click="armVideo('webcam')">
        <video-icon :size="16" />
        <span>{{ $t('main.recording.webcam') }}</span>
      </button>
      <button class="button" @click="armVideo('screen')">
        <monitor-icon :size="16" />
        <span>{{ $t('main.recording.screen') }}</span>
      </button>
      <button class="button cancel-button" @click="onCancel">
        {{ $t('main.recording.cancel') }}
      </button>
    </div>

    <!-- Armed / recording: a single preview element, controls depend on state. -->
    <template v-else>
      <video
        class="recorder-preview"
        ref="previewEl"
        muted
        autoplay
        playsinline
        v-if="mode === 'video'"
      />
      <canvas class="recorder-meter" ref="meterEl" v-else />

      <!-- Video armed: wait for the user to start recording. -->
      <div
        class="recorder-controls"
        v-if="mode === 'video' && status !== 'recording'"
      >
        <button
          class="button is-primary start-button"
          :disabled="status !== 'ready'"
          @click="onStartRecording"
        >
          <video-icon :size="16" />
          <span>{{ $t('main.recording.start') }}</span>
        </button>
        <button class="button cancel-button" @click="onCancel">
          {{ $t('main.recording.cancel') }}
        </button>
      </div>

      <!-- Recording (or audio). -->
      <div class="recorder-controls" v-else>
        <span class="recorder-timer">
          <span class="recorder-dot" v-if="status === 'recording'"></span>
          {{ formattedElapsed }}
        </span>
        <button
          class="button is-primary stop-button"
          :disabled="status !== 'recording'"
          @click="onStop"
        >
          <square-icon :size="16" />
          <span>{{ $t('main.recording.stop') }}</span>
        </button>
        <button class="button cancel-button" @click="onCancel">
          {{ $t('main.recording.cancel') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { MicIcon, MonitorIcon, SquareIcon, VideoIcon } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useMediaRecorder } from '@/composables/useMediaRecorder'

const props = defineProps({
  mode: { type: String, default: 'audio' } // 'audio' | 'video'
})
const emit = defineEmits(['recorded', 'cancel'])

const {
  status,
  elapsed,
  previewStream,
  analyser,
  error,
  listAudioInputs,
  arm,
  record,
  start,
  stop,
  cancel
} = useMediaRecorder()

const previewEl = ref(null)
const meterEl = ref(null)
const started = ref(false)
const devices = ref([])
const selectedDeviceId = ref('')

const needsStart = computed(() => !started.value)

const formattedElapsed = computed(() => {
  const total = elapsed.value
  const minutes = String(Math.floor(total / 60)).padStart(2, '0')
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

const beginAudio = () => {
  started.value = true
  start('audio', selectedDeviceId.value || undefined)
}

// Video: acquire the stream and show a preview, then wait for the user to
// press Start (record()) instead of recording immediately.
const armVideo = source => {
  started.value = true
  arm(source)
}

const onStartRecording = () => record()

const loadDevices = async () => {
  devices.value = await listAudioInputs()
  if (devices.value.length && !selectedDeviceId.value) {
    selectedDeviceId.value = devices.value[0].deviceId
  }
}

const onStop = async () => {
  const file = await stop()
  if (file) emit('recorded', file)
}

const onCancel = () => {
  cancel()
  emit('cancel')
}

// Bind the live preview stream to the <video> element once both exist.
watch([previewStream, previewEl], ([stream, el]) => {
  if (el && stream) el.srcObject = stream
})

// Audio level meter: draw analyser bars on the canvas while recording.
let rafId = null

const drawMeter = () => {
  const canvas = meterEl.value
  const node = analyser.value
  const context = canvas?.getContext?.('2d')
  if (!canvas || !node || !context) {
    rafId = null
    return
  }
  // Match the backing store to the displayed size (× DPR) so bars stay crisp.
  const dpr = window.devicePixelRatio || 1
  const width = canvas.clientWidth || 240
  const height = canvas.clientHeight || 48
  if (
    canvas.width !== Math.round(width * dpr) ||
    canvas.height !== Math.round(height * dpr)
  ) {
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
  }
  context.setTransform(dpr, 0, 0, dpr, 0, 0)

  const data = new Uint8Array(node.frequencyBinCount)
  node.getByteFrequencyData(data)
  context.clearRect(0, 0, width, height)
  context.fillStyle = getComputedStyle(canvas).color || '#888'

  const barCount = 32
  // Speech energy sits in the lower frequencies, so sample only those bins —
  // otherwise the right-hand bars barely move and the meter looks dead.
  const usableBins = Math.min(data.length, 48)
  const slot = width / barCount
  const barWidth = slot * 0.5
  const radius = barWidth / 2
  const mid = height / 2

  for (let i = 0; i < barCount; i++) {
    const level = data[Math.floor((i / barCount) * usableBins)] / 255
    // Idle bars collapse to a dot (height = width); voice grows them from
    // the centre line for a symmetric, modern look.
    const barHeight = Math.max(barWidth, level * height)
    const x = i * slot + (slot - barWidth) / 2
    const y = mid - barHeight / 2
    context.beginPath()
    if (context.roundRect) {
      context.roundRect(x, y, barWidth, barHeight, radius)
    } else {
      context.rect(x, y, barWidth, barHeight)
    }
    context.fill()
  }
  rafId = requestAnimationFrame(drawMeter)
}

const startMeter = () => {
  if (rafId == null) rafId = requestAnimationFrame(drawMeter)
}

const stopMeter = () => {
  if (rafId != null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

watch(analyser, node => (node ? startMeter() : stopMeter()))

onMounted(() => {
  if (props.mode === 'audio') loadDevices()
})

onBeforeUnmount(stopMeter)
</script>

<style lang="scss" scoped>
.recorder-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  margin: 1em 0;
  padding: 1em;
}

.recorder-start,
.recorder-sources {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.recorder-start {
  align-items: center;
  justify-content: flex-start;
}

.mic-select {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  max-width: 16em;
  padding: 0.35em 0.5em;
}

.recorder-start .button,
.recorder-sources .button,
.recorder-controls .button {
  align-items: center;
  display: inline-flex;
  gap: 0.4em;
}

.recorder-preview {
  width: 100%;
  border-radius: 6px;
  background: #000;
}

.recorder-meter {
  background: var(--background-alt, rgba(127, 127, 127, 0.08));
  border-radius: 6px;
  color: var(--text);
  display: block;
  height: 48px;
  width: 100%;
  max-width: 280px;
}

.recorder-controls {
  align-items: center;
  display: flex;
  gap: 0.75em;
  margin-top: 0.75em;
}

.recorder-timer {
  align-items: center;
  display: inline-flex;
  font-variant-numeric: tabular-nums;
  gap: 0.4em;
}

.recorder-dot {
  background: $red;
  border-radius: 50%;
  height: 0.6em;
  width: 0.6em;
}

.recorder-error {
  color: $red;
}
</style>

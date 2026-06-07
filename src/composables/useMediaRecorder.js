import { getCurrentInstance, onBeforeUnmount, ref, shallowRef } from 'vue'

import { audioBufferToMono, encodeWav } from '@/lib/audio'

const VIDEO_TYPES = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
const AUDIO_TYPES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']

// Audio notes are delivered as mono WAV at this rate.
const WAV_SAMPLE_RATE = 44100

const extensionForType = type => (type.includes('mp4') ? 'mp4' : 'webm')

const createAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  return new AudioCtx({ sampleRate: WAV_SAMPLE_RATE })
}

// Decode a recorded audio blob to PCM and re-encode it as a real .wav File.
// Falls back to the original blob if the browser cannot decode it.
const blobToWavFile = async (blob, baseName) => {
  const ctx = createAudioContext()
  try {
    const audioBuffer = await ctx.decodeAudioData(await blob.arrayBuffer())
    const wav = encodeWav(
      audioBufferToMono(audioBuffer),
      audioBuffer.sampleRate
    )
    return new File([wav], `${baseName}.wav`, { type: 'audio/wav' })
  } catch (err) {
    console.error(err)
    return new File([blob], `${baseName}.webm`, { type: blob.type })
  } finally {
    ctx.close()
  }
}

const pickMimeType = source => {
  const candidates = source === 'audio' ? AUDIO_TYPES : VIDEO_TYPES
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return ''
  }
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || ''
}

const normalizeError = err => {
  if (err?.name === 'NotAllowedError') return 'permission_denied'
  if (err?.name === 'NotFoundError') return 'no_device'
  if (err?.name === 'AbortError') return 'aborted'
  return 'not_supported'
}

export const useMediaRecorder = () => {
  // State
  const status = ref('idle') // 'idle' | 'requesting' | 'recording' | 'error'
  const elapsed = ref(0)
  // Native media objects are held in shallowRefs so Vue doesn't wrap them in a
  // reactive Proxy (which breaks video.srcObject and AnalyserNode calls).
  const previewStream = shallowRef(null)
  // AnalyserNode driving the audio level meter (null unless recording audio).
  const analyser = shallowRef(null)
  const error = ref(null)

  const isSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof MediaRecorder !== 'undefined'

  let recorder = null
  let chunks = []
  let streams = [] // every stream we opened, so we can release every track
  let timer = null
  let counter = 0
  let generation = 0
  let audioContext = null // analyser context, live during audio recording

  // Functions
  const stopTracks = () => {
    streams.forEach(stream => stream.getTracks().forEach(track => track.stop()))
    streams = []
    previewStream.value = null
  }

  // Tap the mic stream with an analyser so the panel can draw a level meter.
  const openAudioAnalysis = stream => {
    // Native sample rate: forcing one makes Firefox's source node go silent.
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    audioContext = new AudioCtx()
    // Created after the getUserMedia await, so autoplay policy may leave it
    // suspended; resume it or the analyser stays frozen at zero.
    audioContext.resume?.().catch(() => {})
    const sourceNode = audioContext.createMediaStreamSource(stream)
    const analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 256
    sourceNode.connect(analyserNode)
    analyser.value = analyserNode
  }

  const closeAudioAnalysis = () => {
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
    analyser.value = null
  }

  // List the available microphones. Labels are hidden until mic permission is
  // granted, so probe once with getUserMedia to unlock them.
  const listAudioInputs = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return []
    try {
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true })
      probe.getTracks().forEach(track => track.stop())
    } catch {
      // permission denied / no device — return whatever we can enumerate
    }
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter(device => device.kind === 'audioinput')
      .map(device => ({ deviceId: device.deviceId, label: device.label }))
  }

  const clearTimer = () => {
    if (timer) clearInterval(timer)
    timer = null
  }

  const buildStream = async (source, deviceId) => {
    if (source === 'audio') {
      const audio = deviceId ? { deviceId: { exact: deviceId } } : true
      const stream = await navigator.mediaDevices.getUserMedia({ audio })
      streams.push(stream)
      return stream
    }
    if (source === 'webcam') {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
      streams.push(stream)
      return stream
    }
    // screen: display video + microphone audio merged into one stream
    const display = await navigator.mediaDevices.getDisplayMedia({
      video: true
    })
    streams.push(display)
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
    streams.push(mic)
    return new MediaStream([
      ...display.getVideoTracks(),
      ...mic.getAudioTracks()
    ])
  }

  const start = async (source, deviceId) => {
    if (!isSupported) {
      error.value = 'not_supported'
      status.value = 'error'
      return
    }
    const myGeneration = ++generation
    error.value = null
    status.value = 'requesting'
    try {
      const stream = await buildStream(source, deviceId)
      if (myGeneration !== generation) {
        stopTracks()
        return
      }
      previewStream.value = stream
      if (source === 'audio') openAudioAnalysis(stream)
      const mimeType = pickMimeType(source)
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunks = []
      recorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) chunks.push(event.data)
      }
      recorder.start()
      status.value = 'recording'
      elapsed.value = 0
      timer = setInterval(() => {
        elapsed.value += 1
      }, 1000)
    } catch (err) {
      stopTracks()
      closeAudioAnalysis()
      error.value = normalizeError(err)
      // A cancelled screen-picker is not a hard error: return to idle.
      status.value = error.value === 'aborted' ? 'idle' : 'error'
    }
  }

  const stop = () =>
    new Promise(resolve => {
      if (!recorder || status.value !== 'recording') {
        resolve(null)
        return
      }
      clearTimer()
      recorder.onstop = async () => {
        const type = recorder?.mimeType || chunks[0]?.type || ''
        const blob = new Blob(chunks, type ? { type } : undefined)
        const isAudio = type.startsWith('audio')
        counter += 1
        // Audio is re-encoded to WAV; video keeps its recorded container.
        const file = isAudio
          ? await blobToWavFile(blob, `audio-note-${counter}`)
          : new File(
              [blob],
              `video-note-${counter}.${extensionForType(type)}`,
              { type: blob.type }
            )
        stopTracks()
        closeAudioAnalysis()
        recorder = null
        status.value = 'idle'
        resolve(file)
      }
      recorder.stop()
    })

  const cancel = () => {
    generation++
    clearTimer()
    if (recorder && status.value === 'recording') {
      recorder.onstop = null
      try {
        recorder.stop()
      } catch {
        // already stopped — ignore
      }
    }
    stopTracks()
    closeAudioAnalysis()
    recorder = null
    chunks = []
    status.value = 'idle'
  }

  // Lifecycle (guarded so the composable is callable from tests too)
  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      generation++
      clearTimer()
      stopTracks()
      closeAudioAnalysis()
    })
  }

  return {
    status,
    elapsed,
    previewStream,
    analyser,
    error,
    isSupported,
    listAudioInputs,
    start,
    stop,
    cancel
  }
}

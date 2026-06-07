/*
 * Audio helpers for in-browser recording: turn captured PCM into a real
 * .wav file. MediaRecorder cannot emit wav, so we decode the recorded blob
 * to PCM elsewhere and encode it here.
 */

const writeString = (view, offset, str) => {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

// Encode mono PCM samples (Float32 in [-1, 1]) as a 16-bit WAV ArrayBuffer.
export const encodeWavBuffer = (samples, sampleRate) => {
  const dataSize = samples.length * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // audio format = PCM
  view.setUint16(22, 1, true) // channels = mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate (mono, 2 bytes/sample)
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return buffer
}

// Same as encodeWavBuffer but wrapped in an audio/wav Blob.
export const encodeWav = (samples, sampleRate) =>
  new Blob([encodeWavBuffer(samples, sampleRate)], { type: 'audio/wav' })

// Downmix an AudioBuffer to a single mono Float32Array.
export const audioBufferToMono = audioBuffer => {
  const channels = audioBuffer.numberOfChannels
  if (channels === 1) return audioBuffer.getChannelData(0)
  const length = audioBuffer.length
  const mono = new Float32Array(length)
  for (let c = 0; c < channels; c++) {
    const data = audioBuffer.getChannelData(c)
    for (let i = 0; i < length; i++) mono[i] += data[i] / channels
  }
  return mono
}

export default { encodeWav, encodeWavBuffer, audioBufferToMono }

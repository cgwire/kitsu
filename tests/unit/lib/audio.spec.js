import { audioBufferToMono, encodeWav, encodeWavBuffer } from '@/lib/audio'

const readString = (view, offset, length) => {
  let s = ''
  for (let i = 0; i < length; i++) s += String.fromCharCode(view.getUint8(offset + i))
  return s
}

describe('lib/audio', () => {
  describe('encodeWavBuffer', () => {
    it('writes a valid 16-bit mono PCM WAV header', () => {
      const samples = new Float32Array([0, 0.5, -0.5, 1])
      const buffer = encodeWavBuffer(samples, 44100)
      const view = new DataView(buffer)

      // Total size = 44-byte header + 2 bytes per sample.
      expect(buffer.byteLength).toBe(44 + samples.length * 2)

      expect(readString(view, 0, 4)).toBe('RIFF')
      expect(view.getUint32(4, true)).toBe(36 + samples.length * 2)
      expect(readString(view, 8, 4)).toBe('WAVE')
      expect(readString(view, 12, 4)).toBe('fmt ')
      expect(view.getUint16(20, true)).toBe(1) // PCM
      expect(view.getUint16(22, true)).toBe(1) // mono
      expect(view.getUint32(24, true)).toBe(44100) // sample rate
      expect(view.getUint16(32, true)).toBe(2) // block align (mono, 16-bit)
      expect(view.getUint16(34, true)).toBe(16) // bits per sample
      expect(readString(view, 36, 4)).toBe('data')
      expect(view.getUint32(40, true)).toBe(samples.length * 2)
    })

    it('clamps and converts samples to signed 16-bit', () => {
      const samples = new Float32Array([0, 1, -1, 2, -2])
      const view = new DataView(encodeWavBuffer(samples, 16000))
      expect(view.getInt16(44, true)).toBe(0)
      expect(view.getInt16(46, true)).toBe(32767) // +1 -> max
      expect(view.getInt16(48, true)).toBe(-32768) // -1 -> min
      expect(view.getInt16(50, true)).toBe(32767) // +2 clamped to +1
      expect(view.getInt16(52, true)).toBe(-32768) // -2 clamped to -1
    })
  })

  describe('encodeWav', () => {
    it('returns an audio/wav Blob of the right size', () => {
      const blob = encodeWav(new Float32Array([0, 0.25, -0.25]), 44100)
      expect(blob.type).toBe('audio/wav')
      expect(blob.size).toBe(44 + 3 * 2)
    })
  })

  describe('audioBufferToMono', () => {
    it('returns the single channel unchanged for mono input', () => {
      const channel = new Float32Array([0.1, 0.2, 0.3])
      const audioBuffer = {
        numberOfChannels: 1,
        length: 3,
        getChannelData: () => channel
      }
      expect(audioBufferToMono(audioBuffer)).toBe(channel)
    })

    it('averages channels for stereo input', () => {
      const left = new Float32Array([1, 0, -1])
      const right = new Float32Array([0, 0, 1])
      const audioBuffer = {
        numberOfChannels: 2,
        length: 3,
        getChannelData: index => (index === 0 ? left : right)
      }
      const mono = audioBufferToMono(audioBuffer)
      expect(Array.from(mono)).toEqual([0.5, 0, 0])
    })
  })
})

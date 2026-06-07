import { useMediaRecorder } from '@/composables/useMediaRecorder'

// Minimal fakes for the browser media APIs absent from jsdom.
const makeTrack = () => ({ stop: vi.fn(), kind: 'audio' })

const makeStream = (tracks = [makeTrack()]) => ({
  getTracks: () => tracks,
  getAudioTracks: () => tracks.filter(t => t.kind === 'audio'),
  getVideoTracks: () => tracks.filter(t => t.kind === 'video')
})

const setupMediaApis = ({
  getUserMedia,
  getDisplayMedia,
  enumerateDevices
} = {}) => {
  const RecorderMock = vi.fn(function (stream, options) {
    this.stream = stream
    this.mimeType = options?.mimeType || 'audio/webm'
    this.ondataavailable = null
    this.onstop = null
    this.start = vi.fn()
    this.stop = vi.fn(() => {
      this.ondataavailable?.({ data: new Blob(['x'], { type: this.mimeType }) })
      this.onstop?.()
    })
  })
  RecorderMock.isTypeSupported = vi.fn(() => true)
  Object.defineProperty(window, 'MediaRecorder', {
    value: RecorderMock,
    writable: true,
    configurable: true
  })
  Object.defineProperty(window, 'MediaStream', {
    value: vi.fn(function (tracks = []) {
      this._tracks = tracks
      this.getTracks = () => tracks
    }),
    writable: true,
    configurable: true
  })
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: getUserMedia || vi.fn(async () => makeStream()),
      getDisplayMedia:
        getDisplayMedia ||
        vi.fn(async () => makeStream([{ stop: vi.fn(), kind: 'video' }])),
      enumerateDevices: enumerateDevices || vi.fn(async () => [])
    },
    writable: true,
    configurable: true
  })
  return RecorderMock
}

// Fake Web Audio so the audio→WAV decode path runs in jsdom.
const setupAudioContext = () => {
  const audioBuffer = {
    numberOfChannels: 1,
    length: 4,
    sampleRate: 44100,
    getChannelData: () => new Float32Array([0, 0.5, -0.5, 0.25])
  }
  const decodeAudioData = vi.fn(async () => audioBuffer)
  const close = vi.fn()
  const resume = vi.fn(() => Promise.resolve())
  const analyserNode = {
    fftSize: 0,
    frequencyBinCount: 128,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn()
  }
  Object.defineProperty(window, 'AudioContext', {
    value: vi.fn(function () {
      this.sampleRate = 44100
      this.decodeAudioData = decodeAudioData
      this.close = close
      this.resume = resume
      this.createMediaStreamSource = vi.fn(() => ({ connect: vi.fn() }))
      this.createAnalyser = vi.fn(() => analyserNode)
    }),
    writable: true,
    configurable: true
  })
  return { decodeAudioData, close, resume, analyserNode }
}

describe('composables/useMediaRecorder', () => {
  beforeEach(() => {
    delete window.MediaRecorder
    delete window.MediaStream
    delete window.AudioContext
    delete navigator.mediaDevices
  })

  it('reports unsupported when the APIs are missing', () => {
    const { isSupported } = useMediaRecorder()
    expect(isSupported).toBe(false)
  })

  it('start(audio) moves to recording and opens the mic', async () => {
    const getUserMedia = vi.fn(async () => makeStream())
    setupMediaApis({ getUserMedia })
    setupAudioContext()
    const { start, status } = useMediaRecorder()
    await start('audio')
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(status.value).toBe('recording')
  })

  it('exposes an analyser and resumes the context while recording audio', async () => {
    setupMediaApis({ getUserMedia: vi.fn(async () => makeStream()) })
    const audio = setupAudioContext()
    const { start, analyser } = useMediaRecorder()
    await start('audio')
    expect(analyser.value).toBe(audio.analyserNode)
    // Without resume() the suspended context leaves the meter frozen.
    expect(audio.resume).toHaveBeenCalled()
  })

  it('stop() returns a WAV File for audio and stops tracks', async () => {
    const track = makeTrack()
    setupMediaApis({ getUserMedia: vi.fn(async () => makeStream([track])) })
    const audio = setupAudioContext()
    const { start, stop } = useMediaRecorder()
    await start('audio')
    const file = await stop()
    expect(file).toBeInstanceOf(File)
    expect(file.type).toBe('audio/wav')
    expect(file.name).toMatch(/\.wav$/)
    expect(audio.decodeAudioData).toHaveBeenCalled()
    expect(track.stop).toHaveBeenCalled()
  })

  it('start(audio, deviceId) constrains getUserMedia to that microphone', async () => {
    const getUserMedia = vi.fn(async () => makeStream())
    setupMediaApis({ getUserMedia })
    setupAudioContext()
    const { start } = useMediaRecorder()
    await start('audio', 'mic-123')
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: { deviceId: { exact: 'mic-123' } }
    })
  })

  it('listAudioInputs returns only audio inputs, probing to unlock labels', async () => {
    const probeStop = vi.fn()
    const getUserMedia = vi.fn(async () =>
      makeStream([{ stop: probeStop, kind: 'audio' }])
    )
    const enumerateDevices = vi.fn(async () => [
      { kind: 'audioinput', deviceId: 'mic', label: 'My Mic' },
      { kind: 'audiooutput', deviceId: 'spk', label: 'Speakers' },
      { kind: 'videoinput', deviceId: 'cam', label: 'Cam' }
    ])
    setupMediaApis({ getUserMedia, enumerateDevices })
    const { listAudioInputs } = useMediaRecorder()
    const inputs = await listAudioInputs()
    expect(getUserMedia).toHaveBeenCalled()
    expect(probeStop).toHaveBeenCalled()
    expect(inputs).toEqual([{ deviceId: 'mic', label: 'My Mic' }])
  })

  it('screen source merges display video with the microphone track', async () => {
    const getDisplayMedia = vi.fn(async () =>
      makeStream([{ stop: vi.fn(), kind: 'video' }])
    )
    const getUserMedia = vi.fn(async () => makeStream())
    setupMediaApis({ getUserMedia, getDisplayMedia })
    const { start, status } = useMediaRecorder()
    await start('screen')
    expect(getDisplayMedia).toHaveBeenCalledWith({ video: true })
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(status.value).toBe('recording')
  })

  it('maps NotAllowedError to permission_denied and an error status', async () => {
    const err = Object.assign(new Error('no'), { name: 'NotAllowedError' })
    setupMediaApis({ getUserMedia: vi.fn(async () => { throw err }) })
    const { start, status, error } = useMediaRecorder()
    await start('audio')
    expect(error.value).toBe('permission_denied')
    expect(status.value).toBe('error')
  })

  it('cancel() stops tracks without producing a file', async () => {
    const track = makeTrack()
    setupMediaApis({ getUserMedia: vi.fn(async () => makeStream([track])) })
    const audio = setupAudioContext()
    const { start, cancel, status } = useMediaRecorder()
    await start('audio')
    cancel()
    expect(audio.close).toHaveBeenCalled() // audio context released
    expect(track.stop).toHaveBeenCalled()
    expect(status.value).toBe('idle')
  })

  it('does not start recording if cancelled while requesting permission', async () => {
    let resolveStream
    const track = makeTrack()
    const getUserMedia = vi.fn(
      () =>
        new Promise(resolve => {
          resolveStream = () => resolve(makeStream([track]))
        })
    )
    setupMediaApis({ getUserMedia })
    const { start, cancel, status } = useMediaRecorder()
    const pending = start('audio') // status -> 'requesting', awaits getUserMedia
    cancel() // user cancels before the permission resolves
    resolveStream() // permission resolves late
    await pending
    expect(status.value).toBe('idle')
    expect(track.stop).toHaveBeenCalled() // late-acquired stream is released
  })

  it('releases the display stream when the mic request fails for screen', async () => {
    const displayTrack = { stop: vi.fn(), kind: 'video' }
    const getDisplayMedia = vi.fn(async () => makeStream([displayTrack]))
    const micErr = Object.assign(new Error('no mic'), {
      name: 'NotAllowedError'
    })
    const getUserMedia = vi.fn(async () => {
      throw micErr
    })
    setupMediaApis({ getUserMedia, getDisplayMedia })
    const { start, status, error, previewStream } = useMediaRecorder()
    await start('screen')
    expect(displayTrack.stop).toHaveBeenCalled()
    expect(error.value).toBe('permission_denied')
    expect(status.value).toBe('error')
    expect(previewStream.value).toBe(null)
  })
})

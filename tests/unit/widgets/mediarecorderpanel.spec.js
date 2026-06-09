import { flushPromises, mount } from '@vue/test-utils'
import { ref, shallowRef } from 'vue'

const state = {}
vi.mock('@/composables/useMediaRecorder', () => ({
  useMediaRecorder: () => state
}))

import MediaRecorderPanel from '@/components/widgets/MediaRecorderPanel.vue'

const mountPanel = (mode = 'audio') =>
  mount(MediaRecorderPanel, {
    props: { mode },
    global: { mocks: { $t: key => key } }
  })

beforeEach(() => {
  state.status = ref('idle')
  state.elapsed = ref(0)
  state.previewStream = shallowRef(null)
  state.analyser = shallowRef(null)
  state.error = ref(null)
  state.isSupported = true
  state.listAudioInputs = vi.fn(async () => [])
  state.arm = vi.fn(async () => {
    state.status.value = 'ready'
  })
  state.record = vi.fn(() => {
    state.status.value = 'recording'
  })
  state.start = vi.fn(async () => {
    state.status.value = 'recording'
  })
  state.stop = vi.fn(
    async () => new File(['x'], 'audio-note-1.wav', { type: 'audio/wav' })
  )
  state.cancel = vi.fn()
})

describe('widgets/MediaRecorderPanel', () => {
  it('audio mode does not auto-start and shows a start button', () => {
    const wrapper = mountPanel('audio')
    expect(state.start).not.toHaveBeenCalled()
    expect(wrapper.find('.start-button').exists()).toBe(true)
  })

  it('clicking start begins audio recording with the default device', async () => {
    const wrapper = mountPanel('audio')
    await flushPromises()
    await wrapper.find('.start-button').trigger('click')
    expect(state.start).toHaveBeenCalledWith('audio', undefined)
  })

  it('lists microphones and records with the chosen device', async () => {
    state.listAudioInputs = vi.fn(async () => [
      { deviceId: 'mic-a', label: 'Mic A' },
      { deviceId: 'mic-b', label: 'Mic B' }
    ])
    const wrapper = mountPanel('audio')
    await flushPromises()
    const select = wrapper.find('.mic-select')
    expect(select.exists()).toBe(true)
    expect(select.findAll('option')).toHaveLength(2)
    await select.setValue('mic-b')
    await wrapper.find('.start-button').trigger('click')
    expect(state.start).toHaveBeenCalledWith('audio', 'mic-b')
  })

  it('video mode shows source choice before starting', () => {
    const wrapper = mountPanel('video')
    expect(state.start).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('main.recording.webcam')
    expect(wrapper.text()).toContain('main.recording.screen')
  })

  it('video arms on source choice and waits for an explicit Start', async () => {
    const wrapper = mountPanel('video')
    await wrapper.findAll('.recorder-sources button')[0].trigger('click')
    expect(state.arm).toHaveBeenCalledWith('webcam')
    expect(state.record).not.toHaveBeenCalled()
    await flushPromises()
    const startButton = wrapper.find('.start-button')
    expect(startButton.exists()).toBe(true)
    await startButton.trigger('click')
    expect(state.record).toHaveBeenCalled()
  })

  it('emits recorded(file) when stopping', async () => {
    const wrapper = mountPanel('audio')
    await wrapper.find('.start-button').trigger('click')
    await flushPromises()
    await wrapper.find('.stop-button').trigger('click')
    await flushPromises()
    expect(state.stop).toHaveBeenCalled()
    expect(wrapper.emitted('recorded')[0][0]).toBeInstanceOf(File)
  })

  it('emits cancel and calls composable cancel', async () => {
    const wrapper = mountPanel('audio')
    await wrapper.find('.cancel-button').trigger('click')
    expect(state.cancel).toHaveBeenCalled()
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})

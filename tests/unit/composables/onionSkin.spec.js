import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'

import { useOnionSkin } from '@/composables/players/onionSkin'

const ghost = id => ({ id, drawing: { objects: [] } })

const mountOnion = (overrides = {}) => {
  const isOn = overrides.isOn ?? ref(false)
  const frames = overrides.frames ?? ref(2)
  const currentFrame = overrides.currentFrame ?? ref(10)
  const nbFrames = overrides.nbFrames ?? ref(100)
  const annotations = overrides.annotations ?? ref([])
  // Annotations on frames 9 and 11 by default.
  const annotated = overrides.annotated ?? { 9: ghost('a9'), 11: ghost('a11') }
  const getAnnotationAtFrame = frame => annotated[frame] || null
  const loadOnionSkin = vi.fn()
  const clearOnionCanvas = vi.fn()

  let api
  const Comp = defineComponent({
    setup() {
      api = useOnionSkin({
        isOn,
        frames,
        currentFrame,
        nbFrames,
        annotations,
        getAnnotationAtFrame,
        loadOnionSkin,
        clearOnionCanvas
      })
      return () => null
    }
  })
  const wrapper = mount(Comp)
  return { wrapper, api, isOn, frames, currentFrame, loadOnionSkin, clearOnionCanvas }
}

describe('composables/onionSkin', () => {
  it('clears the onion canvas while disabled', () => {
    const { clearOnionCanvas, loadOnionSkin, wrapper } = mountOnion({
      isOn: ref(false)
    })
    expect(clearOnionCanvas).toHaveBeenCalled()
    expect(loadOnionSkin).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('loads ghosts (nearest first) with fading opacity when enabled', () => {
    const { loadOnionSkin, wrapper } = mountOnion({ isOn: ref(true) })
    expect(loadOnionSkin).toHaveBeenCalledTimes(1)
    const ghosts = loadOnionSkin.mock.calls.at(-1)[0]
    expect(ghosts.map(g => g.annotation.id)).toEqual(['a9', 'a11'])
    expect(ghosts.every(g => g.opacity > 0 && g.opacity <= 1)).toBe(true)
    wrapper.unmount()
  })

  it('re-renders when the current frame changes', async () => {
    const isOn = ref(true)
    const currentFrame = ref(10)
    const { loadOnionSkin, wrapper } = mountOnion({ isOn, currentFrame })
    loadOnionSkin.mockClear()
    currentFrame.value = 50
    await nextTick()
    expect(loadOnionSkin).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('clears when toggled off', async () => {
    const isOn = ref(true)
    const { clearOnionCanvas, isOn: onRef, wrapper } = mountOnion({ isOn })
    clearOnionCanvas.mockClear()
    onRef.value = false
    await nextTick()
    expect(clearOnionCanvas).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })
})

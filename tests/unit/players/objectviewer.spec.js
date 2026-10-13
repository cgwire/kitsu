import { flushPromises, mount } from '@vue/test-utils'

import ObjectViewer from '@/components/players/viewers/ObjectViewer.vue'

// The real library needs WebGL2 and a laid out page.
vi.mock('@google/model-viewer', () => ({}))

// jsdom has no WebGL2, which is exactly the Safari 14 situation: the
// viewer must show its fallback message instead of a dead canvas.
describe('players/ObjectViewer without WebGL2', () => {
  test('renders the not-supported message instead of the viewer', () => {
    const wrapper = mount(ObjectViewer)
    expect(wrapper.find('.viewer-unavailable').text()).toBe(
      'main.preview_3d_not_supported'
    )
    expect(wrapper.find('model-viewer').exists()).toBe(false)
  })

  test('exposed playback methods are null-safe without a viewer', () => {
    const wrapper = mount(ObjectViewer)
    expect(wrapper.vm.getAnimations()).toEqual([])
    expect(() => {
      wrapper.vm.play('walk')
      wrapper.vm.pause()
    }).not.toThrow()
  })
})

describe('players/ObjectViewer once closed', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // The viewer loads its library on mount, and can close before it arrives.
  test('listens to no window move once closed during the library load', async () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const wrapper = mount(ObjectViewer)
    wrapper.unmount()
    addListener.mockClear()

    await flushPromises()

    expect(addListener.mock.calls.map(([type]) => type)).not.toContain(
      'mousemove'
    )
  })

  // The load event of the library carries the model on its target.
  const loadModel = viewer => {
    const model = {
      materials: [{}],
      createMaterialInstanceForVariant: vi.fn(() => null)
    }
    Object.defineProperty(viewer, 'model', { configurable: true, value: model })
    viewer.dispatchEvent(new Event('load'))
    return model
  }

  test('builds the wireframe variant of a loaded model', async () => {
    const wrapper = mount(ObjectViewer)
    await flushPromises()

    const model = loadModel(wrapper.find('model-viewer').element)

    expect(model.createMaterialInstanceForVariant).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('model-loaded')).toHaveLength(1)
    wrapper.unmount()
  })

  // The model can finish loading right after the viewer closed.
  test('ignores a model loaded once closed', async () => {
    const wrapper = mount(ObjectViewer)
    await flushPromises()
    const viewer = wrapper.find('model-viewer').element
    wrapper.unmount()

    const model = loadModel(viewer)

    expect(model.createMaterialInstanceForVariant).not.toHaveBeenCalled()
    expect(wrapper.emitted('model-loaded')).toBeUndefined()
  })
})

import { flushPromises, mount } from '@vue/test-utils'

const previewUrl = '/api/pictures/originals/preview-files/model-1/download'
const loadLibrary = vi.fn()

// The viewer keeps its WebGL2 verdict for the page's life: each test imports
// it afresh.
let ObjectViewer

beforeEach(async () => {
  loadLibrary.mockClear()
  vi.resetModules()
  // The real library needs WebGL2 and a laid out page. The mock defines no
  // element: the viewer stays a plain one, as while the real library loads.
  // A hoisted vi.mock() would run its factory once per file, not per test.
  // Two imports of it in flight at once leave the next test with the real
  // library: let one viewer load before mounting another.
  vi.doMock('@google/model-viewer', () => {
    loadLibrary()
    return {}
  })
  ;({ default: ObjectViewer } = await import(
    '@/components/players/viewers/ObjectViewer.vue'
  ))
})

// jsdom has no WebGL2, which is exactly the Safari 14 situation: the
// viewer must show its fallback message instead of a dead canvas.
describe('players/ObjectViewer without WebGL2', () => {
  test('renders the not-supported message instead of the viewer', async () => {
    const wrapper = mount(ObjectViewer, { props: { previewUrl } })
    await flushPromises()

    expect(wrapper.find('.viewer-unavailable').text()).toBe(
      'main.preview_3d_not_supported'
    )
    expect(wrapper.find('model-viewer').exists()).toBe(false)
    expect(loadLibrary).not.toHaveBeenCalled()
  })

  test('exposed playback methods are null-safe without a viewer', async () => {
    const wrapper = mount(ObjectViewer, { props: { previewUrl } })
    await flushPromises()

    expect(wrapper.vm.getAnimations()).toEqual([])
    expect(() => {
      wrapper.vm.play('walk')
      wrapper.vm.pause()
    }).not.toThrow()
  })
})

describe('players/ObjectViewer with WebGL2', () => {
  let getContext

  beforeEach(() => {
    getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ getExtension: () => null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const listenedWindowEvents = addListener =>
    addListener.mock.calls.map(([type]) => type)

  // A playlist keeps the viewer mounted, hidden, while it shows a movie.
  test('opens no WebGL context and loads no library until a model', async () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const wrapper = mount(ObjectViewer, { props: { previewUrl: null } })
    await flushPromises()

    expect(getContext).not.toHaveBeenCalled()
    expect(loadLibrary).not.toHaveBeenCalled()
    expect(listenedWindowEvents(addListener)).not.toContain('mousemove')

    await wrapper.setProps({ previewUrl })
    await flushPromises()

    expect(getContext).toHaveBeenCalledTimes(1)
    expect(loadLibrary).toHaveBeenCalledTimes(1)
    expect(listenedWindowEvents(addListener)).toContain('mousemove')
    wrapper.unmount()
  })

  test('probes WebGL2 once per page', async () => {
    const first = mount(ObjectViewer, { props: { previewUrl } })
    await flushPromises()
    const second = mount(ObjectViewer, { props: { previewUrl } })
    await flushPromises()

    expect(getContext).toHaveBeenCalledTimes(1)
    expect(second.find('model-viewer').exists()).toBe(true)
    first.unmount()
    second.unmount()
  })

  // Until the library defines the element, it has none of its methods.
  test('waits for the library to play or pause', async () => {
    const wrapper = mount(ObjectViewer, { props: { previewUrl } })
    await flushPromises()

    expect(() => {
      wrapper.vm.play('walk')
      wrapper.vm.pause()
    }).not.toThrow()
    wrapper.unmount()
  })

  // The viewer loads its library for a model, and can close before it arrives.
  test('listens to no window move once closed during the library load', async () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const wrapper = mount(ObjectViewer, { props: { previewUrl } })
    wrapper.unmount()
    addListener.mockClear()

    await flushPromises()

    expect(listenedWindowEvents(addListener)).not.toContain('mousemove')
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
    const wrapper = mount(ObjectViewer, { props: { previewUrl } })
    await flushPromises()

    const model = loadModel(wrapper.find('model-viewer').element)

    expect(model.createMaterialInstanceForVariant).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('model-loaded')).toHaveLength(1)
    wrapper.unmount()
  })

  // The model can finish loading right after the viewer closed.
  test('ignores a model loaded once closed', async () => {
    const wrapper = mount(ObjectViewer, { props: { previewUrl } })
    await flushPromises()
    const viewer = wrapper.find('model-viewer').element
    wrapper.unmount()

    const model = loadModel(viewer)

    expect(model.createMaterialInstanceForVariant).not.toHaveBeenCalled()
    expect(wrapper.emitted('model-loaded')).toBeUndefined()
  })
})

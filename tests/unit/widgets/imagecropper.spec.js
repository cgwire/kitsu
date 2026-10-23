import { Buffer } from 'node:buffer'

import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'

import ImageCropper from '@/components/widgets/ImageCropper.vue'

// jsdom 30 pulls the optional `canvas` package, so getContext('2d') and
// toBlob() are the real node-canvas ones. drawImage still rejects a jsdom
// <img> (nothing ever loads its src), so each test replaces just that call.

const selectFile = async (wrapper, file, size = {}) => {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    configurable: true,
    value: [file]
  })
  await input.trigger('change')
  const img = wrapper.find('img.cropper-image')
  Object.defineProperty(img.element, 'naturalWidth', {
    configurable: true,
    value: size.width || 800
  })
  Object.defineProperty(img.element, 'naturalHeight', {
    configurable: true,
    value: size.height || 600
  })
  await img.trigger('load')
  await nextTick()
}

// Where the thumb sits on its track, 0 (left) to 1 (right), read off the DOM
// the way the user sees it rather than off the model behind it.
const sliderPosition = wrapper => {
  const slider = wrapper.find('input.zoom-slider').element
  const min = Number(slider.min)
  const max = Number(slider.max)
  return (Number(slider.value) - min) / (max - min)
}

const imageWidth = wrapper =>
  parseFloat(wrapper.find('img.cropper-image').element.style.width)

// Swap the off-screen canvas for a probe that records the requested mime type
// and hands back a single pixel, opaque or not, as the cropped bitmap.
const useCanvasProbe = ({ opaque } = { opaque: true }) => {
  const probe = { toBlob: vi.fn((cb, type) => cb(new Blob(['x'], { type }))) }
  const createElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag, ...rest) => {
    if (tag !== 'canvas') return createElement(tag, ...rest)
    return Object.assign(probe, {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: vi.fn(),
        getImageData: () => ({
          data: new Uint8ClampedArray([0, 0, 0, opaque ? 255 : 0])
        })
      })
    })
  })
  return probe
}

describe('ImageCropper crop output type', () => {
  let wrapper

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:logo')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports a crop that carries alpha as PNG', async () => {
    const probe = useCanvasProbe({ opaque: false })
    wrapper = shallowMount(ImageCropper)
    await selectFile(
      wrapper,
      new File([new Blob(['png'])], 'logo.png', { type: 'image/png' })
    )

    const data = await wrapper.vm.cropToFormData()

    expect(probe.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/png',
      expect.any(Number)
    )
    expect(data.get('file').type).toBe('image/png')
    expect(data.get('file').name).toBe('logo.png')
  })

  // The file input filters on extensions, but a drag and drop accepts any
  // image/*, so the decision cannot key on the source container.
  it('exports a dropped SVG logo as PNG too', async () => {
    const probe = useCanvasProbe({ opaque: false })
    wrapper = shallowMount(ImageCropper)
    await selectFile(
      wrapper,
      new File([new Blob(['svg'])], 'logo.svg', { type: 'image/svg+xml' })
    )

    const data = await wrapper.vm.cropToFormData()

    expect(probe.toBlob.mock.calls[0][1]).toBe('image/png')
    expect(data.get('file').name).toBe('logo.png')
  })

  it('keeps an opaque crop on JPEG', async () => {
    const probe = useCanvasProbe({ opaque: true })
    wrapper = shallowMount(ImageCropper)
    await selectFile(
      wrapper,
      new File([new Blob(['jpg'])], 'photo.jpg', { type: 'image/jpeg' })
    )

    const data = await wrapper.vm.cropToFormData()

    expect(probe.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.92
    )
    expect(data.get('file').name).toBe('photo.jpg')
  })

  it('an explicit outputType prop still wins over the pixels', async () => {
    const probe = useCanvasProbe({ opaque: false })
    wrapper = shallowMount(ImageCropper, { props: { outputType: 'image/jpeg' } })
    await selectFile(
      wrapper,
      new File([new Blob(['png'])], 'logo.png', { type: 'image/png' })
    )

    const data = await wrapper.vm.cropToFormData()

    expect(probe.toBlob.mock.calls[0][1]).toBe('image/jpeg')
    expect(data.get('file').name).toBe('logo.jpg')
  })

  // End-to-end on the real encoder: the exported bytes must still carry alpha.
  it('keeps transparent pixels transparent in the exported file', async () => {
    const getContext = HTMLCanvasElement.prototype.getContext
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      function (type, options) {
        const ctx = getContext.call(this, type, options)
        // Stand-in for the unloadable <img>: one opaque quadrant, rest clear.
        ctx.drawImage = () => {
          ctx.clearRect(0, 0, this.width, this.height)
          ctx.fillStyle = 'rgba(0, 128, 255, 1)'
          ctx.fillRect(0, 0, this.width / 2, this.height / 2)
        }
        return ctx
      }
    )
    wrapper = shallowMount(ImageCropper, { props: { outputSize: 16 } })
    await selectFile(
      wrapper,
      new File([new Blob(['png'])], 'logo.png', { type: 'image/png' })
    )

    const file = (await wrapper.vm.cropToFormData()).get('file')
    vi.restoreAllMocks()

    const bytes = Buffer.from(await file.arrayBuffer())
    expect(file.type).toBe('image/png')
    expect(Array.from(bytes.slice(0, 4))).toEqual([137, 80, 78, 71]) // PNG magic

    const { createCanvas, loadImage } = await import('canvas')
    const decoded = createCanvas(16, 16)
    const context = decoded.getContext('2d')
    context.drawImage(await loadImage(bytes), 0, 0)
    expect(context.getImageData(15, 15, 1, 1).data[3]).toBe(0)
    expect(Array.from(context.getImageData(0, 0, 1, 1).data)).toEqual([
      0, 128, 255, 255
    ])
  })
})

describe('ImageCropper zoom slider', () => {
  let wrapper

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:logo')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const logo = () =>
    new File([new Blob(['png'])], 'logo.png', { type: 'image/png' })

  it('starts the thumb at the left when an image loads', async () => {
    wrapper = shallowMount(ImageCropper)

    await selectFile(wrapper, logo(), { width: 1600, height: 1200 })

    expect(imageWidth(wrapper)).toBe(240) // 1600 * (180 / 1200), the fit scale
    expect(sliderPosition(wrapper)).toBe(0)
    // Centered in the frame: 240px wide behind a 180px window.
    expect(wrapper.find('img.cropper-image').element.style.transform).toBe(
      'translate(-30px, 0px)'
    )
  })

  it('drives the zoom up to four times the fit scale', async () => {
    wrapper = shallowMount(ImageCropper)
    await selectFile(wrapper, logo(), { width: 1600, height: 1200 })

    const slider = wrapper.find('input.zoom-slider')
    await slider.setValue(slider.element.max)

    expect(imageWidth(wrapper)).toBe(960)
    expect(sliderPosition(wrapper)).toBe(1)
  })

  it('brings the thumb back to the left on the next image', async () => {
    wrapper = shallowMount(ImageCropper)
    await selectFile(wrapper, logo(), { width: 1600, height: 1200 })
    const slider = wrapper.find('input.zoom-slider')
    await slider.setValue(slider.element.max)

    wrapper.vm.reset()
    await nextTick()
    await selectFile(wrapper, logo(), { width: 1600, height: 1200 })

    expect(imageWidth(wrapper)).toBe(240)
    expect(sliderPosition(wrapper)).toBe(0)
  })
})

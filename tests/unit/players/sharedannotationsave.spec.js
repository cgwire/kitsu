import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createStore } from 'vuex'

import playlistStore from '@/store/modules/playlists'

import SharedAnnotationOverlay from '@/components/players/annotations/SharedAnnotationOverlay.vue'

const pput = vi.fn()

vi.mock('@/store/api/client', () => ({
  default: { pput: (...args) => pput(...args) }
}))

const FIRST = [
  [10, 20],
  [30, 40],
  [50, 60]
]

const SECOND = [
  [60, 10],
  [40, 30],
  [20, 50]
]

const THIRD = [
  [15, 55],
  [35, 25],
  [55, 45]
]

// Keeps each save waiting until the test answers it. The body is copied as
// it is sent, the way the request serializes it.
const holdRequests = () => {
  const requests = []
  pput.mockImplementation(
    (path, body) =>
      new Promise((resolve, reject) => {
        requests.push({
          path,
          body: JSON.parse(JSON.stringify(body)),
          resolve,
          reject
        })
      })
  )
  return requests
}

// fabric listens to mouse events or to pointer events, depending on its
// enablePointerEvents option: each step sends both, and fabric takes one.
const send = (target, step, [x, y]) => {
  const isUp = step === 'up'
  const init = {
    bubbles: true,
    cancelable: true,
    button: 0,
    buttons: isUp ? 0 : 1,
    clientX: x,
    clientY: y
  }
  target.dispatchEvent(
    new PointerEvent(`pointer${step}`, {
      ...init,
      isPrimary: true,
      pointerId: 1,
      pointerType: 'mouse',
      pressure: isUp ? 0 : 0.5
    })
  )
  target.dispatchEvent(new MouseEvent(`mouse${step}`, init))
}

const objectIds = additions =>
  additions.flatMap(entry => entry.drawing.objects.map(({ id }) => id))

describe('players/SharedAnnotationOverlay saves', () => {
  let wrapper = null

  // The canvas is found by its id: the overlay must be in the document.
  const mountOverlay = (props = {}) => {
    wrapper = mount(SharedAnnotationOverlay, {
      attachTo: document.body,
      props: {
        guestId: 'guest-1',
        isEditable: true,
        isPicture: true,
        movieDimensions: { width: 400, height: 300 },
        previewFileId: 'preview-1',
        token: 'token-1',
        ...props
      },
      global: {
        plugins: [createStore({ modules: { playlists: playlistStore } })]
      }
    })
  }

  // Once a button is down, fabric listens on the document: the events
  // bubble there since the overlay is attached. The toolbar follows the
  // stroke on the next render.
  const draw = async points => {
    const canvas = wrapper.find('.upper-canvas').element
    send(canvas, 'down', points[0])
    points.slice(1).forEach(point => send(canvas, 'move', point))
    send(canvas, 'up', points.at(-1))
    await nextTick()
  }

  const saveButton = () => wrapper.find('.annotation-tool.primary')
  const save = () => saveButton().trigger('click')
  const pendingIds = () => objectIds(wrapper.vm.getDiff().additions)

  // Changes the file id alone, where the player also hands a new annotations
  // array: the file id has to redraw on its own. A movie keeps its
  // dimensions until the next one loads.
  const showFile = async previewFileId => {
    await wrapper.setProps({ previewFileId })
    await flushPromises()
  }

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    pput.mockReset()
    vi.restoreAllMocks()
  })

  it('keeps a stroke drawn on the saved frame while the save runs', async () => {
    const requests = holdRequests()
    mountOverlay()
    await draw(FIRST)
    const [first] = pendingIds()

    await save()
    expect(requests).toHaveLength(1)
    expect(requests[0].path).toBe('/api/shared/playlists/token-1/annotations')
    expect(requests[0].body).toMatchObject({
      guest_id: 'guest-1',
      preview_file_id: 'preview-1'
    })
    expect(objectIds(requests[0].body.additions)).toEqual([first])
    expect(saveButton().element.disabled).toBe(true)

    await draw(SECOND)
    const [, second] = pendingIds()
    expect(second).toEqual(expect.any(String))

    const saved = requests[0].body.additions
    requests[0].resolve({ id: 'preview-1', annotations: saved })
    await flushPromises()

    expect(wrapper.emitted('saved')).toEqual([[saved, 'preview-1']])
    expect(pendingIds()).toEqual([second])
    expect(saveButton().element.disabled).toBe(false)

    // The player hands the saved annotations back, and the overlay redraws.
    await wrapper.setProps({ annotations: saved })
    await flushPromises()
    expect(pendingIds()).toEqual([second])

    await save()
    expect(requests).toHaveLength(2)
    expect(objectIds(requests[1].body.additions)).toEqual([second])
  })

  // On a picture, the player hands back the saved annotations and new
  // dimensions, of the same values: two redraws start in the same tick.
  it('keeps a stroke drawn while a picture saves through the two redraws after it', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300
    })
    const requests = holdRequests()
    mountOverlay()
    await draw(FIRST)
    await save()
    await draw(SECOND)
    const [, second] = pendingIds()

    const saved = requests[0].body.additions
    requests[0].resolve({ id: 'preview-1', annotations: saved })
    await flushPromises()
    await wrapper.setProps({
      annotations: saved,
      movieDimensions: { width: 400, height: 300 }
    })
    await flushPromises()

    expect(pendingIds()).toEqual([second])
    expect(saveButton().element.disabled).toBe(false)

    await save()
    expect(requests).toHaveLength(2)
    expect(objectIds(requests[1].body.additions)).toEqual([second])
  })

  it('keeps a stroke drawn on another frame of a movie while the save runs', async () => {
    const requests = holdRequests()
    mountOverlay({ isPicture: false })
    await draw(FIRST)
    const [first] = pendingIds()

    await save()
    expect(objectIds(requests[0].body.additions)).toEqual([first])

    await wrapper.setProps({ currentFrame: 5 })
    await flushPromises()
    await draw(SECOND)
    const second = pendingIds().at(-1)
    expect(second).not.toBe(first)

    requests[0].resolve({
      id: 'preview-1',
      annotations: requests[0].body.additions
    })
    await flushPromises()

    expect(pendingIds()).toEqual([second])
    expect(wrapper.vm.getDiff().additions).toEqual([
      expect.objectContaining({ time: 0.2, frame: 5 })
    ])
    expect(saveButton().element.disabled).toBe(false)

    await save()
    expect(requests).toHaveLength(2)
    expect(objectIds(requests[1].body.additions)).toEqual([second])
    expect(requests[1].body.additions[0]).toMatchObject({ time: 0.2, frame: 5 })
  })

  // A redraw during the save rebuilds the pending objects as new instances:
  // the answer still takes out the rectangle sent, and the stroke drawn
  // after the redraw stays pending.
  it('keeps a stroke drawn after a redraw during the save', async () => {
    const requests = holdRequests()
    mountOverlay()
    await wrapper.find('button[title="Rectangle"]').trigger('click')
    await draw(FIRST)
    const [first] = pendingIds()

    await save()
    expect(objectIds(requests[0].body.additions)).toEqual([first])

    await wrapper.setProps({
      annotations: [
        { time: 0, width: 400, height: 300, drawing: { objects: [] } }
      ]
    })
    await flushPromises()
    expect(pendingIds()).toEqual([first])

    await wrapper
      .find('button[title="playlists.actions.annotation_draw"]')
      .trigger('click')
    await draw(SECOND)
    const [, second] = pendingIds()

    requests[0].resolve({
      id: 'preview-1',
      annotations: requests[0].body.additions
    })
    await flushPromises()

    expect(pendingIds()).toEqual([second])
    expect(saveButton().element.disabled).toBe(false)

    await save()
    expect(requests).toHaveLength(2)
    expect(objectIds(requests[1].body.additions)).toEqual([second])
  })

  it('keeps every stroke pending when the save fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Network down')
    const requests = holdRequests()
    mountOverlay()
    await draw(FIRST)

    await save()
    await draw(SECOND)
    const strokes = pendingIds()
    expect(strokes).toHaveLength(2)

    requests[0].reject(error)
    await flushPromises()

    expect(consoleError).toHaveBeenCalledWith(
      'Failed to save shared playlist annotations',
      error
    )
    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(pendingIds()).toEqual(strokes)
    expect(saveButton().element.disabled).toBe(false)

    await save()
    expect(requests).toHaveLength(2)
    expect(objectIds(requests[1].body.additions)).toEqual(strokes)
  })

  // On a picture, the player hands the file shown, its annotations, and its
  // dimensions: two redraws start in the same tick.
  it('keeps the unsaved strokes of each file apart', async () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 400,
      bottom: 300,
      width: 400,
      height: 300
    })
    const requests = holdRequests()
    mountOverlay()
    const showPicture = previewFileId =>
      wrapper.setProps({
        annotations: [],
        movieDimensions: { width: 400, height: 300 },
        previewFileId
      })
    await draw(FIRST)
    const [first] = pendingIds()

    await showPicture('preview-2')
    await flushPromises()
    expect(pendingIds()).toEqual([])
    expect(saveButton().element.disabled).toBe(true)

    await draw(SECOND)
    const [second] = pendingIds()
    await save()
    expect(requests[0].body.preview_file_id).toBe('preview-2')
    expect(objectIds(requests[0].body.additions)).toEqual([second])
    const saved = requests[0].body.additions
    requests[0].resolve({ id: 'preview-2', annotations: saved })
    await flushPromises()
    expect(wrapper.emitted('saved')).toEqual([[saved, 'preview-2']])

    await showPicture('preview-1')
    await flushPromises()
    expect(pendingIds()).toEqual([first])
    expect(saveButton().element.disabled).toBe(false)

    await save()
    expect(requests).toHaveLength(2)
    expect(requests[1].body.preview_file_id).toBe('preview-1')
    expect(objectIds(requests[1].body.additions)).toEqual([first])
  })

  it('sends a stroke once after a round trip between files', async () => {
    const requests = holdRequests()
    mountOverlay({ isPicture: false })
    await draw(FIRST)
    const [first] = pendingIds()
    await showFile('preview-2')
    await showFile('preview-1')

    await save()
    expect(objectIds(requests[0].body.additions)).toEqual([first])
    requests[0].resolve({
      id: 'preview-1',
      annotations: requests[0].body.additions
    })
    await flushPromises()

    await showFile('preview-2')
    await showFile('preview-1')
    expect(pendingIds()).toEqual([])
    expect(saveButton().element.disabled).toBe(true)
  })

  describe('when the guest leaves the file during the save', () => {
    it('takes the strokes sent out of their file', async () => {
      const requests = holdRequests()
      mountOverlay({ isPicture: false })
      await draw(FIRST)
      await save()
      await draw(SECOND)
      const [, second] = pendingIds()

      await showFile('preview-2')
      expect(pendingIds()).toEqual([])
      await draw(THIRD)
      const [third] = pendingIds()

      const saved = requests[0].body.additions
      requests[0].resolve({ id: 'preview-1', annotations: saved })
      await flushPromises()
      expect(wrapper.emitted('saved')).toEqual([[saved, 'preview-1']])
      expect(pendingIds()).toEqual([third])
      expect(saveButton().element.disabled).toBe(false)

      await wrapper.setProps({ annotations: saved, previewFileId: 'preview-1' })
      await flushPromises()
      expect(pendingIds()).toEqual([second])

      await save()
      expect(requests).toHaveLength(2)
      expect(requests[1].body.preview_file_id).toBe('preview-1')
      expect(objectIds(requests[1].body.additions)).toEqual([second])
    })

    it('takes the strokes sent out once back on the file before the answer', async () => {
      const requests = holdRequests()
      mountOverlay({ isPicture: false })
      await draw(FIRST)
      await save()
      await showFile('preview-2')
      await draw(SECOND)
      const [second] = pendingIds()

      await showFile('preview-1')
      const saved = requests[0].body.additions
      requests[0].resolve({ id: 'preview-1', annotations: saved })
      await flushPromises()
      expect(pendingIds()).toEqual([])
      expect(saveButton().element.disabled).toBe(true)

      await showFile('preview-2')
      expect(pendingIds()).toEqual([second])
    })

    it('keeps every stroke of the file when the save fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = new Error('Network down')
      const requests = holdRequests()
      mountOverlay({ isPicture: false })
      await draw(FIRST)
      await save()
      await draw(SECOND)
      const strokes = pendingIds()
      expect(strokes).toHaveLength(2)
      await showFile('preview-2')

      requests[0].reject(error)
      await flushPromises()
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to save shared playlist annotations',
        error
      )
      expect(wrapper.emitted('saved')).toBeUndefined()
      expect(pendingIds()).toEqual([])

      await showFile('preview-1')
      expect(pendingIds()).toEqual(strokes)
      expect(saveButton().element.disabled).toBe(false)
    })
  })
})

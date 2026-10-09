import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { markRaw, nextTick, ref } from 'vue'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// Pre-load the real store to avoid a circular-import race from child components.
import '@/lib/auth'

import PreviewPlayer from '@/components/players/players/PreviewPlayer.vue'

const task = {
  id: 'task-1',
  project_id: 'production-1',
  entity_id: 'entity-1',
  entity_type_name: 'Shot',
  task_type_id: 'task-type-1'
}

const preview = {
  id: 'preview-1',
  extension: 'png',
  revision: 1,
  task_id: task.id,
  annotations: []
}

// One set of spies shared by the main and the comparison viewer stubs.
const viewer = {
  panBy: vi.fn(),
  pause: vi.fn(),
  play: vi.fn(),
  resetZoom: vi.fn(),
  resize: vi.fn(),
  resumeZoom: vi.fn(),
  setCurrentFrame: vi.fn(),
  setCurrentTimeRaw: vi.fn(),
  setPanZoom: vi.fn(),
  setVolume: vi.fn(),
  zoomAt: vi.fn()
}

const moviePreview = {
  id: 'preview-2',
  extension: 'mp4',
  revision: 1,
  task_id: task.id,
  annotations: [],
  duration: 10
}

const annotatedPreview = {
  ...preview,
  annotations: [
    {
      time: 0,
      width: 800,
      height: 600,
      drawing: {
        objects: [
          {
            id: 'stroke-1',
            type: 'path',
            path: 'M 0 0 L 10 10',
            left: 100,
            top: 50,
            scaleX: 1,
            scaleY: 1,
            stroke: '#ff0000',
            strokeWidth: 2
          }
        ]
      }
    }
  ]
}

// Enough of a fabric canvas for the annotation composable, which wires its
// handlers with on() and off().
const createFakeCanvas = () => {
  const handlers = {}
  const objects = []
  return {
    width: 800,
    height: 600,
    _objects: objects,
    contextContainer: {},
    freeDrawingBrush: { pressureManager: {} },
    add: vi.fn(),
    clear: vi.fn(),
    discardActiveObject: vi.fn(),
    fire: (event, options) =>
      (handlers[event] || []).forEach(handler => handler(options)),
    getActiveObject: vi.fn(),
    getObjects: () => objects,
    off: (event, handler) => {
      handlers[event] = (handlers[event] || []).filter(h => h !== handler)
    },
    on: (event, handler) => {
      handlers[event] = [...(handlers[event] || []), handler]
    },
    remove: vi.fn(),
    requestRenderAll: vi.fn()
  }
}

// Raw like the canvas AnnotationCanvas exposes: a reactive proxy would fail
// the identity checks of the composable.
const annotationCanvasStub = canvas => ({
  name: 'AnnotationCanvas',
  template: '<div />',
  setup: () => ({ canvas: markRaw(canvas), overlay: ref(null) })
})

const mountPlayer = ({
  props = {},
  getterOverrides = {},
  config = {},
  stubs = {}
} = {}) => {
  const store = createStore({
    getters: {
      assetMap: () => new Map(),
      canEditShotTrim: () => () => false,
      canValidatePreviewFiles: () => () => false,
      getProductionBackgrounds: () => () => [],
      isCurrentUserArtist: () => false,
      isShotsLoading: () => false,
      isTVShow: () => false,
      organisation: () => ({}),
      productionMap: () => new Map([[task.project_id, { fps: 25 }]]),
      selectedConcepts: () => new Map(),
      shotMap: () => new Map(),
      user: () => ({ id: 'user-1' }),
      ...getterOverrides
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  store.commit = vi.fn()

  return shallowMount(PreviewPlayer, {
    props: { previews: [preview], task, readOnly: true, ...props },
    global: {
      config,
      stubs: {
        // The mounted hook and the ordering watcher drive the viewers; the
        // default stub has none of their methods.
        PreviewViewer: {
          name: 'PreviewViewer',
          template: '<div />',
          methods: viewer
        },
        RouterLink: { template: '<a><slot /></a>' },
        VideoProgress: {
          name: 'VideoProgress',
          template: '<div />',
          methods: { updateProgressBar: () => {} }
        },
        ...stubs
      },
      plugins: [store]
    }
  })
}

const pointer = (target, type, { id, x, y }) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y
  })
  Object.defineProperties(event, {
    pointerId: { value: id },
    pointerType: { value: 'touch' }
  })
  target.dispatchEvent(event)
}

describe('PreviewPlayer.vue', () => {
  let wrapper = null
  // callback of the last resize observer created
  let onResize = null

  beforeAll(() => {
    // jsdom has no ResizeObserver: mirror the browser check on the target.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback) {
          onResize = callback
        }

        observe(target) {
          if (!(target instanceof Element)) {
            throw new TypeError(
              "Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element'."
            )
          }
        }

        unobserve() {}

        disconnect() {}
      }
    )
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
    Object.values(viewer).forEach(spy => spy.mockClear())
  })

  describe('finger navigation', () => {
    // Fingers on the annotations move the media of the main viewer: the
    // comparison viewer only mirrors it.
    it('zooms the main viewer with a pinch on the annotations', async () => {
      wrapper = mountPlayer({
        stubs: {
          AnnotationCanvas: {
            name: 'AnnotationCanvas',
            template: '<div ref="overlay"><canvas /></div>',
            setup: () => ({ overlay: ref(null) })
          }
        }
      })
      await nextTick()
      const upper = wrapper
        .findComponent({ ref: 'main-annotation-canvas' })
        .find('canvas').element

      pointer(upper, 'pointerdown', { id: 1, x: 100, y: 100 })
      pointer(upper, 'pointerdown', { id: 2, x: 200, y: 100 })
      pointer(upper, 'pointermove', { id: 2, x: 300, y: 100 })

      expect(viewer.zoomAt.mock.calls).toEqual([[200, 100, 2]])
      expect(viewer.zoomAt.mock.contexts.map(vm => vm.$attrs.name)).toEqual([
        'main'
      ])
    })
  })

  describe('movie playback', () => {
    it('keeps the frame and the playback across a quality switch', async () => {
      // The LD/HD reload fires video-loaded again: the player reset the
      // frame to 0 and left the play button on a decoder the reload paused.
      wrapper = mountPlayer({ props: { previews: [moviePreview] } })
      await nextTick()
      const mainViewer = wrapper.findAllComponents({ name: 'PreviewViewer' })[0]
      mainViewer.vm.$emit('video-loaded')
      wrapper.vm.setCurrentFrame(87)
      wrapper.vm.play()
      viewer.play.mockClear()
      wrapper
        .findComponent({ name: 'PlayerPlaybackBar' })
        .vm.$emit('update:isHd', true)
      await nextTick()
      mainViewer.vm.$emit('video-loaded')
      expect(viewer.setCurrentFrame).toHaveBeenLastCalledWith(87)
      expect(viewer.play).toHaveBeenCalledTimes(1)
    })

    it('starts a trimmed shot on its handle-in frame at any fps', async () => {
      // 120 * 0.0333 (rounded frame duration) is frame 119.88 at 30 fps: the
      // play jump landed one frame before the trim.
      wrapper = mountPlayer({
        props: { previews: [moviePreview] },
        getterOverrides: {
          productionMap: () => new Map([[task.project_id, { fps: 30 }]]),
          shotMap: () =>
            new Map([[task.entity_id, { id: task.entity_id, data: { handle_in: 120 } }]])
        }
      })
      await nextTick()
      wrapper.vm.play()
      expect(viewer.setCurrentTimeRaw.mock.calls[0][0]).toBeCloseTo(
        120 / 30 + 0.001,
        6
      )
    })
  })

  // The trim belongs to the shot, not to a revision: an end handle left at
  // the clip end must not pin the length of the revision on screen.
  describe('trim handles', () => {
    // 250 frames at 25 fps.
    const mountTrimmable = async data => {
      wrapper = mountPlayer({
        props: { previews: [moviePreview], readOnly: false },
        getterOverrides: {
          canEditShotTrim: () => () => true,
          shotMap: () =>
            new Map([[task.entity_id, { id: task.entity_id, data }]])
        }
      })
      await nextTick()
    }

    const savedData = () =>
      wrapper.vm.$store.dispatch.mock.calls.find(
        ([action]) => action === 'editShot'
      )?.[1].data

    const dragHandle = (event, frameNumber) =>
      wrapper
        .findComponent({ name: 'VideoProgress' })
        .vm.$emit(event, { frameNumber, save: true })

    it('leaves the end untrimmed when only the start handle moves', async () => {
      await mountTrimmable({ fps: 25 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ fps: 25, handle_in: 5 })
    })

    it('clears the end trim when its handle goes back to the clip end', async () => {
      await mountTrimmable({ handle_in: 5, handle_out: 200 })
      dragHandle('handle-out-changed', 250)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: null })
    })

    it('saves an end handle moved inside the clip', async () => {
      await mountTrimmable({})
      dragHandle('handle-out-changed', 200)
      expect(savedData()).toEqual({ handle_out: 200 })
    })

    // A trim set on a longer revision lies past the end of this one.
    it('keeps an end trim set on a longer revision when the start handle moves', async () => {
      await mountTrimmable({ handle_out: 300 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: 300 })
    })
  })

  describe('render', () => {
    // The Task page mounts the player with its task still null when a
    // comment lands before the task is loaded, and TaskInfo drops its task
    // when the notification is toggled off.
    it('renders without a task', () => {
      wrapper = mountPlayer({ props: { task: null } })
      expect(wrapper.find('.preview-player').exists()).toBe(true)
    })

    // A plain link navigates the tab: the browser fires beforeunload, which
    // closes the socket in Firefox and asks about unsaved annotations.
    it('downloads the original without leaving the page', () => {
      wrapper = mountPlayer()
      const link = wrapper.get(
        'a[href="/api/pictures/originals/preview-files/preview-1/download"]'
      )
      expect(link.attributes('download')).toBe('')
    })
  })

  describe('mounted hook', () => {
    // Vue mounts a comment node in place of a tree whose render threw and
    // still runs the mounted hook: every template ref is null in there.
    it('does not fail a second time after a failed render', () => {
      const errorHandler = vi.fn()
      const mountFailing = () =>
        mountPlayer({
          config: { errorHandler },
          getterOverrides: {
            getProductionBackgrounds: () => () => {
              throw new Error('render failure')
            }
          }
        })
      // Test utils rethrow the first error met while mounting, once the app
      // error handler has seen every error of the mount.
      expect(mountFailing).toThrow('render failure')
      expect(errorHandler.mock.calls.map(([error]) => error.message)).toEqual(
        ['render failure']
      )
    })
  })

  describe('deferred viewer resize', () => {
    // The ordering watcher defers the viewer resize with nextTick, and the
    // player can be torn down before that callback runs (a task switch, a
    // failed render leaving the refs null). Unmounting right after the flush
    // mimics it.
    it('survives a teardown before the deferred resize runs', async () => {
      const rejections = []
      const onRejection = reason => rejections.push(reason)
      process.on('unhandledRejection', onRejection)

      wrapper = mountPlayer()
      await nextTick()
      wrapper.findComponent({ name: 'BrowsingBar' }).vm.$emit('current-index-clicked')
      await nextTick()
      wrapper.unmount()
      wrapper = null
      // Node reports a rejected promise once the microtask queue has drained.
      await new Promise(resolve => setTimeout(resolve))
      process.off('unhandledRejection', onRejection)

      expect(rejections).toEqual([])
    })
  })

  // The resize observer reports the size of the container as soon as it
  // observes it, then at each resize: a player closed within the 200 ms of
  // the debounce still reloaded the annotation of its frame.
  describe('container resize', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('drops the annotation reload of a closed player', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const canvas = createFakeCanvas()
      wrapper = mountPlayer({
        props: { previews: [annotatedPreview] },
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await nextTick()
      expect(canvas.add).toHaveBeenCalled()
      canvas.add.mockClear()

      onResize([])
      wrapper.unmount()
      wrapper = null
      await vi.advanceTimersByTimeAsync(200)

      expect(canvas.add).not.toHaveBeenCalled()
    })
  })

  // The comparison canvas realigns 500 ms after the media of the comparison
  // viewer loads: a player closed in between still reloaded the annotation
  // of the compared revision.
  describe('comparison', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('drops the realign of a closed player', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const canvas = createFakeCanvas()
      const comparedPreview = { ...annotatedPreview, id: 'preview-3' }
      wrapper = mountPlayer({
        props: {
          entityPreviewFiles: {
            [task.task_type_id]: [comparedPreview, preview]
          },
          taskTypeMap: new Map([
            [task.task_type_id, { id: task.task_type_id, name: 'Animation' }]
          ])
        },
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await nextTick()
      wrapper
        .findComponent({ name: 'PlayerComparisonBar' })
        .vm.$emit('compare-clicked')
      await flushPromises()
      expect(canvas.add).toHaveBeenCalled()
      canvas.add.mockClear()

      wrapper
        .findAllComponents({ name: 'PreviewViewer' })[1]
        .vm.$emit('video-loaded')
      wrapper.unmount()
      wrapper = null
      await vi.advanceTimersByTimeAsync(500)

      expect(canvas.add).not.toHaveBeenCalled()
    })
  })

  // fabric disposes a text still in editing without the object:modified of
  // a regular exit, and the typing only reaches the save 400 ms after the
  // last keystroke: closing the player right after typing lost it.
  describe('text annotation in editing', () => {
    // Like fabric, a regular exit fires object:modified only for a text
    // that differs from the one the editing started with.
    const createEditingText = (canvas, textBeforeEdit) => ({
      id: 'text-1',
      canvas,
      isEditing: true,
      text: textBeforeEdit,
      _textBeforeEdit: textBeforeEdit,
      set(key, value) {
        this[key] = value
      },
      toJSON() {
        return { type: 'i-text', text: this.text }
      },
      exitEditing() {
        this.isEditing = false
        if (this.text !== this._textBeforeEdit) {
          canvas.fire('object:modified', { target: this })
        }
      }
    })

    const mountWithText = async textBeforeEdit => {
      const canvas = createFakeCanvas()
      const text = createEditingText(canvas, textBeforeEdit)
      canvas.getActiveObject.mockReturnValue(text)
      const player = mountPlayer({
        props: { readOnly: false },
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await nextTick()
      const type = value => {
        text.text = value
        canvas.fire('text:changed', { target: text })
      }
      return { player, type }
    }

    const savedTexts = player =>
      (player.emitted('annotation-changed') || []).flatMap(([{ updates }]) =>
        updates.flatMap(({ drawing }) => drawing.objects.map(({ text }) => text))
      )

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('saves the text typed right before the player closes', async () => {
      const { player, type } = await mountWithText('Type...')

      type('Fix the hand')
      player.unmount()

      expect(savedTexts(player)).toEqual(['Fix the hand'])
    })

    it('saves a text typed back to its start right before closing', async () => {
      const { player, type } = await mountWithText('Fix hand')
      type('Fix hand now')
      await vi.advanceTimersByTimeAsync(400)

      type('Fix hand')
      player.unmount()

      expect(savedTexts(player)).toEqual(['Fix hand'])
    })
  })

  describe('focus', () => {
    // TaskInfo focuses the player in a nextTick once a task is loaded. A
    // render that threw on update keeps the player mounted with every
    // template ref null.
    it('does nothing after a failed render', async () => {
      const errorHandler = vi.fn()
      let isRenderFailing = false
      wrapper = mountPlayer({
        config: { errorHandler },
        getterOverrides: {
          getProductionBackgrounds: () => () => {
            if (isRenderFailing) throw new Error('render failure')
            return []
          }
        }
      })
      isRenderFailing = true
      await wrapper.setProps({ task: { ...task, id: 'task-2' } })
      expect(errorHandler.mock.calls.map(([error]) => error.message)).toEqual(
        ['render failure']
      )
      expect(wrapper.find('.preview-player').exists()).toBe(false)

      expect(() => wrapper.vm.focus()).not.toThrow()
    })
  })
})

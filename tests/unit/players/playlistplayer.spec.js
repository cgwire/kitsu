import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { markRaw, reactive, ref } from 'vue'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

// The real one draws into a laid out container and fetches the movie.
const waveSurfer = vi.hoisted(() => ({
  create: vi.fn(() => ({
    destroy: vi.fn(),
    load: vi.fn(() => Promise.resolve()),
    on: vi.fn()
  }))
}))
vi.mock('wavesurfer.js', () => ({ default: waveSurfer }))

// Pre-load the real store to avoid a circular-import race from child components.
import '@/lib/auth'

import PlaylistPlayer from '@/components/players/players/PlaylistPlayer.vue'

const playlist = {
  id: 'playlist-1',
  build_jobs: [
    { id: 'job-1', status: 'succeeded', created_at: '2026-01-01T10:00:00' }
  ]
}

// A preview no viewer handles: the player offers the file instead.
const entity = {
  id: 'shot-1',
  preview_file_id: 'preview-1',
  preview_file_extension: 'blend'
}

const withMethods = (names, values = {}) => ({
  template: '<div />',
  methods: {
    ...Object.fromEntries(names.map(name => [name, () => {}])),
    ...values
  }
})

// Without previewFileStatusMap, the store keeps no preview status.
const mountPlayer = ({
  playlistProp = playlist,
  entities = [entity],
  canEditShotTrim = () => true,
  previewFileStatusMap,
  shotMap = new Map(),
  taskMap = new Map(),
  stubs = {}
} = {}) => {
  const store = createStore({
    getters: {
      canEditShotTrim: () => canEditShotTrim,
      currentProduction: () => ({ id: 'production-1', fps: '25' }),
      currentUserRoleForProduction: () => () => 'manager',
      dateFormat: () => 'yyyy-MM-dd',
      editMap: () => new Map(),
      episodeMap: () => new Map(),
      isCurrentUserAdmin: () => false,
      isCurrentUserArtist: () => false,
      isCurrentUserClient: () => false,
      isCurrentUserManager: () => true,
      isCurrentUserSupervisor: () => false,
      organisation: () => ({}),
      personMap: () => new Map(),
      previewFileMap: () => new Map(),
      previewFileStatusMap: () => previewFileStatusMap,
      productionAssetTaskTypes: () => [],
      productionBackgrounds: () => [],
      productionEditTaskTypes: () => [],
      productionEpisodeTaskTypes: () => [],
      productionSequenceTaskTypes: () => [],
      productionShotTaskTypes: () => [],
      shotMap: () => shotMap,
      taskMap: () => taskMap,
      taskStatusMap: () => new Map(),
      taskTypeMap: () => new Map(),
      use12HourClock: () => false,
      user: () => ({ id: 'user-1', timezone: 'Europe/Paris' })
    }
  })
  store.dispatch = vi.fn(() => Promise.resolve())
  store.commit = vi.fn()
  store.$socket = { on: vi.fn(), off: vi.fn(), emit: vi.fn() }

  return shallowMount(PlaylistPlayer, {
    props: { playlist: playlistProp, entities },
    global: {
      plugins: [store],
      // The mount hooks drive the viewers through their template refs; the
      // default stubs have none of their methods.
      stubs: {
        MultiVideoViewer: withMethods(
          [
            'clear',
            'goNextFrame',
            'goPreviousFrame',
            'loadEntity',
            'pause',
            'play',
            'playNext',
            'reloadCurrentEntity',
            'resetHeight',
            'resetPanZoom',
            'resumePanZoom',
            'setCurrentFrame',
            'setCurrentTimeRaw',
            'setPanZoom',
            'setSpeed',
            'setVolume'
          ],
          {
            getCurrentTime: () => 0,
            getCurrentTimeRaw: () => 0,
            getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
            getVideoRatio: () => 1
          }
        ),
        MultiPictureViewer: {
          ...withMethods(['resetPanZoom', 'resumePanZoom', 'setPanZoom'], {
            getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
            getPictureElement: () => null
          }),
          props: { previews: Array }
        },
        ObjectViewer: withMethods(['pause', 'play'], {
          getAnimations: () => []
        }),
        PictureViewer: withMethods(['setPanZoom']),
        SoundViewer: withMethods(['pause', 'play', 'redraw']),
        TaskInfo: withMethods(['focusCommentTextarea']),
        VideoProgress: {
          ...withMethods(['updateProgressBar']),
          props: { handleIn: Number, handleOut: Number, readOnly: Boolean }
        },
        ...stubs
      }
    }
  })
}

// Enough of a fabric canvas for the annotation composable, which wires its
// handlers with on() and off().
const createFakeCanvas = () => {
  const handlers = {}
  return {
    width: 800,
    height: 600,
    contextContainer: {},
    freeDrawingBrush: { pressureManager: {} },
    add: vi.fn(),
    clear: vi.fn(),
    discardActiveObject: vi.fn(),
    fire: (event, options) =>
      (handlers[event] || []).forEach(handler => handler(options)),
    getActiveObject: vi.fn(),
    getObjects: () => [],
    off: (event, handler) => {
      handlers[event] = (handlers[event] || []).filter(h => h !== handler)
    },
    on: (event, handler) => {
      handlers[event] = [...(handlers[event] || []), handler]
    },
    remove: vi.fn(),
    renderAll: vi.fn(),
    requestRenderAll: vi.fn()
  }
}

// The canvas raw, as AnnotationCanvas exposes it, and the overlay the
// fingers land on.
const annotationCanvasStub = canvas => ({
  name: 'AnnotationCanvas',
  template: '<div ref="overlay"><canvas /></div>',
  setup: () => ({ canvas: markRaw(canvas), overlay: ref(null) })
})

const pointer = (target, type, { id, x, y }) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: id,
      pointerType: 'touch',
      isPrimary: true
    })
  )

describe('PlaylistPlayer.vue', () => {
  let wrapper = null

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
  })

  // The comment box waits for the snapshots, and each of them waits 500 ms
  // for its frame or picture: the player can close in between.
  describe('annotation snapshots', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([
      [
        'video',
        {
          ...entity,
          preview_file_extension: 'mp4',
          preview_file_annotations: [{ time: 1, drawing: { objects: [] } }]
        }
      ],
      ['picture', { ...entity, preview_file_extension: 'png' }]
    ])('drops the %s snapshots of a closed player', async (_, shown) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      wrapper = mountPlayer({ entities: [shown] })
      await flushPromises()

      const snapshots = wrapper.vm.extractAnnotationSnapshots()
      wrapper.unmount()
      wrapper = null
      await vi.advanceTimersByTimeAsync(500)

      await expect(snapshots).resolves.toEqual([])
    })

    // After its frame is read, a snapshot is composited and encoded: the
    // next frame, or the restore of the user's frame, comes after.
    it.each([1, 2])(
      'drops the video snapshots of a player closed after frame 1 of %i',
      async count => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        // jsdom draws and encodes nothing
        const snapshotCanvas = document.createElement('canvas')
        snapshotCanvas.toBlob = callback => callback(new Blob())
        vi.spyOn(document, 'getElementById').mockReturnValue(snapshotCanvas)
        const getContext = vi
          .spyOn(HTMLCanvasElement.prototype, 'getContext')
          .mockReturnValue({ clearRect: () => {}, drawImage: () => {} })
        const annotations = Array.from({ length: count }, (_, index) => ({
          time: index + 1,
          drawing: { objects: [] }
        }))
        wrapper = mountPlayer({
          entities: [
            {
              ...entity,
              preview_file_extension: 'mp4',
              preview_file_annotations: annotations
            }
          ]
        })
        await flushPromises()

        const snapshots = wrapper.vm.extractAnnotationSnapshots()
        await vi.advanceTimersByTimeAsync(550)
        expect(getContext).toHaveBeenCalled()
        wrapper.unmount()
        wrapper = null
        await vi.advanceTimersByTimeAsync(600)

        await expect(snapshots).resolves.toEqual([])
      }
    )
  })

  // The waveform loads 100 ms after it is set up for the movie on screen:
  // the player can close, or move on to a picture, in between.
  describe('waveform', () => {
    const movie = { ...entity, preview_file_extension: 'mp4' }
    const picture = {
      id: 'shot-2',
      preview_file_id: 'preview-2',
      preview_file_extension: 'png'
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    const showWaveform = async entities => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      // The player sets the waveform up only in a container it finds.
      vi.spyOn(document, 'getElementById').mockReturnValue(
        document.createElement('div')
      )
      wrapper = mountPlayer({ entities })
      await flushPromises()
      wrapper.findComponent({ ref: 'raw-player' }).vm.currentPlayer = {
        src: '/movie.mp4'
      }
      wrapper
        .findComponent({ name: 'PlayerPlaybackBar' })
        .vm.$emit('update:isWaveformDisplayed', true)
      await flushPromises()
      return waveSurfer.create.mock.results.at(-1).value
    }

    it('loads the waveform of the movie on screen', async () => {
      const waveform = await showWaveform([movie])
      await vi.advanceTimersByTimeAsync(100)
      expect(waveform.load).toHaveBeenCalledWith('/movie.mp4')
    })

    it('drops the waveform load of a closed player', async () => {
      const waveform = await showWaveform([movie])
      wrapper.unmount()
      wrapper = null
      await vi.advanceTimersByTimeAsync(100)
      expect(waveform.load).not.toHaveBeenCalled()
    })

    it('drops the waveform load of a movie left for a picture', async () => {
      const waveform = await showWaveform([movie, picture])
      wrapper
        .findAllComponents({ name: 'ButtonSimple' })
        .find(
          button => button.attributes('title') === 'playlists.actions.next_shot'
        )
        .vm.$emit('click')
      await flushPromises()
      await vi.advanceTimersByTimeAsync(100)
      expect(waveform.load).not.toHaveBeenCalled()
    })
  })

  // A plain link navigates the tab: the browser fires beforeunload, which
  // closes the socket in Firefox and asks about unsaved annotations.
  describe('downloads', () => {
    it.each([
      ['the current file', '/api/pictures/originals/preview-files/preview-1/download'],
      ['the playlist CSV', '/api/export/csv/playlists/playlist-1'],
      ['a built movie', '/api/data/playlists/playlist-1/jobs/job-1/build/mp4']
    ])('downloads %s without leaving the page', async (_, href) => {
      wrapper = mountPlayer()
      await flushPromises()
      expect(wrapper.get(`a[href="${href}"]`).attributes('download')).toBe('')
    })

    // Zou builds the zip while it answers: a new tab shows the wait and
    // keeps the player tab out of the navigation.
    it('opens the playlist zip in a new tab', async () => {
      wrapper = mountPlayer()
      await flushPromises()
      const zip = wrapper.get(
        'a[href="/api/data/playlists/playlist-1/download/zip"]'
      )
      expect(zip.attributes('target')).toBe('_blank')
      expect(zip.attributes('rel')).toBe('noopener noreferrer')
      expect(zip.attributes('download')).toBeUndefined()
    })
  })

  // The trim belongs to the shot, not to a revision: an end handle left at
  // the clip end must not pin the length of the revision on screen, or a
  // longer revision would stop at that length.
  describe('trim handles', () => {
    // 69 frames at 25 fps.
    const movie = {
      id: 'shot-1',
      preview_file_id: 'preview-1',
      preview_file_extension: 'mp4',
      preview_file_duration: 2.76,
      preview_file_task_id: 'task-1'
    }

    // The handles are set once the movie metadata gives the duration.
    const mountShotPlayer = async (data, options = {}) => {
      wrapper = mountPlayer({
        playlistProp: { ...playlist, for_entity: 'shot' },
        entities: [movie],
        shotMap: new Map([['shot-1', { id: 'shot-1', data }]]),
        ...options
      })
      await flushPromises()
      wrapper
        .findComponent({ ref: 'raw-player' })
        .vm.$emit('max-duration-update', movie.preview_file_duration)
      await flushPromises()
    }

    const savedData = () =>
      wrapper.vm.$store.dispatch.mock.calls.find(
        ([action]) => action === 'editShot'
      )?.[1].data

    const progressBar = () => wrapper.findComponent({ ref: 'video-progress' })

    const dragHandle = (event, frameNumber) =>
      progressBar().vm.$emit(event, { frameNumber, save: true })

    it('leaves the end untrimmed when only the start handle moves', async () => {
      await mountShotPlayer({ fps: 25 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ fps: 25, handle_in: 5 })
    })

    it('clears the end trim when its handle goes back to the clip end', async () => {
      await mountShotPlayer({ handle_in: 5, handle_out: 60 })
      dragHandle('handle-out-changed', 69)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: null })
    })

    it('saves an end handle moved inside the clip', async () => {
      await mountShotPlayer({})
      dragHandle('handle-out-changed', 60)
      expect(savedData()).toEqual({ handle_out: 60 })
    })

    it('keeps an end trim when the start handle moves', async () => {
      await mountShotPlayer({ handle_out: 60 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: 60 })
    })

    // A trim set on a longer revision lies past the end of this one.
    it('keeps an end trim set on a longer revision when the start handle moves', async () => {
      await mountShotPlayer({ handle_out: 80 })
      dragHandle('handle-in-changed', 5)
      expect(savedData()).toEqual({ handle_in: 5, handle_out: 80 })
    })

    // Zou lets admins, and the managers and department-less supervisors of
    // the production team, trim a shot.
    it.each([
      ['editable for a user who may trim the shot', true],
      ['frozen for a user Zou refuses the trim to', false]
    ])('keeps the handles %s', async (_, isAllowed) => {
      await mountShotPlayer({}, { canEditShotTrim: () => isAllowed })
      expect(progressBar().props('readOnly')).toBe(!isAllowed)
    })

    // The bar still ends a drag started before the handles froze.
    it.each([
      ['start', 'handle-in-changed', 5, 'handleIn', 0],
      ['end', 'handle-out-changed', 60, 'handleOut', 69]
    ])(
      'ignores the %s handle moved by a user Zou refuses the trim to',
      async (_, event, frameNumber, prop, value) => {
        await mountShotPlayer({}, { canEditShotTrim: () => false })
        dragHandle(event, frameNumber)
        await flushPromises()
        expect(savedData()).toBeUndefined()
        expect(progressBar().props(prop)).toBe(value)
      }
    )

    // A temporary playlist can mix shots of several productions.
    it('checks the trim right on the task of the shot on screen', async () => {
      const task = { id: 'task-1', project_id: 'production-2' }
      const canEditShotTrim = vi.fn(() => true)
      await mountShotPlayer(
        {},
        { canEditShotTrim, taskMap: new Map([[task.id, task]]) }
      )
      expect(canEditShotTrim).toHaveBeenCalledWith(task)
    })

    it('keeps a failed save from going unhandled', async () => {
      const rejections = []
      const onRejection = reason => rejections.push(reason)
      process.on('unhandledRejection', onRejection)
      vi.spyOn(console, 'error').mockImplementation(() => {})
      await mountShotPlayer({})
      // Not a vi.fn: it handles the promises it returns, to record how they
      // settle, so a rejection from it never counts as unhandled.
      wrapper.vm.$store.dispatch = action =>
        action === 'editShot'
          ? Promise.reject(new Error('forbidden'))
          : Promise.resolve()

      dragHandle('handle-in-changed', 5)
      // Node reports a rejected promise once the microtask queue drained.
      await new Promise(resolve => setTimeout(resolve))
      process.off('unhandledRejection', onRejection)

      expect(rejections).toEqual([])
    })
  })

  // Zou builds the files of an uploaded preview in a job, and its picture
  // routes answer 404 until the preview file is ready.
  describe('previews being processed', () => {
    const picture = {
      id: 'shot-2',
      preview_file_id: 'preview-2',
      preview_file_extension: 'png'
    }

    const pictureWithExtra = {
      ...picture,
      preview_file_previews: [{ id: 'preview-3', extension: 'png' }]
    }

    const viewerStatuses = () =>
      wrapper
        .findComponent({ ref: 'picture-player' })
        .props('previews')
        .map(({ status }) => status)

    it('registers the statuses of the revisions its entries can play', async () => {
      const subPreview = { id: 'preview-3', status: 'processing' }
      const revision = {
        id: 'preview-2',
        status: 'processing',
        previews: [subPreview]
      }
      const olderRevision = { id: 'preview-4', status: 'ready', previews: [] }
      const otherTaskRevision = { id: 'preview-5', status: 'broken' }
      wrapper = mountPlayer({
        entities: [
          {
            ...picture,
            preview_files: {
              'task-type-1': [revision, olderRevision],
              'task-type-2': [otherTaskRevision]
            }
          },
          entity
        ]
      })
      await flushPromises()
      expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
        'registerPreviewFileStatuses',
        [revision, subPreview, olderRevision, otherTaskRevision]
      )
    })

    // The playlist page pushes an added entry into the list it handed over.
    it('registers the revisions of an entry added to the playlist', async () => {
      const entities = reactive([entity])
      wrapper = mountPlayer({ entities })
      await flushPromises()
      const revision = { id: 'preview-2', status: 'processing', previews: [] }
      entities.push({ ...picture, preview_files: { 'task-type-1': [revision] } })
      await flushPromises()
      expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
        'registerPreviewFileStatuses',
        [revision]
      )
    })

    it('gives the picture viewers the status the registry knows', async () => {
      const previewFileStatusMap = reactive(
        new Map([
          ['preview-2', 'processing'],
          ['preview-3', 'processing']
        ])
      )
      wrapper = mountPlayer({
        entities: [pictureWithExtra],
        previewFileStatusMap
      })
      await flushPromises()
      expect(viewerStatuses()).toEqual(['processing', 'processing'])

      previewFileStatusMap.set('preview-2', 'ready')
      await flushPromises()
      expect(viewerStatuses()).toEqual(['ready', 'processing'])
    })

    // The viewers take a preview without a status as ready.
    it('gives the picture viewers no status without a registry', async () => {
      wrapper = mountPlayer({ entities: [pictureWithExtra] })
      await flushPromises()
      expect(viewerStatuses()).toEqual([undefined, undefined])
    })
  })

  describe('finger gestures', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([
      ['pencil', 'pencil-annotate-clicked'],
      ['eraser', 'erase-clicked'],
      ['shape', 'shape-mode-clicked'],
      ['text', 'type-clicked']
    ])('hands a finger on the annotations to the %s', async (tool, click) => {
      wrapper = mountPlayer({
        entities: [{ ...entity, preview_file_extension: 'mp4' }],
        stubs: { AnnotationCanvas: annotationCanvasStub(createFakeCanvas()) }
      })
      await flushPromises()
      wrapper.findComponent({ name: 'PlayerAnnotationBar' }).vm.$emit(click)
      await flushPromises()
      const upper = wrapper
        .findComponent({ ref: 'main-annotation-canvas' })
        .find('canvas').element
      const heard = []
      upper.addEventListener('pointerdown', event =>
        heard.push(event.pointerType)
      )

      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      pointer(upper, 'pointerdown', { id: 1, x: 100, y: 100 })
      pointer(upper, 'pointermove', { id: 1, x: 105, y: 100 })
      vi.advanceTimersByTime(300)

      expect(heard).toEqual(['touch'])
    })
  })

  // On a phone the keyboard resizes the player as it opens: the canvas
  // reset ended the typing of the note at once.
  describe('window resize', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    const mountPicture = async () => {
      const canvas = createFakeCanvas()
      wrapper = mountPlayer({
        entities: [{ ...entity, preview_file_extension: 'png' }],
        stubs: { AnnotationCanvas: annotationCanvasStub(canvas) }
      })
      await flushPromises()
      // A 1920 x 1080 picture in an 800 x 450 player.
      const videoContainer = wrapper.find('.video-container').element
      const size = { width: 800, height: 450 }
      Object.defineProperties(videoContainer, {
        offsetWidth: { get: () => size.width },
        offsetHeight: { get: () => size.height }
      })
      const anchor = wrapper.find('.main-content-anchor').element
      return { canvas, size, anchor }
    }

    // The player handles one resize per 100 ms.
    const resize = async () => {
      window.dispatchEvent(new Event('resize'))
      await vi.advanceTimersByTimeAsync(200)
      await flushPromises()
    }

    it('leaves a note being typed', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      const { canvas } = await mountPicture()
      canvas.getActiveObject.mockReturnValue({ isEditing: true })
      canvas.clear.mockClear()

      await resize()

      expect(canvas.clear).not.toHaveBeenCalled()
    })

    it('keeps the overlay on the picture while a note is typed', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
      const { canvas, size, anchor } = await mountPicture()
      await resize()
      const before = anchor.style.width
      canvas.getActiveObject.mockReturnValue({ isEditing: true })
      size.height = 225

      await vi.advanceTimersByTimeAsync(200)
      await resize()

      expect([before, anchor.style.width]).toEqual(['800px', '400px'])
    })
  })
})

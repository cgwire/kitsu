import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createStore } from 'vuex'

vi.mock('vue-i18n', async importOriginal => ({
  ...(await importOriginal()),
  useI18n: () => ({ t: key => key })
}))

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

const mountPlayer = ({
  playlistProp = playlist,
  entities = [entity],
  canEditShotTrim = () => true,
  shotMap = new Map(),
  taskMap = new Map()
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
        MultiPictureViewer: withMethods(
          ['resetPanZoom', 'resumePanZoom', 'setPanZoom'],
          {
            getNaturalDimensions: () => ({ width: 1920, height: 1080 }),
            getPictureElement: () => null
          }
        ),
        ObjectViewer: withMethods(['pause', 'play'], {
          getAnimations: () => []
        }),
        PictureViewer: withMethods(['setPanZoom']),
        SoundViewer: withMethods(['pause', 'play', 'redraw']),
        TaskInfo: withMethods(['focusCommentTextarea']),
        VideoProgress: {
          ...withMethods(['updateProgressBar']),
          props: { handleIn: Number, handleOut: Number, readOnly: Boolean }
        }
      }
    }
  })
}

describe('PlaylistPlayer.vue', () => {
  let wrapper = null

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
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
})

import { shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
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
  pause: vi.fn(),
  play: vi.fn(),
  resetZoom: vi.fn(),
  resize: vi.fn(),
  resumeZoom: vi.fn(),
  setCurrentFrame: vi.fn(),
  setCurrentTimeRaw: vi.fn(),
  setVolume: vi.fn()
}

const moviePreview = {
  id: 'preview-2',
  extension: 'mp4',
  revision: 1,
  task_id: task.id,
  annotations: [],
  duration: 10
}

const mountPlayer = ({ props = {}, getterOverrides = {}, config = {} } = {}) => {
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
        }
      },
      plugins: [store]
    }
  })
}

describe('PreviewPlayer.vue', () => {
  let wrapper = null

  beforeAll(() => {
    // jsdom has no ResizeObserver: mirror the browser check on the target.
    vi.stubGlobal(
      'ResizeObserver',
      class {
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
  })

  describe('render', () => {
    // The Task page mounts the player with its task still null when a
    // comment lands before the task is loaded, and TaskInfo drops its task
    // when the notification is toggled off.
    it('renders without a task', () => {
      // A picture preview has no annotation for the player to load.
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      wrapper = mountPlayer({ props: { task: null } })
      expect(wrapper.find('.preview-player').exists()).toBe(true)
    })
  })

  describe('mounted hook', () => {
    // Vue mounts a comment node in place of a tree whose render threw and
    // still runs the mounted hook: every template ref is null in there.
    it('does not fail a second time after a failed render', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
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

      vi.spyOn(console, 'warn').mockImplementation(() => {})
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

  describe('focus', () => {
    // TaskInfo focuses the player in a nextTick once a task is loaded. A
    // render that threw on update keeps the player mounted with every
    // template ref null.
    it('does nothing after a failed render', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
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

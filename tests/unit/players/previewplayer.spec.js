import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

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
          template: '<div />',
          methods: { resize: () => {}, resumeZoom: () => {}, setVolume: () => {} }
        },
        RouterLink: { template: '<a><slot /></a>' }
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
})

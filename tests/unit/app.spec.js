import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import auth from '@/lib/auth'
import errors from '@/lib/errors'
import i18n, { loadLocaleMessages } from '@/lib/i18n'
import lang from '@/lib/lang'
import assetsStore from '@/store/modules/assets'
import editsStore from '@/store/modules/edits'
import episodesStore from '@/store/modules/episodes'
import sequencesStore from '@/store/modules/sequences'
import shotsStore from '@/store/modules/shots'

import App from '@/App.vue'
import MetadataTextarea from '@/components/cells/MetadataTextarea.vue'
import PublicPageSettings from '@/components/widgets/PublicPageSettings.vue'

import { recordUnhandledRejections } from './fixtures/unhandled-rejections'

let wrapper = null

const Page = { template: '<div />' }

const mountApp = async ({ actions, getters, mutations, path = '/' }) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Page },
      { path: '/login', name: 'login', component: Page },
      {
        path: '/reset-password',
        name: 'reset-password',
        component: Page,
        meta: { isPublic: true }
      },
      {
        path: '/playlists/shared/:token',
        name: 'shared-playlist',
        component: Page
      }
    ]
  })
  router.push(path)
  await router.isReady()

  const store = createStore({
    actions: { setMainConfig: () => ({}), ...actions },
    getters,
    mutations: { TOGGLE_DARK_THEME: () => {}, ...mutations }
  })

  const socket = { on: vi.fn() }
  wrapper = shallowMount(App, {
    global: {
      plugins: [
        router,
        store,
        {
          install: app => {
            app.config.globalProperties.$socket = socket
          }
        }
      ]
    }
  })
  await flushPromises()
  return { router, socket }
}

const emitSocketEvent = (socket, event, eventData) => {
  const [, handler] = socket.on.mock.calls.find(([name]) => name === event)
  handler(eventData)
}

describe('App', () => {
  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('socket events', () => {
    // The task may be deleted, or out of reach, by the time it reloads.
    it('logs a failed task reload after a task update', async () => {
      const rejections = []
      const onRejection = reason => rejections.push(reason)
      process.on('unhandledRejection', onRejection)
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const error = Object.assign(new Error('HTTP 404'), { status: 404 })
      errors.markRequestFailure(error)

      const { socket } = await mountApp({
        actions: { reloadTasks: () => Promise.reject(error) },
        getters: { taskMap: () => new Map([['task-1', { id: 'task-1' }]]) }
      })
      emitSocketEvent(socket, 'task:update', { task_id: 'task-1' })
      // Node reports a rejected promise once the microtask queue has drained.
      await new Promise(resolve => setTimeout(resolve))
      process.off('unhandledRejection', onRejection)

      expect(rejections).toEqual([])
      expect(consoleError).toHaveBeenCalledWith(error)
    })

    it('leaves a bug in the task reload after a task update to Sentry', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const bug = new TypeError('Cannot read properties of undefined')

      const rejections = await recordUnhandledRejections(async () => {
        const { socket } = await mountApp({
          actions: { reloadTasks: () => Promise.reject(bug) },
          getters: { taskMap: () => new Map([['task-1', { id: 'task-1' }]]) }
        })
        emitSocketEvent(socket, 'task:update', { task_id: 'task-1' })
      })

      expect(rejections).toEqual([bug])
      expect(consoleError).not.toHaveBeenCalledWith(bug)
    })

    // A production page replaces the task map, which then lacks the todos.
    it('reloads a todo missing from the task map after a task update', async () => {
      const loadTask = vi.fn(() => Promise.resolve())
      const { socket } = await mountApp({
        actions: { loadTask },
        getters: {
          taskMap: () => new Map(),
          todoMap: () => new Map([['task-1', { id: 'task-1' }]])
        }
      })

      emitSocketEvent(socket, 'task:update', { task_id: 'task-1' })
      await flushPromises()

      expect(loadTask).toHaveBeenCalledWith(expect.anything(), {
        taskId: 'task-1'
      })
    })

    // Zou sends one update per task: a batch of 500 statuses asked every
    // tab for 500 tasks, one request each.
    it('reloads a task at once, then those updated meanwhile in one request', async () => {
      const reloadTasks = vi.fn(() => Promise.resolve())
      const ids = ['task-1', 'task-2', 'task-3']
      const { socket } = await mountApp({
        actions: { reloadTasks },
        getters: {
          taskMap: () => new Map(ids.map(id => [id, { id }])),
          todoMap: () => new Map()
        }
      })
      const reloaded = () => reloadTasks.mock.calls.map(([, taskIds]) => taskIds)
      vi.useFakeTimers()

      emitSocketEvent(socket, 'task:update', { task_id: 'task-1' })
      expect(reloaded()).toEqual([['task-1']])

      emitSocketEvent(socket, 'task:update', { task_id: 'task-2' })
      emitSocketEvent(socket, 'task:update', { task_id: 'task-3' })
      emitSocketEvent(socket, 'task:update', { task_id: 'task-2' })
      emitSocketEvent(socket, 'task:update', { task_id: 'task-unknown' })
      expect(reloaded()).toEqual([['task-1']])

      await vi.advanceTimersByTimeAsync(1000)
      expect(reloaded()).toEqual([['task-1'], ['task-2', 'task-3']])

      await vi.advanceTimersByTimeAsync(2000)
      expect(reloaded()).toHaveLength(2)

      emitSocketEvent(socket, 'task:update', { task_id: 'task-1' })
      expect(reloaded()).toHaveLength(3)
    })

    // The entity may be deleted, or out of reach, by the time it loads.
    describe.each([
      {
        event: 'asset:new',
        action: 'loadAsset',
        eventData: { asset_id: 'asset-1', project_id: 'prod-1' }
      },
      {
        event: 'asset:update',
        action: 'loadAsset',
        eventData: { asset_id: 'asset-1', project_id: 'prod-1' },
        map: assetsStore.cache.assetMap
      },
      {
        event: 'shot:new',
        action: 'loadShot',
        eventData: { shot_id: 'shot-1', project_id: 'prod-1' }
      },
      {
        event: 'shot:update',
        action: 'loadShot',
        eventData: { shot_id: 'shot-1', project_id: 'prod-1' },
        map: shotsStore.cache.shotMap
      },
      {
        event: 'sequence:new',
        action: 'loadSequence',
        eventData: { sequence_id: 'sequence-1', project_id: 'prod-1' }
      },
      {
        event: 'sequence:update',
        action: 'loadSequence',
        eventData: { sequence_id: 'sequence-1', project_id: 'prod-1' },
        map: sequencesStore.cache.sequenceMap
      },
      {
        event: 'edit:new',
        action: 'loadEdit',
        eventData: { edit_id: 'edit-1', project_id: 'prod-1' }
      },
      {
        event: 'edit:update',
        action: 'loadEdit',
        eventData: { edit_id: 'edit-1', project_id: 'prod-1' },
        map: editsStore.cache.editMap
      },
      {
        event: 'episode:new',
        action: 'loadEpisode',
        eventData: { episode_id: 'episode-1', project_id: 'prod-1' }
      },
      {
        event: 'episode:update',
        action: 'loadEpisode',
        eventData: { episode_id: 'episode-1', project_id: 'prod-1' },
        map: episodesStore.cache.episodeMap
      }
    ])('$event', ({ action, event, eventData, map }) => {
      const id =
        eventData.asset_id ||
        eventData.shot_id ||
        eventData.sequence_id ||
        eventData.edit_id ||
        eventData.episode_id

      afterEach(() => {
        map?.delete(id)
        vi.useRealTimers()
      })

      // The handlers of a new entity wait a second before loading it.
      const emitEvent = async load => {
        map?.set(id, { id })
        const { socket } = await mountApp({
          actions: { [action]: load },
          getters: {
            currentProduction: () => ({ id: 'prod-1' }),
            shotsLoadingKey: () => 'prod-1/'
          }
        })
        vi.useFakeTimers({ toFake: ['setTimeout'] })
        emitSocketEvent(socket, event, eventData)
        vi.advanceTimersByTime(1000)
      }

      it('logs a failed load', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const failure = Object.assign(new Error('HTTP 404'), { status: 404 })
        errors.markRequestFailure(failure)
        const load = vi.fn(() => Promise.reject(failure))

        const rejections = await recordUnhandledRejections(() =>
          emitEvent(load)
        )

        expect(load).toHaveBeenCalledTimes(1)
        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(failure)
      })

      it('leaves a bug in the load to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(() =>
          emitEvent(() => Promise.reject(bug))
        )

        expect(rejections).toEqual([bug])
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })
    })

    // Zou builds the files of an uploaded preview in a job, and announces
    // the statuses of the preview file on the socket.
    describe('preview file statuses', () => {
      const getters = { taskMap: () => new Map() }

      it('keeps the status a preview file update announces', async () => {
        const setStatus = vi.fn()
        const { socket } = await mountApp({
          getters,
          mutations: { SET_PREVIEW_FILE_STATUS: setStatus }
        })

        emitSocketEvent(socket, 'preview-file:update', {
          preview_file_id: 'p1',
          status: 'ready'
        })

        expect(setStatus).toHaveBeenCalledWith(expect.anything(), {
          previewFileId: 'p1',
          status: 'ready'
        })
      })

      it('ignores a preview file update without a status code', async () => {
        const setStatus = vi.fn()
        const { socket } = await mountApp({
          getters,
          mutations: { SET_PREVIEW_FILE_STATUS: setStatus }
        })

        emitSocketEvent(socket, 'preview-file:update', { preview_file_id: 'p1' })
        emitSocketEvent(socket, 'preview-file:update', {
          preview_file_id: 'p1',
          status: 'Ready'
        })

        expect(setStatus).not.toHaveBeenCalled()
      })

      it('registers the status of a new main preview before showing it', async () => {
        const register = vi.fn()
        const setPreview = vi.fn()
        const { socket } = await mountApp({
          actions: { registerPreviewFileStatuses: register },
          getters,
          mutations: { SET_PREVIEW: setPreview }
        })

        emitSocketEvent(socket, 'preview-file:set-main', {
          entity_id: 'e1',
          preview_file_id: 'p1',
          preview_file_status: 'processing'
        })

        expect(register).toHaveBeenCalledWith(expect.anything(), [
          { id: 'p1', status: 'processing' }
        ])
        expect(register.mock.invocationCallOrder[0]).toBeLessThan(
          setPreview.mock.invocationCallOrder[0]
        )
      })

      it('reads again the statuses still processing once the socket reconnects', async () => {
        const refresh = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { refreshProcessingPreviewFiles: refresh },
          getters
        })

        emitSocketEvent(socket, 'connect')

        expect(refresh).toHaveBeenCalled()
      })

      it('logs a failed read of the statuses after a reconnection', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const failure = Object.assign(new Error('HTTP 502'), { status: 502 })
        errors.markRequestFailure(failure)

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: {
              refreshProcessingPreviewFiles: () => Promise.reject(failure)
            },
            getters
          })
          emitSocketEvent(socket, 'connect')
        })

        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(failure)
      })

      it('leaves a bug in the read of the statuses to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: {
              refreshProcessingPreviewFiles: () => Promise.reject(bug)
            },
            getters
          })
          emitSocketEvent(socket, 'connect')
        })

        expect(rejections).toEqual([bug])
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })
    })

    // Zou announces a new production to every user, those out of its team
    // included, and refuses them its read.
    describe('new productions', () => {
      const getters = { productionMap: () => new Map() }

      it('checks whether a new production is shared with the user', async () => {
        const loadProduction = vi.fn(() => Promise.resolve())
        const loadProductionIfShared = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadProduction, loadProductionIfShared },
          getters
        })

        emitSocketEvent(socket, 'project:new', { project_id: 'prod-2' })
        await flushPromises()

        expect(loadProductionIfShared).toHaveBeenCalledWith(
          expect.anything(),
          'prod-2'
        )
        expect(loadProduction).not.toHaveBeenCalled()
      })

      it('logs a failed load of a new production', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const failure = new Error('Request has been terminated')
        errors.markRequestFailure(failure)

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadProductionIfShared: () => Promise.reject(failure) },
            getters
          })
          emitSocketEvent(socket, 'project:new', { project_id: 'prod-2' })
        })

        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(failure)
      })

      it('leaves a bug in the load of a new production to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadProductionIfShared: () => Promise.reject(bug) },
            getters
          })
          emitSocketEvent(socket, 'project:new', { project_id: 'prod-2' })
        })

        expect(rejections).toEqual([bug])
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })
    })

    // Zou announces a team role change as a project update, and the role
    // of the user on a production decides what its pages show.
    describe('production updates', () => {
      const getters = {
        productionMap: () => new Map([['prod-1', { id: 'prod-1' }]])
      }

      it('reloads the team roles once the production is reloaded', async () => {
        const reloadTeamRoles = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadProduction: () => Promise.resolve(), reloadTeamRoles },
          getters
        })

        emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
        await flushPromises()

        expect(reloadTeamRoles).toHaveBeenCalledWith(expect.anything(), 'prod-1')
      })

      // Zou sends one update per change, to every user: a batch of changes
      // must not cost one reload per change and per user.
      it('reloads a production at once, then once for the updates that follow', async () => {
        const loadProduction = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadProduction, reloadTeamRoles: () => Promise.resolve() },
          getters
        })
        vi.useFakeTimers()

        for (let update = 0; update < 5; update++) {
          emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
        }
        expect(loadProduction).toHaveBeenCalledTimes(1)

        await vi.advanceTimersByTimeAsync(2000)
        expect(loadProduction).toHaveBeenCalledTimes(2)

        await vi.advanceTimersByTimeAsync(2000)
        expect(loadProduction).toHaveBeenCalledTimes(2)

        emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
        expect(loadProduction).toHaveBeenCalledTimes(3)
      })

      // Deleted, or no longer shared with the user.
      it.each([403, 404])(
        'removes a production its reload gets a %i for, roles untouched',
        async status => {
          const reloadTeamRoles = vi.fn(() => Promise.resolve())
          const removeProduction = vi.fn()
          const refusal = Object.assign(new Error(`HTTP ${status}`), { status })
          errors.markRequestFailure(refusal)
          const { socket } = await mountApp({
            actions: {
              loadProduction: () => Promise.reject(refusal),
              reloadTeamRoles
            },
            getters,
            mutations: { REMOVE_PRODUCTION: removeProduction }
          })

          emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
          await flushPromises()

          expect(removeProduction).toHaveBeenCalledWith(expect.anything(), {
            id: 'prod-1'
          })
          expect(reloadTeamRoles).not.toHaveBeenCalled()
        }
      )

      // The user keeps access: the API client reports the failure.
      it.each([
        ['a server error', { status: 500 }],
        ['no response', {}]
      ])(
        'keeps a production its reload gets %s for',
        async (_label, failureFields) => {
          const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
          const removeProduction = vi.fn()
          const failure = Object.assign(
            new Error('Request has been terminated'),
            failureFields
          )
          errors.markRequestFailure(failure)

          const rejections = await recordUnhandledRejections(async () => {
            const { socket } = await mountApp({
              actions: { loadProduction: () => Promise.reject(failure) },
              getters,
              mutations: { REMOVE_PRODUCTION: removeProduction }
            })
            emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
          })

          expect(rejections).toEqual([])
          expect(removeProduction).not.toHaveBeenCalled()
          expect(consoleError).toHaveBeenCalledWith(failure)
        }
      )

      it('keeps a production its reload hits a bug for, left to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const removeProduction = vi.fn()
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadProduction: () => Promise.reject(bug) },
            getters,
            mutations: { REMOVE_PRODUCTION: removeProduction }
          })
          emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
        })

        expect(rejections).toEqual([bug])
        expect(removeProduction).not.toHaveBeenCalled()
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })

      // Zou announces the update of every production to every user: one
      // missing from the store may have just opened to them.
      it('checks whether a production missing from the store opened to the user', async () => {
        const loadProductionIfOpen = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadProductionIfOpen },
          getters
        })

        emitSocketEvent(socket, 'project:update', { project_id: 'prod-2' })
        await flushPromises()

        expect(loadProductionIfOpen).toHaveBeenCalledWith(
          expect.anything(),
          'prod-2'
        )
      })

      it('logs a failed check of a production missing from the store', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const failure = new Error('Request has been terminated')
        errors.markRequestFailure(failure)

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadProductionIfOpen: () => Promise.reject(failure) },
            getters
          })
          emitSocketEvent(socket, 'project:update', { project_id: 'prod-2' })
        })

        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(failure)
      })

      it('leaves a bug in the check of a production missing from the store to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadProductionIfOpen: () => Promise.reject(bug) },
            getters
          })
          emitSocketEvent(socket, 'project:update', { project_id: 'prod-2' })
        })

        expect(rejections).toEqual([bug])
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })

      it('leaves a bug in the team roles reload to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const removeProduction = vi.fn()
        const bug = new TypeError('team.find is not a function')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: {
              loadProduction: () => Promise.resolve(),
              reloadTeamRoles: () => Promise.reject(bug)
            },
            getters,
            mutations: { REMOVE_PRODUCTION: removeProduction }
          })
          emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
        })

        expect(rejections).toEqual([bug])
        expect(removeProduction).not.toHaveBeenCalled()
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })

      it('logs a failed team roles reload', async () => {
        const rejections = []
        const onRejection = reason => rejections.push(reason)
        process.on('unhandledRejection', onRejection)
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const removeProduction = vi.fn()
        const error = Object.assign(new Error('HTTP 500'), { status: 500 })
        errors.markRequestFailure(error)

        const { socket } = await mountApp({
          actions: {
            loadProduction: () => Promise.resolve(),
            reloadTeamRoles: () => Promise.reject(error)
          },
          getters,
          mutations: { REMOVE_PRODUCTION: removeProduction }
        })
        emitSocketEvent(socket, 'project:update', { project_id: 'prod-1' })
        await new Promise(resolve => setTimeout(resolve))
        process.off('unhandledRejection', onRejection)

        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(error)
        expect(removeProduction).not.toHaveBeenCalled()
      })
    })

    // Zou sends the column events of every production: the store reads the
    // column of the production on screen, the columns of another one once
    // it is on screen.
    describe('columns created or changed elsewhere', () => {
      it.each(['metadata-descriptor:new', 'metadata-descriptor:update'])(
        'hands %s of any production to the store',
        async event => {
          const refreshMetadataDescriptor = vi.fn()
          const { socket } = await mountApp({
            actions: { refreshMetadataDescriptor },
            getters: { currentProduction: () => ({ id: 'prod-1' }) }
          })

          emitSocketEvent(socket, event, {
            project_id: 'prod-2',
            metadata_descriptor_id: 'descriptor-1'
          })
          await flushPromises()

          expect(refreshMetadataDescriptor).toHaveBeenCalledWith(
            expect.anything(),
            { productionId: 'prod-2', descriptorId: 'descriptor-1' }
          )
        }
      )

      it('reads the columns changed off screen once the production is on screen', async () => {
        const production = ref({ id: 'prod-1' })
        const loadStaleMetadataDescriptors = vi.fn()
        await mountApp({
          actions: { loadStaleMetadataDescriptors },
          getters: { currentProduction: () => production.value }
        })
        expect(loadStaleMetadataDescriptors).not.toHaveBeenCalled()

        production.value = { id: 'prod-2' }
        await flushPromises()

        expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(1)
        expect(loadStaleMetadataDescriptors).toHaveBeenCalledWith(
          expect.anything(),
          'prod-2'
        )
      })

      it('logs a failed read of the columns', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const error = new Error('Bad Gateway')
        errors.markRequestFailure(error)
        const production = ref({ id: 'prod-1' })

        const rejections = await recordUnhandledRejections(async () => {
          await mountApp({
            actions: {
              loadStaleMetadataDescriptors: () => Promise.reject(error)
            },
            getters: { currentProduction: () => production.value }
          })
          production.value = { id: 'prod-2' }
          await flushPromises()
        })

        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(error)
      })
    })

    // A column deleted elsewhere, in this production or another one.
    it('drops a column deleted elsewhere', async () => {
      const dropMetadataDescriptor = vi.fn()
      const { socket } = await mountApp({ actions: { dropMetadataDescriptor } })

      emitSocketEvent(socket, 'metadata-descriptor:delete', {
        metadata_descriptor_id: 'descriptor-1',
        project_id: 'prod-2'
      })
      await flushPromises()

      expect(dropMetadataDescriptor).toHaveBeenCalledWith(expect.anything(), {
        productionId: 'prod-2',
        descriptorId: 'descriptor-1'
      })
    })

    // Zou sends no event again once the socket is back: the columns are read
    // again after a drop, not on the first connection.
    describe('socket drop', () => {
      const refreshProcessingPreviewFiles = () => Promise.resolve()

      it('reads the columns again once the socket comes back', async () => {
        const resyncMetadataDescriptors = vi.fn()
        const { socket } = await mountApp({
          actions: { refreshProcessingPreviewFiles, resyncMetadataDescriptors }
        })

        emitSocketEvent(socket, 'connect')
        await flushPromises()
        expect(resyncMetadataDescriptors).not.toHaveBeenCalled()

        emitSocketEvent(socket, 'disconnect', 'transport close')
        emitSocketEvent(socket, 'connect')
        emitSocketEvent(socket, 'connect')
        await flushPromises()
        expect(resyncMetadataDescriptors).toHaveBeenCalledTimes(1)
      })

      // The context loads before the socket connects, which may take several
      // attempts.
      it('reads the columns again after a failed first connection', async () => {
        const resyncMetadataDescriptors = vi.fn()
        const { socket } = await mountApp({
          actions: { refreshProcessingPreviewFiles, resyncMetadataDescriptors }
        })

        emitSocketEvent(socket, 'connect_error', new Error('xhr poll error'))
        emitSocketEvent(socket, 'connect')
        await flushPromises()

        expect(resyncMetadataDescriptors).toHaveBeenCalledTimes(1)
      })

      // The socket may come back before the API: the catch-up is made again,
      // a little later each time, while the production stays on screen.
      describe('failed catch-up', () => {
        const error = new Error('Bad Gateway')
        const production = ref(null)

        beforeEach(() => {
          errors.markRequestFailure(error)
          production.value = { id: 'prod-1' }
          vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
        })

        afterEach(() => vi.useRealTimers())

        const mountAfterDrop = async (
          loadStaleMetadataDescriptors,
          failure = error
        ) => {
          const { socket } = await mountApp({
            actions: {
              loadStaleMetadataDescriptors,
              refreshProcessingPreviewFiles,
              resyncMetadataDescriptors: () => Promise.reject(failure)
            },
            getters: { currentProduction: () => production.value }
          })
          emitSocketEvent(socket, 'disconnect', 'transport close')
          emitSocketEvent(socket, 'connect')
          await flushPromises()
          return socket
        }

        it('reads the columns again a little later', async () => {
          const loadStaleMetadataDescriptors = vi.fn()
          await mountAfterDrop(loadStaleMetadataDescriptors)
          await vi.advanceTimersByTimeAsync(1999)
          expect(loadStaleMetadataDescriptors).not.toHaveBeenCalled()

          await vi.advanceTimersByTimeAsync(1)

          expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(1)
          expect(loadStaleMetadataDescriptors).toHaveBeenCalledWith(
            expect.anything(),
            'prod-1'
          )
        })

        it('waits longer each time, and logs the failure of the last read', async () => {
          const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
          const loadStaleMetadataDescriptors = vi.fn(() =>
            Promise.reject(error)
          )
          const delays = [2000, 4000, 8000, 16000, 32000]

          const rejections = await recordUnhandledRejections(async () => {
            await mountAfterDrop(loadStaleMetadataDescriptors)
            for (const [index, delay] of delays.entries()) {
              await vi.advanceTimersByTimeAsync(delay - 1)
              expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(index)
              await vi.advanceTimersByTimeAsync(1)
              await flushPromises()
              expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(
                index + 1
              )
              expect(consoleError).toHaveBeenCalledTimes(
                index === delays.length - 1 ? 1 : 0
              )
            }
            await vi.advanceTimersByTimeAsync(64000)
          })

          expect(rejections).toEqual([])
          expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(5)
          expect(consoleError).toHaveBeenCalledWith(error)
        })

        it('reads no more once another production is on screen', async () => {
          const loadStaleMetadataDescriptors = vi.fn()
          await mountAfterDrop(loadStaleMetadataDescriptors)

          production.value = { id: 'prod-2' }
          await flushPromises()
          await vi.advanceTimersByTimeAsync(2000)

          expect(
            loadStaleMetadataDescriptors.mock.calls.map(([, id]) => id)
          ).toEqual(['prod-2'])
        })

        it('starts over once the socket comes back again', async () => {
          const loadStaleMetadataDescriptors = vi.fn()
          const socket = await mountAfterDrop(loadStaleMetadataDescriptors)
          await vi.advanceTimersByTimeAsync(1000)

          emitSocketEvent(socket, 'disconnect', 'transport close')
          emitSocketEvent(socket, 'connect')
          await flushPromises()
          await vi.advanceTimersByTimeAsync(1999)
          expect(loadStaleMetadataDescriptors).not.toHaveBeenCalled()

          await vi.advanceTimersByTimeAsync(1)
          expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(1)
        })

        // The store gives the read still running to the next catch-up.
        it('reads again in one series once the socket comes back during a read', async () => {
          let failRead
          const read = new Promise((resolve, reject) => {
            failRead = reject
          })
          const loadStaleMetadataDescriptors = vi
            .fn()
            .mockReturnValueOnce(read)
            .mockResolvedValue()
          const { socket } = await mountApp({
            actions: {
              loadStaleMetadataDescriptors,
              refreshProcessingPreviewFiles,
              resyncMetadataDescriptors: vi
                .fn()
                .mockRejectedValueOnce(error)
                .mockReturnValue(read)
            },
            getters: { currentProduction: () => production.value }
          })
          emitSocketEvent(socket, 'disconnect', 'transport close')
          emitSocketEvent(socket, 'connect')
          await flushPromises()
          await vi.advanceTimersByTimeAsync(2000)
          expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(1)

          emitSocketEvent(socket, 'disconnect', 'transport close')
          emitSocketEvent(socket, 'connect')
          failRead(error)
          await flushPromises()
          await vi.advanceTimersByTimeAsync(64000)

          expect(loadStaleMetadataDescriptors).toHaveBeenCalledTimes(2)
        })

        // A production deleted, or out of reach, answers the same each time.
        it('reads no more a production Zou no longer serves', async () => {
          const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
          const missing = Object.assign(new Error('Not Found'), {
            status: 404
          })
          errors.markRequestFailure(missing)
          const loadStaleMetadataDescriptors = vi.fn()

          await mountAfterDrop(loadStaleMetadataDescriptors, missing)
          await vi.advanceTimersByTimeAsync(64000)

          expect(loadStaleMetadataDescriptors).not.toHaveBeenCalled()
          expect(consoleError).toHaveBeenCalledWith(missing)
        })

        it('leaves a bug in the catch-up to Sentry', async () => {
          const bug = new TypeError('Cannot read properties of undefined')
          const loadStaleMetadataDescriptors = vi.fn()

          const rejections = await recordUnhandledRejections(() =>
            mountAfterDrop(loadStaleMetadataDescriptors, bug)
          )
          await vi.advanceTimersByTimeAsync(64000)

          expect(rejections).toEqual([bug])
          expect(loadStaleMetadataDescriptors).not.toHaveBeenCalled()
        })
      })
    })

    // The record may be deleted, or the network down, by the time it
    // reloads: the API client reports the failed request, the handler only
    // logs it. Anything else is a bug, left to Sentry.
    describe('reference reloads', () => {
      const emptyMap = () => new Map()
      const mapWith = id => () => new Map([[id, { id }]])
      const currentProduction = () => ({ id: 'prod-1' })

      const reloads = [
        {
          event: 'department:new',
          eventData: { department_id: 'department-1' },
          action: 'loadDepartment',
          payload: 'department-1',
          getters: { departmentMap: emptyMap }
        },
        {
          event: 'department:update',
          eventData: { department_id: 'department-1' },
          action: 'loadDepartment',
          payload: 'department-1',
          getters: {}
        },
        {
          event: 'task-type:new',
          eventData: { task_type_id: 'task-type-1' },
          action: 'loadTaskType',
          payload: 'task-type-1',
          getters: { taskTypeMap: emptyMap }
        },
        {
          event: 'task-status:new',
          eventData: { task_status_id: 'task-status-1' },
          action: 'loadTaskStatus',
          payload: 'task-status-1',
          getters: { taskStatusMap: emptyMap }
        },
        {
          event: 'task-status:update',
          eventData: { task_status_id: 'task-status-1' },
          action: 'loadTaskStatus',
          payload: 'task-status-1',
          getters: { taskStatusMap: mapWith('task-status-1') }
        },
        {
          event: 'asset-type:new',
          eventData: { asset_type_id: 'asset-type-1' },
          action: 'loadAssetType',
          payload: 'asset-type-1',
          getters: { assetTypeMap: emptyMap }
        },
        {
          event: 'asset-type:update',
          eventData: { asset_type_id: 'asset-type-1' },
          action: 'loadAssetType',
          payload: 'asset-type-1',
          getters: { assetTypeMap: mapWith('asset-type-1') }
        },
        {
          event: 'person:new',
          eventData: { person_id: 'person-1' },
          action: 'loadPerson',
          payload: 'person-1',
          getters: { personMap: emptyMap }
        },
        {
          event: 'person:update',
          eventData: { person_id: 'person-1' },
          action: 'loadPerson',
          payload: 'person-1',
          getters: { personMap: mapWith('person-1') }
        },
        {
          event: 'metadata-descriptor:new',
          eventData: {
            project_id: 'prod-1',
            metadata_descriptor_id: 'descriptor-1'
          },
          action: 'refreshMetadataDescriptor',
          payload: { productionId: 'prod-1', descriptorId: 'descriptor-1' },
          getters: { currentProduction }
        },
        {
          event: 'metadata-descriptor:update',
          eventData: {
            project_id: 'prod-1',
            metadata_descriptor_id: 'descriptor-1'
          },
          action: 'refreshMetadataDescriptor',
          payload: { productionId: 'prod-1', descriptorId: 'descriptor-1' },
          getters: { currentProduction }
        },
        {
          event: 'organisation:update',
          eventData: {},
          action: 'getOrganisation',
          payload: undefined,
          getters: { isCurrentUserAdmin: () => true }
        }
      ]

      it.each(reloads)(
        'logs a failed reload after $event',
        async ({ event, eventData, action, payload, getters }) => {
          const rejections = []
          const onRejection = reason => rejections.push(reason)
          process.on('unhandledRejection', onRejection)
          const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
          const error = new Error('Request has been terminated')
          errors.markRequestFailure(error)
          const reload = vi.fn(() => Promise.reject(error))

          const { socket } = await mountApp({
            actions: { [action]: reload },
            getters
          })
          emitSocketEvent(socket, event, eventData)
          await new Promise(resolve => setTimeout(resolve))
          process.off('unhandledRejection', onRejection)

          expect(reload).toHaveBeenCalledWith(expect.anything(), payload)
          expect(rejections).toEqual([])
          expect(consoleError).toHaveBeenCalledWith(error)
        }
      )

      it.each(reloads)(
        'leaves a bug in the reload after $event to Sentry',
        async ({ event, eventData, action, getters }) => {
          const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
          const bug = new TypeError('Cannot read properties of undefined')

          const rejections = await recordUnhandledRejections(async () => {
            const { socket } = await mountApp({
              actions: { [action]: () => Promise.reject(bug) },
              getters
            })
            emitSocketEvent(socket, event, eventData)
          })

          expect(rejections).toEqual([bug])
          expect(consoleError).not.toHaveBeenCalledWith(bug)
        }
      )
    })

    // Someone else's comment moves the task it names, its todo included.
    describe('new comments', () => {
      const task = { id: 'task-1' }
      const getters = {
        isOwnCommentEvent: () => () => false,
        isSavingCommentPreview: () => false,
        taskComments: () => ({}),
        taskMap: () => new Map([['task-1', task]]),
        todoMap: () => new Map([['task-1', task]])
      }
      const newComment = {
        comment_id: 'comment-9',
        task_id: 'task-1',
        task_status_id: 'status-wip'
      }

      it('reloads a new comment of a todo with its task', async () => {
        const loadComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({ actions: { loadComment }, getters })

        emitSocketEvent(socket, 'comment:new', newComment)

        expect(loadComment).toHaveBeenCalledWith(expect.anything(), {
          commentId: 'comment-9',
          taskId: 'task-1'
        })
      })

      // A production page replaces the task map, which then lacks the todos.
      it('reloads a new comment of a todo missing from the task map', async () => {
        const loadComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadComment },
          getters: { ...getters, taskMap: () => new Map() }
        })

        emitSocketEvent(socket, 'comment:new', newComment)

        expect(loadComment).toHaveBeenCalledWith(expect.anything(), {
          commentId: 'comment-9',
          taskId: 'task-1'
        })
      })

      // The answer of Zou brings the comment the tab posted: its event has
      // nothing to reload, nor a status to move.
      it('leaves alone the comment the tab itself posted', async () => {
        const loadComment = vi.fn(() => Promise.resolve())
        const updateTask = vi.fn()
        const { socket } = await mountApp({
          actions: { loadComment },
          getters: { ...getters, isOwnCommentEvent: () => () => true },
          mutations: { UPDATE_TASK: updateTask }
        })

        emitSocketEvent(socket, 'comment:new', newComment)

        expect(loadComment).not.toHaveBeenCalled()
        expect(updateTask).not.toHaveBeenCalled()
      })

      it('leaves a bug in the reload to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadComment: () => Promise.reject(bug) },
            getters
          })
          emitSocketEvent(socket, 'comment:new', newComment)
        })

        expect(rejections).toEqual([bug])
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })
    })

    // As Zou's check_comment_access: an admin, a supervisor or a manager of
    // the production reads every comment; a client, the comments flagged for
    // it and those of clients, only its own on a production that isolates
    // them; anyone else, every comment but those of clients. The reload of
    // any other answers 403.
    describe('comments the user cannot read', () => {
      const artist = { id: 'person-artist', role: 'user' }
      const otherClient = { id: 'person-client', role: 'client' }
      const me = { id: 'person-me', role: 'client' }
      const task = { id: 'task-1' }
      const readerGetters = ({
        role = 'client',
        globalRole = role,
        isolated = false,
        comments = []
      } = {}) => ({
        currentUserRoleForProduction: () => () => role,
        // The page has no production: the route role is the global one.
        isCurrentUserClient: () => globalRole === 'client',
        isOwnCommentEvent: () => () => false,
        isPublishingComment: () => () => false,
        isSavingCommentPreview: () => false,
        personMap: () =>
          new Map([artist, otherClient, me].map(person => [person.id, person])),
        productionMap: () =>
          new Map([
            ['production-1', { id: 'production-1', is_clients_isolated: isolated }]
          ]),
        taskComments: () => ({ 'task-1': comments }),
        taskMap: () => new Map([['task-1', task]]),
        teamRolesForProduction: () => () => ({}),
        todoMap: () => new Map(),
        user: () => ({ ...me, role: globalRole })
      })
      const eventBy = (personId, extra = {}) => ({
        comment_id: 'comment-9',
        task_id: 'task-1',
        project_id: 'production-1',
        person_id: personId,
        for_client: false,
        task_status_id: 'status-wip',
        ...extra
      })
      const mountReader = async getters => {
        const loadComment = vi.fn(() => Promise.resolve())
        const updateTask = vi.fn()
        const { socket } = await mountApp({
          actions: { loadComment },
          getters,
          mutations: { UPDATE_TASK: updateTask }
        })
        return { socket, loadComment, updateTask }
      }

      it('leaves alone the update of an internal comment', async () => {
        const { socket, loadComment } = await mountReader(readerGetters())

        emitSocketEvent(socket, 'comment:update', eventBy(artist.id))

        expect(loadComment).not.toHaveBeenCalled()
      })

      it('moves only the status of the task for a new internal comment', async () => {
        const { socket, loadComment, updateTask } = await mountReader(
          readerGetters()
        )

        emitSocketEvent(socket, 'comment:new', eventBy(artist.id))

        expect(loadComment).not.toHaveBeenCalled()
        expect(updateTask).toHaveBeenCalledWith(expect.anything(), {
          task,
          taskStatusId: 'status-wip'
        })
      })

      it('reloads the comments flagged for it and those of clients', async () => {
        const { socket, loadComment } = await mountReader(readerGetters())

        emitSocketEvent(
          socket,
          'comment:update',
          eventBy(artist.id, { for_client: true })
        )
        emitSocketEvent(socket, 'comment:update', eventBy(otherClient.id))

        expect(loadComment).toHaveBeenCalledTimes(2)
      })

      it('leaves alone the comments of other clients on an isolating production', async () => {
        const { socket, loadComment } = await mountReader(
          readerGetters({ isolated: true })
        )

        emitSocketEvent(socket, 'comment:update', eventBy(otherClient.id))
        emitSocketEvent(socket, 'comment:update', eventBy(me.id))

        expect(loadComment).toHaveBeenCalledTimes(1)
      })

      // A manager may have turned the flag off: the reload blanks the comment.
      it('reloads a comment it holds and may no longer read', async () => {
        const { socket, loadComment } = await mountReader(
          readerGetters({ comments: [{ id: 'comment-9' }] })
        )

        emitSocketEvent(socket, 'comment:update', eventBy(artist.id))

        expect(loadComment).toHaveBeenCalled()
      })

      // Zou reads a null flag, left by older rows, as false.
      it('leaves alone an internal comment whose flag is null', async () => {
        const { socket, loadComment } = await mountReader(readerGetters())

        emitSocketEvent(
          socket,
          'comment:update',
          eventBy(artist.id, { for_client: null })
        )

        expect(loadComment).not.toHaveBeenCalled()
      })

      it('reloads when Zou leaves the author out of the event', async () => {
        const { socket, loadComment } = await mountReader(readerGetters())
        const event = eventBy(artist.id)
        delete event.person_id
        delete event.for_client

        emitSocketEvent(socket, 'comment:update', event)

        expect(loadComment).toHaveBeenCalled()
      })

      // Zou checks the role on the production of the task, not on the page.
      it('reads every comment as a supervisor of the production', async () => {
        const { socket, loadComment } = await mountReader(
          readerGetters({ role: 'supervisor', globalRole: 'client' })
        )

        emitSocketEvent(socket, 'comment:update', eventBy(artist.id))

        expect(loadComment).toHaveBeenCalled()
      })

      it('reads the comments of clients as a supervisor', async () => {
        const { socket, loadComment } = await mountReader(
          readerGetters({ role: 'supervisor' })
        )

        emitSocketEvent(socket, 'comment:update', eventBy(otherClient.id))

        expect(loadComment).toHaveBeenCalled()
      })

      it('reads every comment as an admin', async () => {
        const { socket, loadComment } = await mountReader(
          readerGetters({ globalRole: 'admin' })
        )

        emitSocketEvent(socket, 'comment:update', eventBy(artist.id))

        expect(loadComment).toHaveBeenCalled()
      })

      it('leaves the comments of clients alone for an artist', async () => {
        const { socket, loadComment, updateTask } = await mountReader(
          readerGetters({ role: 'user' })
        )

        emitSocketEvent(socket, 'comment:new', eventBy(otherClient.id))
        emitSocketEvent(socket, 'comment:update', eventBy(otherClient.id))

        expect(loadComment).not.toHaveBeenCalled()
        expect(updateTask).toHaveBeenCalled()
      })

      it('reads the comments of the studio as an artist', async () => {
        const { socket, loadComment } = await mountReader(
          readerGetters({ role: 'user' })
        )

        emitSocketEvent(socket, 'comment:update', eventBy(artist.id))

        expect(loadComment).toHaveBeenCalled()
      })
    })

    // Zou names the task of a comment update: App.vue reloads the comment
    // for the panels that hold the comments of that task.
    describe('comment updates', () => {
      const comment = { id: 'comment-1' }
      const getters = {
        isPublishingComment: () => () => false,
        taskComments: () => ({ 'task-1': [comment] }),
        taskMap: () => new Map([['task-1', { id: 'task-1' }]])
      }
      const updateOf = commentId => ({
        comment_id: commentId,
        task_id: 'task-1'
      })
      const isPosted = commentId => commentId === 'comment-new'

      it('reloads an updated comment of a task whose comments are loaded', async () => {
        const loadComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({ actions: { loadComment }, getters })

        emitSocketEvent(socket, 'comment:update', updateOf('comment-1'))

        expect(loadComment).toHaveBeenCalledWith(expect.anything(), {
          commentId: 'comment-1'
        })
      })

      // A list holds no comment, and a client may not read every comment of
      // the tasks it lists.
      it('leaves alone the comments of a task that is only listed', async () => {
        const loadComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadComment },
          getters: { ...getters, taskComments: () => ({}) }
        })

        emitSocketEvent(socket, 'comment:update', updateOf('comment-1'))

        expect(loadComment).not.toHaveBeenCalled()
      })

      // The comment the user posts with a preview joins the store once the
      // previews are uploaded: reloaded before, it would list them with no
      // revision.
      it('waits for the comment the user is posting with a preview', async () => {
        const loadComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadComment },
          getters: { ...getters, isPublishingComment: () => isPosted }
        })

        emitSocketEvent(socket, 'comment:update', updateOf('comment-new'))

        expect(loadComment).not.toHaveBeenCalled()
      })

      it('reloads the other comments during an upload', async () => {
        const loadComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { loadComment },
          getters: { ...getters, isPublishingComment: () => isPosted }
        })

        emitSocketEvent(socket, 'comment:update', updateOf('comment-1'))

        expect(loadComment).toHaveBeenCalled()
      })

      // A manager may have turned the client visibility off.
      it('blanks a comment the user can no longer read', async () => {
        const refusal = { status: 403 }
        errors.markRequestFailure(refusal)
        const blank = vi.fn()
        const { socket } = await mountApp({
          actions: { loadComment: () => Promise.reject(refusal) },
          getters,
          mutations: { BLANK_COMMENT_CONTENT: blank }
        })

        emitSocketEvent(socket, 'comment:update', updateOf('comment-1'))
        await flushPromises()

        expect(blank).toHaveBeenCalledWith(expect.anything(), {
          taskId: 'task-1',
          commentId: 'comment-1'
        })
      })

      it('leaves a bug in the reload to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadComment: () => Promise.reject(bug) },
            getters
          })
          emitSocketEvent(socket, 'comment:update', updateOf('comment-1'))
        })

        expect(rejections).toEqual([bug])
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })
    })

    // Zou names no task in a comment deletion: the store finds the task whose
    // last comment the todos and the person tasks show.
    describe('comment deletions', () => {
      const deletion = { comment_id: 'comment-9', project_id: 'production-1' }

      it('reloads the last comment of the task of a deleted comment', async () => {
        const reloadTaskLastComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { reloadTaskLastComment },
          getters: {}
        })

        emitSocketEvent(socket, 'comment:delete', deletion)

        expect(reloadTaskLastComment).toHaveBeenCalledWith(expect.anything(), {
          commentId: 'comment-9'
        })
      })

      it('reloads the last comment of the task Zou names', async () => {
        const reloadTaskLastComment = vi.fn(() => Promise.resolve())
        const { socket } = await mountApp({
          actions: { reloadTaskLastComment },
          getters: {}
        })

        emitSocketEvent(socket, 'comment:delete', {
          ...deletion,
          task_id: 'task-1'
        })

        expect(reloadTaskLastComment).toHaveBeenCalledWith(expect.anything(), {
          commentId: 'comment-9',
          taskId: 'task-1'
        })
      })

      // The task may be deleted, or out of reach, by the time it reloads.
      it('logs a failed reload', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const refusal = Object.assign(new Error('HTTP 404'), { status: 404 })
        errors.markRequestFailure(refusal)

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { reloadTaskLastComment: () => Promise.reject(refusal) },
            getters: {}
          })
          emitSocketEvent(socket, 'comment:delete', deletion)
        })

        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(refusal)
      })

      it('leaves a bug in the reload to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { reloadTaskLastComment: () => Promise.reject(bug) },
            getters: {}
          })
          emitSocketEvent(socket, 'comment:delete', deletion)
        })

        expect(rejections).toEqual([bug])
        expect(consoleError).not.toHaveBeenCalledWith(bug)
      })
    })
  })

  // English speakers read the vocabulary of the production type: the
  // overlays rename the shots to NFTs or to maps.
  describe('English overlays', () => {
    afterEach(async () => {
      // First: a mounted App would apply the vocabulary again over the reset.
      wrapper?.unmount()
      wrapper = null
      await lang.setLocale('en_US')
      localStorage.removeItem('locale')
      i18n.global.fallbackWarn = true
    })

    it('follows the type of the current production', async () => {
      const production = ref({ id: 'production-1', production_style: 'nft' })
      await mountApp({
        actions: { loadStaleMetadataDescriptors: () => Promise.resolve() },
        getters: {
          currentProduction: () => production.value,
          user: () => ({ id: 'user-1', locale: 'en_US' })
        }
      })

      expect(i18n.global.locale.value).toBe('en_nft')
      expect(i18n.global.fallbackWarn).toBe(false)

      production.value = { id: 'production-2', production_style: '2d' }
      await flushPromises()

      expect(i18n.global.locale.value).toBe('en')
      expect(i18n.global.fallbackWarn).toBe(true)
    })

    // The guest of a shared playlist.
    it('follows it without a user too', async () => {
      await mountApp({
        getters: {
          currentProduction: () => ({
            id: 'production-1',
            production_style: 'nft'
          }),
          user: () => null
        }
      })

      expect(i18n.global.locale.value).toBe('en_nft')
    })

    // A guard applies the language of the user on the way through the home page.
    it('stays when the language is applied again', async () => {
      await mountApp({
        getters: {
          currentProduction: () => ({
            id: 'production-1',
            production_style: 'nft'
          }),
          user: () => ({ id: 'user-1', locale: 'en_US' })
        }
      })

      await lang.setLocale('en_US')
      await flushPromises()

      expect(i18n.global.locale.value).toBe('en_nft')
    })

    it('comes back after a language tried in the profile', async () => {
      await mountApp({
        getters: {
          currentProduction: () => ({
            id: 'production-1',
            production_style: 'nft'
          }),
          user: () => ({ id: 'user-1', locale: 'en_US' })
        }
      })

      await lang.applyLocale('fr_FR')
      await flushPromises()
      expect(i18n.global.locale.value).toBe('fr')

      await lang.applyLocale('en_US')
      await flushPromises()

      expect(i18n.global.locale.value).toBe('en_nft')
    })

    it('leaves the language of a user who reads another one', async () => {
      await lang.setLocale('fr_FR')

      await mountApp({
        getters: {
          currentProduction: () => ({
            id: 'production-1',
            production_style: 'nft'
          }),
          user: () => ({ id: 'user-1', locale: 'fr_FR' })
        }
      })

      expect(i18n.global.locale.value).toBe('fr')
    })

    it('leaves the language the app started in before login', async () => {
      await lang.setLocale('fr_FR')

      await mountApp({
        getters: { currentProduction: () => null, user: () => null }
      })

      expect(i18n.global.locale.value).toBe('fr')
    })
  })

  describe('page language', () => {
    afterEach(async () => {
      await lang.setLocale('en_US')
      localStorage.removeItem('locale')
      localStorage.removeItem('studio-locale')
    })

    it('declares the language in use', async () => {
      await mountApp({})
      expect(document.documentElement.lang).toBe('en')

      await lang.setLocale('zh_Hant_TW')
      await flushPromises()

      expect(document.documentElement.lang).toBe('zh-tw')
    })

    it('takes the language of the studio for a browser in none of Kitsu', async () => {
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['sv-SE'])
      await loadLocaleMessages('de')

      await mountApp({
        actions: { setMainConfig: () => ({ default_locale: 'de_DE' }) }
      })
      await flushPromises()

      expect(document.documentElement.lang).toBe('de')
    })

    // vue-i18n warns on the way to its English fallback.
    it('declares English for a language of the studio Kitsu lacks', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['sv-SE'])

      await mountApp({
        actions: { setMainConfig: () => ({ default_locale: 'sv_SE' }) }
      })
      await flushPromises()

      expect(document.documentElement.lang).toBe('en')
    })

    it('declares English on leaving a language Kitsu has for one it lacks', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      await mountApp({})
      await lang.setLocale('de_DE')
      await flushPromises()
      expect(document.documentElement.lang).toBe('de')

      await lang.setLocale('sv_SE')
      await flushPromises()

      expect(document.documentElement.lang).toBe('en')
    })
  })

  describe('settings of the public pages', () => {
    const hasSettings = () =>
      wrapper.findComponent(PublicPageSettings).exists()

    it('shows them to a visitor', async () => {
      await mountApp({ path: '/reset-password' })
      expect(hasSettings()).toBe(true)
    })

    it('leaves them out of the other pages', async () => {
      await mountApp({ path: '/' })
      expect(hasSettings()).toBe(false)
    })

    // The language of a known user comes from the profile.
    it('leaves them out for a known user', async () => {
      await mountApp({
        getters: { user: () => ({ id: 'user-1', locale: 'en_US' }) },
        path: '/reset-password'
      })
      expect(hasSettings()).toBe(false)
    })

    it('leaves them out of the loading screen', async () => {
      await mountApp({
        getters: { isDataLoading: () => true },
        path: '/reset-password'
      })
      expect(hasSettings()).toBe(false)
    })
  })

  // The config answers after the first render: the theme the page starts
  // with comes from the storage.
  describe('dark theme', () => {
    let answerConfig = null

    const mountWithTheme = async () => {
      const isDarkTheme = ref(false)
      const config = new Promise(resolve => {
        answerConfig = async answer => {
          resolve(answer)
          await flushPromises()
        }
      })
      await mountApp({
        actions: { setMainConfig: () => config },
        getters: { isDarkTheme: () => isDarkTheme.value },
        mutations: {
          TOGGLE_DARK_THEME: (state, isDark) => {
            isDarkTheme.value = isDark
          }
        }
      })
    }

    afterEach(() => {
      localStorage.removeItem('dark-theme')
      localStorage.removeItem('dark-theme-default')
      window.history.replaceState(null, '', '/')
    })

    it('starts in the theme the user chose, before the config answers', async () => {
      localStorage.setItem('dark-theme', 'true')
      await mountWithTheme()

      expect(wrapper.classes('dark')).toBe(true)
    })

    it('starts in the studio default the last config left', async () => {
      localStorage.setItem('dark-theme-default', 'true')
      await mountWithTheme()

      expect(wrapper.classes('dark')).toBe(true)
    })

    it('remembers the studio default of the config for the next start', async () => {
      await mountWithTheme()
      await answerConfig({ dark_theme_by_default: true })

      expect(wrapper.classes('dark')).toBe(true)
      expect(localStorage.getItem('dark-theme-default')).toBe('true')
    })

    it('keeps the theme the user chose over the studio default', async () => {
      localStorage.setItem('dark-theme', 'false')
      await mountWithTheme()
      await answerConfig({ dark_theme_by_default: true })

      expect(wrapper.classes('dark')).toBe(false)
    })

    it('keeps the theme it started with when the config fails', async () => {
      localStorage.setItem('dark-theme-default', 'true')
      await mountWithTheme()
      // setMainConfig answers an empty config when its request fails.
      await answerConfig({})

      expect(wrapper.classes('dark')).toBe(true)
      expect(localStorage.getItem('dark-theme-default')).toBe('true')
    })

    it('keeps a shared playlist dark when the config answers after it', async () => {
      window.history.replaceState(null, '', '/playlists/shared/token-1')
      await mountWithTheme()
      expect(wrapper.classes('dark')).toBe(true)

      await answerConfig({ dark_theme_by_default: false })

      expect(wrapper.classes('dark')).toBe(true)
    })

    it('starts light when the browser blocks the storage', async () => {
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('The operation is insecure.')
      })
      await mountWithTheme()
      await answerConfig({})

      expect(wrapper.classes('dark')).toBe(false)
    })
  })

  describe('logout in another tab', () => {
    const mountTab = async path => {
      const channel = {}
      vi.spyOn(auth, 'getBroadcastChannel').mockReturnValue(channel)
      const logoutLocal = vi.fn()
      const { router } = await mountApp({ actions: { logoutLocal }, path })
      const receiveLogout = async () => {
        await channel.onmessage({ data: 'logout' })
        await flushPromises()
      }
      return { logoutLocal, receiveLogout, router }
    }

    afterEach(() => {
      window.history.replaceState(null, '', '/')
    })

    it('purges the tab from the login page', async () => {
      const { logoutLocal, receiveLogout, router } = await mountTab('/')

      await receiveLogout()

      expect(router.currentRoute.value.name).toBe('login')
      expect(router.currentRoute.value.query).toEqual({ redirect: '/' })
      expect(logoutLocal).toHaveBeenCalled()
    })

    it('leaves a shared playlist tab alone', async () => {
      window.history.replaceState(null, '', '/playlists/shared/token-1')
      const { logoutLocal, receiveLogout, router } = await mountTab(
        '/playlists/shared/token-1'
      )

      await receiveLogout()

      expect(router.currentRoute.value.name).toBe('shared-playlist')
      expect(logoutLocal).not.toHaveBeenCalled()
    })
  })

  describe('top-level page swap', () => {
    // Vue looks past a single teleport for the node after a page: once the
    // preview modal had moved past the teleports of the shot cells, the
    // next page went before a node the leaving page removed.
    it('shows the next page after a preview over teleported cells', async () => {
      const LoginPage = { template: '<div class="login-page" />' }
      const ShotsPage = {
        components: { MetadataTextarea },
        template: `
          <div class="shots-page">
            <metadata-textarea model-value="Long text" />
            <metadata-textarea model-value="Long text" />
          </div>
        `
      }
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/login', component: LoginPage },
          { path: '/shots', component: ShotsPage }
        ]
      })
      router.push('/login')
      await router.isReady()
      const store = createStore({
        state: { previewFileId: null },
        actions: { setMainConfig: () => ({}) },
        getters: { previewFileIdToShow: state => state.previewFileId },
        mutations: {
          HIDE_PREVIEW_FILE: state => {
            state.previewFileId = null
          },
          SHOW_PREVIEW_FILE: (state, previewFileId) => {
            state.previewFileId = previewFileId
          },
          TOGGLE_DARK_THEME: () => {}
        }
      })
      const renderErrors = []
      const warnings = []
      wrapper = mount(App, {
        attachTo: document.body,
        global: {
          config: {
            errorHandler: error => renderErrors.push(error),
            warnHandler: message => warnings.push(message)
          },
          plugins: [
            router,
            store,
            {
              install: app => {
                app.config.globalProperties.$socket = { on: vi.fn() }
              }
            }
          ],
          stubs: { PreviewModal: true }
        }
      })
      await router.push('/shots')
      await flushPromises()
      store.commit('SHOW_PREVIEW_FILE', 'preview-1')
      await flushPromises()
      store.commit('HIDE_PREVIEW_FILE')
      await flushPromises()

      await router.push('/login')
      await flushPromises()

      expect(renderErrors.map(String)).toEqual([])
      expect(warnings).toEqual([])
      expect(document.querySelector('.login-page')).not.toBeNull()
    })
  })
})

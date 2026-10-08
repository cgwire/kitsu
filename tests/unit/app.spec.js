import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

import errors from '@/lib/errors'

import App from '@/App.vue'

let wrapper = null

const mountApp = async ({ actions, getters, mutations }) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
  router.push('/')
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
  return { socket }
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

      const { socket } = await mountApp({
        actions: { loadTask: () => Promise.reject(error) },
        getters: { taskMap: () => new Map([['task-1', { id: 'task-1' }]]) }
      })
      emitSocketEvent(socket, 'task:update', { task_id: 'task-1' })
      // Node reports a rejected promise once the microtask queue has drained.
      await new Promise(resolve => setTimeout(resolve))
      process.off('unhandledRejection', onRejection)

      expect(rejections).toEqual([])
      expect(consoleError).toHaveBeenCalledWith(error)
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

      it('removes a production it can no longer read, roles untouched', async () => {
        const reloadTeamRoles = vi.fn(() => Promise.resolve())
        const removeProduction = vi.fn()
        const { socket } = await mountApp({
          actions: {
            loadProduction: () => Promise.reject(new Error('HTTP 403')),
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
      })

      it('logs a failed team roles reload', async () => {
        const rejections = []
        const onRejection = reason => rejections.push(reason)
        process.on('unhandledRejection', onRejection)
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const removeProduction = vi.fn()
        const error = new Error('HTTP 500')

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
          payload: 'descriptor-1',
          getters: { currentProduction }
        },
        {
          event: 'metadata-descriptor:update',
          eventData: {
            project_id: 'prod-1',
            metadata_descriptor_id: 'descriptor-1'
          },
          action: 'refreshMetadataDescriptor',
          payload: 'descriptor-1',
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
          // Vitest fails the run on any unhandled rejection: take its
          // listeners over while one is expected.
          const vitestListeners = process.listeners('unhandledRejection')
          process.removeAllListeners('unhandledRejection')
          const rejections = []
          process.on('unhandledRejection', reason => rejections.push(reason))
          const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
          const bug = new TypeError('Cannot read properties of undefined')

          try {
            const { socket } = await mountApp({
              actions: { [action]: () => Promise.reject(bug) },
              getters
            })
            emitSocketEvent(socket, event, eventData)
            await new Promise(resolve => setTimeout(resolve))
          } finally {
            process.removeAllListeners('unhandledRejection')
            vitestListeners.forEach(listener =>
              process.on('unhandledRejection', listener)
            )
          }

          expect(rejections).toEqual([bug])
          expect(consoleError).not.toHaveBeenCalledWith(bug)
        }
      )
    })
  })
})

import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

import errors from '@/lib/errors'

import App from '@/App.vue'

import { recordUnhandledRejections } from './fixtures/unhandled-rejections'

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

    // Zou announces a new production to every user, those out of its team
    // included.
    describe('new productions', () => {
      const getters = { productionMap: () => new Map() }

      it('logs a failed load of a new production', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const refusal = Object.assign(new Error('HTTP 403'), { status: 403 })
        errors.markRequestFailure(refusal)

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadProduction: () => Promise.reject(refusal) },
            getters
          })
          emitSocketEvent(socket, 'project:new', { project_id: 'prod-2' })
        })

        expect(rejections).toEqual([])
        expect(consoleError).toHaveBeenCalledWith(refusal)
      })

      it('leaves a bug in the load of a new production to Sentry', async () => {
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})
        const bug = new TypeError('Cannot read properties of undefined')

        const rejections = await recordUnhandledRejections(async () => {
          const { socket } = await mountApp({
            actions: { loadProduction: () => Promise.reject(bug) },
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
  })
})

import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

import errors from '@/lib/errors'
import i18n, { loadLocaleMessages } from '@/lib/i18n'

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

    // Someone else's comment moves the task it names, its todo included.
    describe('new comments', () => {
      const task = { id: 'task-1' }
      const getters = {
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
    afterEach(() => {
      i18n.global.locale.value = 'en'
      i18n.global.fallbackWarn = true
    })

    it('follows the type of the current production', async () => {
      const production = ref({ id: 'production-1', production_style: 'nft' })
      await mountApp({
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

    it('leaves the language of a user who reads another one', async () => {
      await loadLocaleMessages('fr')
      i18n.global.locale.value = 'fr'

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
  })
})

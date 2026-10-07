import { flushPromises, shallowMount } from '@vue/test-utils'
import process from 'node:process'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createStore } from 'vuex'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
  })
})

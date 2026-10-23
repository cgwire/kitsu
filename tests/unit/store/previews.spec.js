// @vitest-environment node

import { computed, effectScope } from 'vue'
import { createStore } from 'vuex'

import previewsApi from '@/store/api/previews'
import store from '@/store/modules/previews'

describe('Previews store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Runs the module mutations on a state of its own, as the root store does.
  const buildContext = (entries = []) => {
    const state = { previewFileStatusMap: new Map(entries) }
    const commit = vi.fn((type, payload) =>
      store.mutations[type](state, payload)
    )
    return { commit, state }
  }

  describe('SET_PREVIEW_FILE_STATUS', () => {
    test('keeps the status a preview file is given', () => {
      const { state } = buildContext()

      store.mutations.SET_PREVIEW_FILE_STATUS(state, {
        previewFileId: 'p1',
        status: 'processing'
      })

      expect(state.previewFileStatusMap.get('p1')).toBe('processing')
    })

    test('keeps a final status over a late processing one', () => {
      const { state } = buildContext([['p1', 'ready']])

      store.mutations.SET_PREVIEW_FILE_STATUS(state, {
        previewFileId: 'p1',
        status: 'processing'
      })

      expect(state.previewFileStatusMap.get('p1')).toBe('ready')
    })
  })

  describe('registerPreviewFileStatuses', () => {
    test('registers the payload previews that are not ready', () => {
      const context = buildContext()

      store.actions.registerPreviewFileStatuses(context, [
        { id: 'p1', status: 'processing' },
        { id: 'p2', status: 'broken' },
        { id: 'p3', status: 'ready' }
      ])

      expect([...context.state.previewFileStatusMap]).toEqual([
        ['p1', 'processing'],
        ['p2', 'broken']
      ])
    })

    test('follows a ready payload for a preview it follows', () => {
      const context = buildContext([['p1', 'processing']])

      store.actions.registerPreviewFileStatuses(context, [
        { id: 'p1', status: 'ready' }
      ])

      expect(context.state.previewFileStatusMap.get('p1')).toBe('ready')
    })

    // The players copy the payload previews: the commit carries the status
    // they must take.
    test('settles a processing payload on the ready status an event brought', () => {
      const context = buildContext([['p1', 'ready']])

      store.actions.registerPreviewFileStatuses(context, [
        { id: 'p1', status: 'processing' }
      ])

      expect(context.commit).toHaveBeenCalledWith('SET_PREVIEW_FILE_STATUS', {
        previewFileId: 'p1',
        status: 'ready'
      })
    })

    // A route that sends the label of a status would block its later codes.
    test('skips a status that is not a code', () => {
      const context = buildContext()

      store.actions.registerPreviewFileStatuses(context, [
        { id: 'p1', status: 'Processing' },
        { id: 'p2' }
      ])

      expect(context.state.previewFileStatusMap.size).toBe(0)
    })
  })

  describe('refreshProcessingPreviewFiles', () => {
    test('reads the processing previews 50 at a time', async () => {
      const ids = Array.from({ length: 51 }, (_, index) => `p${index}`)
      const context = buildContext([
        ...ids.map(id => [id, 'processing']),
        ['p-ready', 'ready']
      ])
      vi.spyOn(previewsApi, 'getPreviewFileStatuses').mockImplementation(
        chunk => Promise.resolve(chunk.map(id => ({ id, status: 'ready' })))
      )

      await store.actions.refreshProcessingPreviewFiles(context)

      expect(
        previewsApi.getPreviewFileStatuses.mock.calls.map(
          ([chunk]) => chunk.length
        )
      ).toEqual([50, 1])
      expect(
        [...context.state.previewFileStatusMap.values()].every(
          status => status === 'ready'
        )
      ).toBe(true)
    })

    // Deleted, or out of reach: no event will ever tell their end.
    test('forgets the previews the answer leaves out', async () => {
      const context = buildContext([
        ['p1', 'processing'],
        ['p2', 'processing']
      ])
      vi.spyOn(previewsApi, 'getPreviewFileStatuses').mockResolvedValue([
        { id: 'p1', status: 'processing' }
      ])

      await store.actions.refreshProcessingPreviewFiles(context)

      expect([...context.state.previewFileStatusMap]).toEqual([
        ['p1', 'processing']
      ])
    })

    test('reads nothing while no preview is processing', async () => {
      const context = buildContext([['p1', 'ready']])
      vi.spyOn(previewsApi, 'getPreviewFileStatuses')

      await store.actions.refreshProcessingPreviewFiles(context)

      expect(previewsApi.getPreviewFileStatuses).not.toHaveBeenCalled()
    })
  })

  test('starts the next session with an empty registry', () => {
    store.mutations.SET_PREVIEW_FILE_STATUS(store.state, {
      previewFileId: 'p1',
      status: 'processing'
    })

    store.mutations.RESET_ALL(store.state)

    expect(store.state.previewFileStatusMap.size).toBe(0)
  })

  // The thumbnails read the statuses through the root store getter.
  test('hands its statuses to the readers of the root store', () => {
    const rootStore = createStore({ modules: { previews: store } })
    const scope = effectScope()
    const status = scope.run(() =>
      computed(() => rootStore.getters.previewFileStatusMap.get('p1'))
    )
    expect(status.value).toBeUndefined()

    rootStore.commit('SET_PREVIEW_FILE_STATUS', {
      previewFileId: 'p1',
      status: 'processing'
    })
    expect(status.value).toBe('processing')

    rootStore.commit('SET_PREVIEW_FILE_STATUS', {
      previewFileId: 'p1',
      status: 'ready'
    })
    expect(status.value).toBe('ready')

    scope.stop()
    rootStore.commit('RESET_ALL')
  })
})

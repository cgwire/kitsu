// @vitest-environment node

import conceptsApi from '@/store/api/concepts'
import tasksApi from '@/store/api/tasks'
import store from '@/store/modules/concepts'

describe('Concepts store', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const rootGetters = { currentProduction: { id: 'production-1' } }

  const buildState = () => ({
    concepts: [
      { id: 'concept-1', parent_id: null },
      { id: 'concept-2', parent_id: 'folder-1' }
    ],
    conceptFolders: [{ id: 'folder-1', name: 'Sets' }]
  })

  describe('Concept folders', () => {
    test('loadConceptFolders stores the folders of the production', async () => {
      const folders = [{ id: 'folder-1', name: 'Sets' }]
      vi.spyOn(conceptsApi, 'getConceptFolders').mockResolvedValue(folders)
      const commit = vi.fn()

      await store.actions.loadConceptFolders({ commit, rootGetters })

      expect(conceptsApi.getConceptFolders).toHaveBeenCalledWith(
        rootGetters.currentProduction
      )
      expect(commit).toHaveBeenCalledWith('LOAD_CONCEPT_FOLDERS_END', folders)
    })

    test('a created folder takes its place in the name order', () => {
      const state = buildState()

      store.mutations.EDIT_CONCEPT_FOLDER_END(state, {
        id: 'folder-2',
        name: 'Characters'
      })

      expect(state.conceptFolders.map(folder => folder.name)).toEqual([
        'Characters',
        'Sets'
      ])
    })

    test('a renamed folder replaces the one it was', () => {
      const state = buildState()

      store.mutations.EDIT_CONCEPT_FOLDER_END(state, {
        id: 'folder-1',
        name: 'Environments'
      })

      expect(state.conceptFolders).toEqual([
        { id: 'folder-1', name: 'Environments' }
      ])
    })

    test('a deleted folder hands its concepts back to the root', () => {
      const state = buildState()

      store.mutations.DELETE_CONCEPT_FOLDER_END(state, { id: 'folder-1' })

      expect(state.conceptFolders).toEqual([])
      expect(state.concepts.map(concept => concept.parent_id)).toEqual([
        null,
        null
      ])
    })

    test('moveConcepts moves the concepts the server moved', async () => {
      vi.spyOn(conceptsApi, 'moveConcepts').mockResolvedValue(['concept-1'])
      const commit = vi.fn()

      await store.actions.moveConcepts(
        { commit, rootGetters },
        { conceptIds: ['concept-1', 'unknown'], folderId: 'folder-1' }
      )

      expect(conceptsApi.moveConcepts).toHaveBeenCalledWith(
        rootGetters.currentProduction,
        ['concept-1', 'unknown'],
        'folder-1'
      )
      expect(commit).toHaveBeenCalledWith('MOVE_CONCEPTS_END', {
        conceptIds: ['concept-1'],
        folderId: 'folder-1'
      })
    })

    test('moved concepts change folder', () => {
      const state = buildState()

      store.mutations.MOVE_CONCEPTS_END(state, {
        conceptIds: ['concept-1'],
        folderId: 'folder-1'
      })

      expect(state.concepts.map(concept => concept.parent_id)).toEqual([
        'folder-1',
        'folder-1'
      ])
    })

    test('newConcept creates the concept in the given folder', async () => {
      vi.spyOn(conceptsApi, 'newConcept').mockResolvedValue({
        id: 'concept-3',
        project_id: 'production-1',
        parent_id: 'folder-1'
      })
      const form = new Map([['file', { name: 'hero.png' }]])
      const dispatch = vi.fn(action =>
        Promise.resolve(
          action === 'commentTaskWithPreview'
            ? { preview: { id: 'preview-1' } }
            : { id: 'task-1' }
        )
      )

      await store.actions.newConcept(
        {
          commit: vi.fn(),
          dispatch,
          rootGetters: {
            ...rootGetters,
            taskTypes: [{ id: 'task-type-1', for_entity: 'Concept' }]
          }
        },
        { form, parentId: 'folder-1' }
      )

      expect(conceptsApi.newConcept).toHaveBeenCalledWith(
        expect.objectContaining({
          parent_id: 'folder-1',
          project_id: 'production-1'
        })
      )
    })
  })

  // Zou builds the variants of an uploaded picture in the background: the
  // card waits for them while the preview is processing.
  describe('Preview status', () => {
    const runNewConcept = async (
      previewStatus,
      refresh = () => Promise.resolve()
    ) => {
      vi.spyOn(conceptsApi, 'newConcept').mockResolvedValue({
        id: 'concept-3',
        project_id: 'production-1'
      })
      const commit = vi.fn()
      const dispatch = vi.fn(action => {
        if (action === 'refreshConceptPreview') return refresh()
        return Promise.resolve(
          action === 'commentTaskWithPreview'
            ? { preview: { id: 'preview-1', status: previewStatus } }
            : { id: 'task-1' }
        )
      })
      await store.actions.newConcept(
        {
          commit,
          dispatch,
          rootGetters: {
            ...rootGetters,
            taskTypes: [{ id: 'task-type-1', for_entity: 'Concept' }]
          }
        },
        { form: new Map([['file', { name: 'hero.png' }]]) }
      )
      return { commit, dispatch }
    }

    const buildPreviewState = status => {
      const concept = {
        id: 'concept-1',
        preview_file_id: 'preview-1',
        preview_file_status: status
      }
      return { concept, state: { conceptMap: new Map([[concept.id, concept]]) } }
    }

    test('newConcept lists the concept with the status of its upload', async () => {
      const { commit } = await runNewConcept('processing')

      expect(commit).toHaveBeenCalledWith(
        'EDIT_CONCEPT_END',
        expect.objectContaining({
          preview_file_id: 'preview-1',
          preview_file_status: 'processing'
        })
      )
    })

    // The event announcing the stored variants matches no card when it
    // comes before the concept is listed.
    test('newConcept reads a processing preview again once the concept is listed', async () => {
      const { commit, dispatch } = await runNewConcept('processing')

      const listing = commit.mock.calls.findIndex(
        ([type]) => type === 'EDIT_CONCEPT_END'
      )
      const reading = dispatch.mock.calls.findIndex(
        ([action]) => action === 'refreshConceptPreview'
      )
      expect(dispatch.mock.calls[reading]).toEqual([
        'refreshConceptPreview',
        expect.objectContaining({ id: 'concept-3', preview_file_id: 'preview-1' })
      ])
      expect(dispatch.mock.invocationCallOrder[reading]).toBeGreaterThan(
        commit.mock.invocationCallOrder[listing]
      )
    })

    // A failed read must not fail the upload: the next files of the drop
    // would not be sent, and a retry would upload the first one again.
    test('newConcept keeps the concept when its status cannot be read', async () => {
      const error = new Error('Request has been terminated')
      vi.spyOn(console, 'error').mockImplementation(() => {})

      const { commit } = await runNewConcept('processing', () =>
        Promise.reject(error)
      )
      await new Promise(resolve => setTimeout(resolve))

      expect(commit).toHaveBeenCalledWith(
        'EDIT_CONCEPT_END',
        expect.objectContaining({ id: 'concept-3' })
      )
      expect(console.error).toHaveBeenCalledWith(error)
    })

    // The variants may be stored between the list query and the listing,
    // and the event announcing them then matches no card.
    test('loadConcepts reads again the previews the list shows processing', async () => {
      const concepts = [
        { id: 'concept-1', preview_file_status: 'processing' },
        { id: 'concept-2', preview_file_status: 'ready' },
        { id: 'concept-3' }
      ]
      vi.spyOn(conceptsApi, 'getConcepts').mockResolvedValue(concepts)
      const commit = vi.fn()
      const dispatch = vi.fn(() => Promise.resolve())

      await store.actions.loadConcepts({ commit, dispatch, rootGetters })

      expect(dispatch.mock.calls).toEqual([
        ['refreshConceptPreview', concepts[0]]
      ])
      expect(dispatch.mock.invocationCallOrder[0]).toBeGreaterThan(
        commit.mock.invocationCallOrder[
          commit.mock.calls.findIndex(([type]) => type === 'LOAD_CONCEPTS_END')
        ]
      )
    })

    // The page waits for loadConcepts before showing the list.
    test('loadConcepts lists the concepts without waiting for the status reads', async () => {
      vi.spyOn(conceptsApi, 'getConcepts').mockResolvedValue([
        { id: 'concept-1', preview_file_status: 'processing' }
      ])
      const commit = vi.fn()
      const dispatch = vi.fn(() => new Promise(() => {}))

      await store.actions.loadConcepts({ commit, dispatch, rootGetters })

      expect(commit).toHaveBeenCalledWith('LOAD_CONCEPTS_END', {
        concepts: [{ id: 'concept-1', preview_file_status: 'processing' }]
      })
    })

    test('loadConcepts keeps the list when a status read fails', async () => {
      const error = new Error('Request has been terminated')
      vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(conceptsApi, 'getConcepts').mockResolvedValue([
        { id: 'concept-1', preview_file_status: 'processing' }
      ])
      const commit = vi.fn()
      const dispatch = vi.fn(() => Promise.reject(error))

      await store.actions.loadConcepts({ commit, dispatch, rootGetters })
      await new Promise(resolve => setTimeout(resolve))

      expect(commit).not.toHaveBeenCalledWith('LOAD_CONCEPTS_ERROR')
      expect(console.error).toHaveBeenCalledWith(error)
    })

    test('newConcept leaves a ready preview alone', async () => {
      const { dispatch } = await runNewConcept('ready')

      expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
        'createTask',
        'commentTaskWithPreview',
        'setLastTaskPreview'
      ])
    })

    // A failed job leaves the preview broken.
    test.each(['ready', 'broken'])(
      'refreshConceptPreview stores the %s status the server reads',
      async status => {
        vi.spyOn(tasksApi, 'getPreviewFile').mockResolvedValue({
          id: 'preview-1',
          status
        })
        const commit = vi.fn()

        await store.actions.refreshConceptPreview(
          { commit },
          { id: 'concept-1', preview_file_id: 'preview-1' }
        )

        expect(tasksApi.getPreviewFile).toHaveBeenCalledWith('preview-1')
        expect(commit).toHaveBeenCalledWith('UPDATE_CONCEPT_PREVIEW_STATUS', {
          conceptId: 'concept-1',
          previewFileId: 'preview-1',
          status
        })
      }
    )

    test.each(['ready', 'broken'])(
      'a processing preview takes the %s status read',
      status => {
        const { concept, state } = buildPreviewState('processing')

        store.mutations.UPDATE_CONCEPT_PREVIEW_STATUS(state, {
          conceptId: 'concept-1',
          previewFileId: 'preview-1',
          status
        })

        expect(concept.preview_file_status).toBe(status)
      }
    )

    // Two reads can cross: the answer sent before the variants were stored
    // must not undo the one sent after.
    test('a late processing answer does not undo a ready preview', () => {
      const { concept, state } = buildPreviewState('ready')

      store.mutations.UPDATE_CONCEPT_PREVIEW_STATUS(state, {
        conceptId: 'concept-1',
        previewFileId: 'preview-1',
        status: 'processing'
      })

      expect(concept.preview_file_status).toBe('ready')
    })

    test('an answer about another preview is ignored', () => {
      const { concept, state } = buildPreviewState('processing')

      store.mutations.UPDATE_CONCEPT_PREVIEW_STATUS(state, {
        conceptId: 'concept-1',
        previewFileId: 'preview-0',
        status: 'ready'
      })

      expect(concept.preview_file_status).toBe('processing')
    })

    // The concepts of another production replace the list while a read
    // is on its way.
    test('an answer about a concept gone from the list is ignored', () => {
      const state = { conceptMap: new Map() }

      expect(() =>
        store.mutations.UPDATE_CONCEPT_PREVIEW_STATUS(state, {
          conceptId: 'concept-1',
          previewFileId: 'preview-1',
          status: 'ready'
        })
      ).not.toThrow()
    })
  })

  describe('Actions', () => {
    // The page shows its error state on a rejection: a swallowed error
    // left it on "no concept".
    test('loadConcepts rejects when the request fails', async () => {
      const error = new Error('Request has been terminated')
      vi.spyOn(conceptsApi, 'getConcepts').mockRejectedValue(error)
      const commit = vi.fn()

      await expect(
        store.actions.loadConcepts({ commit, rootGetters })
      ).rejects.toBe(error)
      expect(commit).toHaveBeenLastCalledWith('LOAD_CONCEPTS_ERROR')
    })
  })
})

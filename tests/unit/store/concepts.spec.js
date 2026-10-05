// @vitest-environment node

import conceptsApi from '@/store/api/concepts'
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

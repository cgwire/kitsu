// @vitest-environment node

import { vi } from 'vitest'

// Importing the playlists module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import store from '@/store/modules/playlists'
import playlistsApi from '@/store/api/playlists'

describe('Playlists store', () => {
  describe('Actions', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    const context = {
      task_types: [{ id: 'task-type-1', name: 'Animation' }],
      task_statuses: [{ id: 'task-status-1', name: 'Done' }]
    }

    test('loadPlaylists forwards the entity type filter of the all pseudo-episode', async () => {
      const getPlaylists = vi
        .spyOn(playlistsApi, 'getPlaylists')
        .mockResolvedValue([])
      const production = { id: 'production-1' }
      const episode = { id: 'all' }

      await store.actions.loadPlaylists(
        {
          commit: vi.fn(),
          rootGetters: {
            currentProduction: production,
            currentEpisode: episode,
            isTVShow: true
          }
        },
        { sortBy: 'name', page: 2, taskTypeId: '', forEntity: 'shot' }
      )

      expect(getPlaylists).toHaveBeenCalledWith(
        production,
        episode,
        '',
        'name',
        2,
        'shot'
      )
    })

    test('loadSharedPlaylistContext adds the missing task types and statuses', async () => {
      vi.spyOn(playlistsApi, 'loadSharedPlaylistContext').mockResolvedValue(
        context
      )
      const commit = vi.fn()
      const rootGetters = { taskTypeMap: new Map(), taskStatusMap: new Map() }

      await store.actions.loadSharedPlaylistContext(
        { commit, rootGetters },
        'share-token'
      )

      expect(commit).toHaveBeenCalledWith(
        'EDIT_TASK_TYPE_END',
        context.task_types[0]
      )
      expect(commit).toHaveBeenCalledWith(
        'EDIT_TASK_STATUS_END',
        context.task_statuses[0]
      )
    })

    // A share link can be opened in a tab already holding the whole task type
    // and task status sets. Loading the playlist subset would trim them for
    // the rest of the session, and overwrite the normalised allowance flags.
    test('loadSharedPlaylistContext leaves the loaded sets alone', async () => {
      vi.spyOn(playlistsApi, 'loadSharedPlaylistContext').mockResolvedValue(
        context
      )
      const commit = vi.fn()
      const rootGetters = {
        taskTypeMap: new Map([['task-type-1', { id: 'task-type-1' }]]),
        taskStatusMap: new Map([['task-status-1', { id: 'task-status-1' }]])
      }

      await store.actions.loadSharedPlaylistContext(
        { commit, rootGetters },
        'share-token'
      )

      const mutations = commit.mock.calls.map(([mutation]) => mutation)
      expect(mutations).not.toContain('LOAD_TASK_TYPES_END')
      expect(mutations).not.toContain('LOAD_TASK_STATUSES_END')
      expect(mutations).not.toContain('EDIT_TASK_TYPE_END')
      expect(mutations).not.toContain('EDIT_TASK_STATUS_END')
    })
  })
})

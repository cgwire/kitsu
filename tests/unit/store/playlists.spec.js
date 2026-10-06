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

    // An update fetch may land after the list was replaced by another
    // scope's: the playlist it refreshed must not join that list.
    test('refreshPlaylist leaves out an updated playlist no longer listed', async () => {
      vi.spyOn(playlistsApi, 'getPlaylist').mockResolvedValue({
        id: 'playlist-gone'
      })
      const commit = vi.fn()

      await store.actions.refreshPlaylist(
        {
          commit,
          state: { playlistMap: new Map() },
          rootGetters: { currentProduction: { id: 'production-1' } }
        },
        { id: 'playlist-gone' }
      )

      expect(commit).not.toHaveBeenCalled()
    })

    // Zou answers 403 to a client once a playlist is made internal, and 404
    // once it is deleted: the live refresh drops it instead of rejecting.
    test('refreshPlaylist drops a listed playlist the user may no longer read', async () => {
      vi.spyOn(playlistsApi, 'getPlaylist').mockRejectedValue({ status: 403 })
      const commit = vi.fn()

      const playlist = await store.actions.refreshPlaylist(
        {
          commit,
          state: {
            playlistMap: new Map([['playlist-1', { id: 'playlist-1' }]])
          },
          rootGetters: { currentProduction: { id: 'production-1' } }
        },
        { id: 'playlist-1' }
      )

      expect(playlist).toBeNull()
      expect(commit).toHaveBeenCalledWith('DELETE_PLAYLIST_END', {
        id: 'playlist-1'
      })
    })

    // Every internal playlist a manager creates reaches the clients' sockets.
    test('refreshPlaylist quietly skips a new playlist the user may not read', async () => {
      vi.spyOn(playlistsApi, 'getPlaylist').mockRejectedValue({ status: 403 })
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const commit = vi.fn()

      const playlist = await store.actions.refreshPlaylist(
        {
          commit,
          state: { playlistMap: new Map() },
          rootGetters: { currentProduction: { id: 'production-1' } }
        },
        { id: 'playlist-internal', scope: { productionId: 'production-1' } }
      )

      expect(playlist).toBeNull()
      expect(commit).not.toHaveBeenCalled()
      expect(consoleError).not.toHaveBeenCalled()
    })

    test('refreshPlaylist logs any other failure', async () => {
      const error = { status: 500 }
      vi.spyOn(playlistsApi, 'getPlaylist').mockRejectedValue(error)
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const commit = vi.fn()

      const playlist = await store.actions.refreshPlaylist(
        {
          commit,
          state: {
            playlistMap: new Map([['playlist-1', { id: 'playlist-1' }]])
          },
          rootGetters: { currentProduction: { id: 'production-1' } }
        },
        { id: 'playlist-1' }
      )

      expect(playlist).toBeNull()
      expect(commit).not.toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalledWith(error)
    })

    // Opening a playlist then another: the preview maps belong to the last
    // one opened, whatever order the responses land in.
    test('loadPlaylist commits only the playlist opened last', async () => {
      let endFirst
      vi.spyOn(playlistsApi, 'getPlaylist')
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              endFirst = resolve
            })
        )
        .mockResolvedValueOnce({ id: 'playlist-b' })
      const commit = vi.fn()
      const rootGetters = { currentProduction: { id: 'production-1' } }

      const first = store.actions.loadPlaylist(
        { commit, rootGetters },
        { id: 'playlist-a' }
      )
      await store.actions.loadPlaylist(
        { commit, rootGetters },
        { id: 'playlist-b' }
      )
      endFirst({ id: 'playlist-a' })
      expect(await first).toEqual({ id: 'playlist-a' })

      const ends = commit.mock.calls.filter(
        ([type]) => type === 'LOAD_PLAYLIST_END'
      )
      expect(ends.map(([, playlist]) => playlist.id)).toEqual(['playlist-b'])
    })

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

  describe('Mutations', () => {
    // Zou drops the pin of an entry whose preview is gone, and the page then
    // shows the entity's main preview: the row holds no preview to match.
    test('CHANGE_PLAYLIST_PREVIEW re-pins an entry whose pin was dropped', () => {
      const row = { entity_id: 'shot-1', preview_files: {} }
      const playlist = { shots: [row] }
      const state = {
        playlistEntryMap: new Map([['shot-1-undefined', row]])
      }

      store.mutations.CHANGE_PLAYLIST_PREVIEW(state, {
        playlist,
        entityId: 'shot-1',
        previewFileId: 'preview-2',
        previousPreviewFileId: 'preview-main'
      })

      expect(row.preview_file_id).toBe('preview-2')
      expect([...state.playlistEntryMap.keys()]).toEqual(['shot-1-preview-2'])
    })

    test('CHANGE_PLAYLIST_PREVIEW leaves a pinned row of the same entity alone', () => {
      const pinned = { entity_id: 'shot-1', preview_file_id: 'preview-1' }
      const playlist = { shots: [pinned] }
      const state = {
        playlistEntryMap: new Map([['shot-1-preview-1', pinned]])
      }

      store.mutations.CHANGE_PLAYLIST_PREVIEW(state, {
        playlist,
        entityId: 'shot-1',
        previewFileId: 'preview-2',
        previousPreviewFileId: 'preview-main'
      })

      expect(pinned.preview_file_id).toBe('preview-1')
      expect([...state.playlistEntryMap.keys()]).toEqual(['shot-1-preview-1'])
    })
  })
})

// @vitest-environment node

import { vi } from 'vitest'

// Importing the playlists module transitively pulls in the root store
// (lib/models → timezone → @/store); stub it so no Vuex store is built.
vi.mock('@/store', () => ({ default: {} }))

import { getPlaylistListKey } from '@/lib/playlist'
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
    // once it is deleted: the live refresh drops it instead of rejecting, and
    // tells it from a failed refresh, which answers null.
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

      expect(playlist).toBe(false)
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

      expect(playlist).toBe(false)
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

    // A playlist of the All shots list of production-1, created while the
    // store holds the list of listKey once Zou answers.
    const createInList = async listKey => {
      let answer
      vi.spyOn(playlistsApi, 'newPlaylist').mockImplementation(
        () =>
          new Promise(resolve => {
            answer = resolve
          })
      )
      const commit = vi.fn()
      const state = {
        playlistListKey: getPlaylistListKey('production-1', 'all', 'shot')
      }
      const creation = store.actions.newPlaylist(
        { commit, state },
        {
          name: 'Review',
          production_id: 'production-1',
          episode_id: 'all',
          listForEntity: 'shot'
        }
      )
      state.playlistListKey = listKey
      answer({ id: 'playlist-new' })
      return { commit, playlist: await creation }
    }

    test('newPlaylist lists the playlist in the list it was created in', async () => {
      const { commit, playlist } = await createInList(
        getPlaylistListKey('production-1', 'all', 'shot')
      )

      expect(playlist).toEqual({ id: 'playlist-new' })
      expect(playlistsApi.newPlaylist).toHaveBeenCalledWith({
        name: 'Review',
        production_id: 'production-1',
        episode_id: 'all'
      })
      expect(commit).toHaveBeenCalledWith('EDIT_PLAYLIST_END', {
        id: 'playlist-new'
      })
    })

    // The page can move to another list while Zou creates the playlist, and
    // a page opened meanwhile can load another one.
    test.each([
      [
        "another production's list",
        getPlaylistListKey('production-2', 'all', 'shot')
      ],
      ["another episode's list", getPlaylistListKey('production-1', 'episode-2')],
      ['the All assets list', getPlaylistListKey('production-1', 'all', 'asset')],
      ['a list that loads again', null]
    ])(
      'newPlaylist keeps the playlist out of %s',
      async (_list, listKey) => {
        const { commit, playlist } = await createInList(listKey)

        expect(playlist).toEqual({ id: 'playlist-new' })
        expect(commit).not.toHaveBeenCalledWith(
          'EDIT_PLAYLIST_END',
          expect.anything()
        )
      }
    )

    // A movie has no episode: its list key ignores the episode shown.
    test.each([
      ['a TV show', true, getPlaylistListKey('production-1', 'all', 'shot')],
      ['a movie', false, getPlaylistListKey('production-1', null, 'shot')]
    ])(
      'loadPlaylists keeps the key of the list it loads for %s',
      async (_production, isTVShow, listKey) => {
        vi.spyOn(playlistsApi, 'getPlaylists').mockResolvedValue([
          { id: 'playlist-1' }
        ])
        const commit = vi.fn()

        await store.actions.loadPlaylists(
          {
            commit,
            rootGetters: {
              currentProduction: { id: 'production-1' },
              currentEpisode: { id: 'all' },
              isTVShow
            }
          },
          { forEntity: 'shot' }
        )

        expect(commit).toHaveBeenLastCalledWith(
          'SET_PLAYLIST_LIST_KEY',
          listKey
        )
      }
    )

    // A save Zou answers after a switch of production finds the list of the
    // other production.
    const saves = [
      ['editPlaylist', 'updatePlaylist', { data: { id: 'playlist-1' } }],
      [
        'addEntitiesToPlaylist',
        'addEntitiesToPlaylist',
        { playlist: { id: 'playlist-1' }, entityIds: ['shot-1'] }
      ]
    ]
    const save = async (action, apiMethod, payload, playlistMap) => {
      const saved = { id: 'playlist-1', name: 'Dailies v2' }
      vi.spyOn(playlistsApi, apiMethod).mockResolvedValue(saved)
      const commit = vi.fn()
      const playlist = await store.actions[action](
        {
          commit,
          state: { playlistMap },
          rootGetters: { isCurrentUserClient: false }
        },
        payload
      )
      return { commit, playlist, saved }
    }

    test.each(saves)(
      '%s updates a playlist the list holds',
      async (action, apiMethod, payload) => {
        const { commit, playlist, saved } = await save(
          action,
          apiMethod,
          payload,
          new Map([['playlist-1', { id: 'playlist-1', name: 'Dailies' }]])
        )

        expect(playlist).toEqual(saved)
        expect(commit).toHaveBeenCalledWith('EDIT_PLAYLIST_END', saved)
      }
    )

    test.each(saves)(
      '%s leaves a playlist the list does not hold out of it',
      async (action, apiMethod, payload) => {
        const { commit, playlist, saved } = await save(
          action,
          apiMethod,
          payload,
          new Map()
        )

        expect(playlist).toEqual(saved)
        expect(commit).not.toHaveBeenCalledWith(
          'EDIT_PLAYLIST_END',
          expect.anything()
        )
      }
    )

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

    // The link of a deleted playlist, or of an internal one for a client.
    test.each([403, 404])(
      'loadPlaylist quietly answers no playlist on a %s',
      async status => {
        vi.spyOn(playlistsApi, 'getPlaylist').mockRejectedValue({ status })
        const consoleError = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})

        const playlist = await store.actions.loadPlaylist(
          {
            commit: vi.fn(),
            rootGetters: { currentProduction: { id: 'production-1' } }
          },
          { id: 'playlist-gone' }
        )

        expect(playlist).toEqual({})
        expect(consoleError).not.toHaveBeenCalled()
      }
    )

    test('loadPlaylist logs any other failure', async () => {
      const error = { status: 500 }
      vi.spyOn(playlistsApi, 'getPlaylist').mockRejectedValue(error)
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const playlist = await store.actions.loadPlaylist(
        {
          commit: vi.fn(),
          rootGetters: { currentProduction: { id: 'production-1' } }
        },
        { id: 'playlist-1' }
      )

      expect(playlist).toEqual({})
      expect(consoleError).toHaveBeenCalledWith(error)
    })

    // The Playlist page can show a playlist its list does not hold.
    test('removeBuildJob deletes a build of a playlist the list does not hold', async () => {
      const deleteBuildJob = vi
        .spyOn(playlistsApi, 'deleteBuildJob')
        .mockResolvedValue({})
      const state = { playlistMap: new Map() }
      const commit = (type, payload) => store.mutations[type](state, payload)
      const job = { id: 'job-1', playlist_id: 'playlist-past' }

      await store.actions.removeBuildJob({ commit }, job)

      expect(deleteBuildJob).toHaveBeenCalledWith(job)
    })

    test('removeBuildJob takes the build out of a listed playlist', async () => {
      vi.spyOn(playlistsApi, 'deleteBuildJob').mockResolvedValue({})
      const playlist = {
        id: 'playlist-1',
        build_jobs: [{ id: 'job-1' }, { id: 'job-2' }]
      }
      const state = { playlistMap: new Map([[playlist.id, playlist]]) }
      const commit = (type, payload) => store.mutations[type](state, payload)

      await store.actions.removeBuildJob(
        { commit },
        { id: 'job-1', playlist_id: 'playlist-1' }
      )

      expect(playlist.build_jobs).toEqual([{ id: 'job-2' }])
    })

    // The list carries no builds: the load of a playlist copies them onto its
    // entry, and "Load more" can list a playlist after its load.
    test('removeBuildJob deletes a build of a playlist listed without its builds', async () => {
      const deleteBuildJob = vi
        .spyOn(playlistsApi, 'deleteBuildJob')
        .mockResolvedValue({})
      const playlist = { id: 'playlist-1', name: 'Dailies' }
      const state = { playlistMap: new Map([[playlist.id, playlist]]) }
      const commit = (type, payload) => store.mutations[type](state, payload)
      const job = { id: 'job-1', playlist_id: 'playlist-1' }

      await store.actions.removeBuildJob({ commit }, job)

      expect(deleteBuildJob).toHaveBeenCalledWith(job)
    })

    describe('changePlaylistOrder', () => {
      const entry = id => ({ entity_id: id, preview_file_id: `preview-${id}` })
      const order = shots => shots.map(shot => shot.entity_id)
      const settle = () => new Promise(resolve => setTimeout(resolve))

      // Zou answers the saves when the test lands them, and keeps for each
      // playlist the order of the save it stores last.
      const mockZou = () => {
        const zou = { inFlight: [], sent: [], stored: {} }
        vi.spyOn(playlistsApi, 'updatePlaylist').mockImplementation(
          ({ id, shots }) =>
            new Promise(resolve => {
              const sent = order(shots)
              zou.sent.push(sent)
              zou.inFlight.push(() => {
                zou.stored[id] = sent
                resolve({ id })
              })
            })
        )
        zou.landAll = async (pick = saves => saves) => {
          while (zou.inFlight.length) {
            pick(zou.inFlight.splice(0)).forEach(land => land())
            await settle()
          }
        }
        return zou
      }

      const openPlaylist = id => {
        const playlist = { id, shots: ['shot-1', 'shot-2', 'shot-3'].map(entry) }
        const state = { playlists: [], playlistMap: new Map() }
        const context = {
          commit: (type, payload) => store.mutations[type](state, payload),
          state,
          rootGetters: { isCurrentUserClient: false }
        }
        context.dispatch = (type, payload) =>
          store.actions[type](context, payload)
        // Each move is a keydown or a drop of its own.
        const move = async (before, after) => {
          store.actions.changePlaylistOrder(context, {
            playlist,
            info: { before: entry(before), after: entry(after) }
          })
          await settle()
        }
        return { playlist, move }
      }

      // Each move saves the whole order, and Zou keeps the save it stores
      // last, not always the last one sent.
      test('keeps the last move when the saves land out of order', async () => {
        const zou = mockZou()
        const { playlist, move } = openPlaylist('playlist-1')

        await move('shot-2', 'shot-1')
        await move('shot-1', 'shot-2')
        // From the last sent to the first.
        await zou.landAll(saves => saves.reverse())

        expect(order(playlist.shots)).toEqual(['shot-1', 'shot-2', 'shot-3'])
        expect(zou.stored['playlist-1']).toEqual(['shot-1', 'shot-2', 'shot-3'])
      })

      // Holding the shortcut moves the entry at each key repeat.
      test('sends one save for the moves made while one runs', async () => {
        const zou = mockZou()
        const { move } = openPlaylist('playlist-2')

        await move('shot-2', 'shot-1')
        await move('shot-3', 'shot-1')
        await move('shot-1', 'shot-2')
        await zou.landAll()

        expect(zou.sent).toEqual([
          ['shot-2', 'shot-1', 'shot-3'],
          ['shot-3', 'shot-1', 'shot-2']
        ])
      })

      // A save waiting in one playlist stays when another playlist moves.
      test('keeps the saves of each playlist apart', async () => {
        const zou = mockZou()
        const first = openPlaylist('playlist-3')
        const second = openPlaylist('playlist-4')

        await first.move('shot-2', 'shot-1')
        await first.move('shot-3', 'shot-1')
        await second.move('shot-2', 'shot-1')
        await zou.landAll()

        expect(zou.stored).toEqual({
          'playlist-3': ['shot-2', 'shot-3', 'shot-1'],
          'playlist-4': ['shot-2', 'shot-1', 'shot-3']
        })
      })
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

    test.each([
      ['loadSharedPlaylistComments', 'token', ['token']],
      [
        'postSharedPlaylistComment',
        { shareToken: 'token', data: { text: 'a' } },
        ['token', { text: 'a' }]
      ],
      [
        'editSharedPlaylistComment',
        { shareToken: 'token', commentId: 'c1', data: { text: 'a' } },
        ['token', 'c1', { text: 'a' }]
      ],
      [
        'deleteSharedPlaylistComment',
        { shareToken: 'token', commentId: 'c1', guestId: 'g1' },
        ['token', 'c1', 'g1']
      ],
      [
        'postSharedPlaylistCommentAttachments',
        { shareToken: 'token', commentId: 'c1', formData: 'form' },
        ['token', 'c1', 'form']
      ],
      [
        'deleteSharedPlaylistCommentAttachment',
        {
          shareToken: 'token',
          commentId: 'c1',
          attachmentId: 'a1',
          guestId: 'g1'
        },
        ['token', 'c1', 'a1', 'g1']
      ]
    ])('%s calls the API and returns its answer', async (name, payload, args) => {
      const answer = { id: 'answer' }
      vi.spyOn(playlistsApi, name).mockResolvedValue(answer)

      await expect(store.actions[name]({}, payload)).resolves.toBe(answer)

      expect(playlistsApi[name]).toHaveBeenCalledWith(...args)
    })
  })

  describe('Mutations', () => {
    // The page empties the list when its production, episode, or All shots
    // or All assets list changes: no key holds until the next load lands.
    test('LOAD_PLAYLISTS_END forgets the key of the list it replaces', () => {
      const state = {
        playlistListKey: getPlaylistListKey('production-1'),
        playlists: [{ id: 'playlist-1' }],
        playlistMap: new Map()
      }

      store.mutations.LOAD_PLAYLISTS_END(state, [])

      expect(state.playlistListKey).toBeNull()
    })

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

    test('PIN_PLAYLIST_ENTRY pins an entry with the fields of its preview', () => {
      const entry = { id: 'shot-1', entity_id: 'shot-1', preview_file_id: null }
      const state = {
        playlistEntryMap: new Map([['shot-1-null', entry]]),
        previewFileEntityMap: new Map()
      }
      const previewFile = {
        id: 'preview-1',
        task_id: 'task-1',
        extension: 'mp4',
        revision: 2,
        width: 1920,
        height: 1080,
        duration: 2.76,
        previews: []
      }

      store.mutations.PIN_PLAYLIST_ENTRY(state, { entry, previewFile })

      expect(entry).toMatchObject({
        preview_file_id: 'preview-1',
        preview_file_task_id: 'task-1',
        preview_file_extension: 'mp4',
        preview_file_revision: 2,
        preview_file_duration: 2.76,
        preview_file_previews: []
      })
      expect([...state.playlistEntryMap.keys()]).toEqual(['shot-1-preview-1'])
      expect(state.previewFileEntityMap.get('preview-1')).toBe(entry)
    })
  })
})

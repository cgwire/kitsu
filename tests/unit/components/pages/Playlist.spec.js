import { vi } from 'vitest'

import '@/lib/auth'

import Playlist from '@/components/pages/Playlist.vue'

describe('Playlist page', () => {
  const isStale = Playlist.computed.isPlaylistListStale
  const production = { id: 'p1' }
  const allShots = { project_id: 'p1', episode_id: null, is_for_all: true, for_entity: 'shot' }
  const allAssets = { project_id: 'p1', episode_id: null, is_for_all: true, for_entity: 'asset' }
  const episodeOne = { project_id: 'p1', episode_id: 'ep-1', is_for_all: false, for_entity: 'shot' }
  const context = (playlists, episodeId, allForEntity) => ({
    playlists,
    currentProduction: production,
    isTVShow: true,
    currentEpisode: episodeId ? { id: episodeId } : null,
    allForEntity
  })

  it('reloads on mount when the stored list belongs to another all-mode entity type', () => {
    // Coming back to All assets after a visit of the All shots playlists.
    expect(isStale.call(context([allShots], 'all', 'asset'))).toBe(true)
    expect(isStale.call(context([allAssets], 'all', 'asset'))).toBe(false)
    expect(isStale.call(context([allShots], 'all', 'shot'))).toBe(false)
  })

  it('reloads when the stored list belongs to another episode, production or pack', () => {
    expect(isStale.call(context([episodeOne], 'ep-2', undefined))).toBe(true)
    expect(isStale.call(context([episodeOne], 'ep-1', undefined))).toBe(false)
    expect(isStale.call(context([allAssets], 'ep-1', undefined))).toBe(true)
    expect(isStale.call(context([allAssets], 'main', undefined))).toBe(true)
    expect(isStale.call(context([episodeOne], 'all', 'shot'))).toBe(true)
    expect(
      isStale.call({ ...context([episodeOne], 'ep-1'), currentProduction: { id: 'p2' } })
    ).toBe(true)
    expect(isStale.call(context([], 'ep-1', undefined))).toBe(false)
  })
})

describe('Playlist page, loadEditsData', () => {
  const buildContext = (overrides = {}) => ({
    currentProduction: { id: 'p1' },
    currentEpisode: { id: 'ep-a' },
    isTVShow: true,
    displayedEdits: [{ id: 'e1', project_id: 'p1', episode_id: 'ep-a' }],
    editsLoadingKey: 'p1/ep-a',
    loadEdits: vi.fn(() => Promise.resolve()),
    loadEpisodes: vi.fn(() => Promise.resolve()),
    ...overrides
  })

  it('reloads the edits when the store holds another episode', async () => {
    const context = buildContext({ currentEpisode: { id: 'ep-b' } })

    await Playlist.methods.loadEditsData.call(context)

    expect(context.loadEdits).toHaveBeenCalled()
  })

  it('reloads the edits when the store holds the production-wide dataset', async () => {
    const context = buildContext({ editsLoadingKey: 'p1/all' })

    await Playlist.methods.loadEditsData.call(context)

    expect(context.loadEdits).toHaveBeenCalled()
  })

  it('keeps the edits loaded for the displayed episode', async () => {
    const context = buildContext()

    await Playlist.methods.loadEditsData.call(context)

    expect(context.loadEdits).not.toHaveBeenCalled()
  })

  it('keeps the edits of a production without episodes', async () => {
    const context = buildContext({
      isTVShow: false,
      currentEpisode: null,
      editsLoadingKey: 'p1/'
    })

    await Playlist.methods.loadEditsData.call(context)

    expect(context.loadEdits).not.toHaveBeenCalled()
  })
})

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

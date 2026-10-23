// @vitest-environment node

import { describe, it, expect, vi } from 'vitest'

import { isPlaylistInScope, warmPlaylistMovies } from '@/lib/playlist'

const entities = [
  { preview_file_id: 'a', preview_file_extension: 'mp4' },
  { preview_file_id: 'b', preview_file_extension: 'png' },
  { preview_file_id: null, preview_file_extension: 'mp4' },
  { preview_file_id: 'c', preview_file_extension: 'mp4' },
  { preview_file_id: 'd', preview_file_extension: 'mp4' }
]

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('lib/playlist warmPlaylistMovies', () => {
  it('asks one byte of each movie, two at a time, in order', async () => {
    const resolvers = []
    const fetcher = vi.fn(
      () =>
        new Promise(resolve => {
          resolvers.push(() =>
            resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)) })
          )
        })
    )

    warmPlaylistMovies(entities, { fetcher })

    expect(fetcher.mock.calls.map(call => call[0])).toEqual([
      '/api/movies/low/preview-files/a.mp4',
      '/api/movies/low/preview-files/c.mp4'
    ])
    expect(fetcher.mock.calls[0][1].headers).toEqual({ Range: 'bytes=0-0' })

    resolvers[0]()
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(fetcher.mock.calls[2][0]).toBe('/api/movies/low/preview-files/d.mp4')
  })

  it('uses the HD movie when the player is in HD, and honours the limit', () => {
    const fetcher = vi.fn(() => new Promise(() => {}))
    warmPlaylistMovies(entities, { fetcher, isHd: true, limit: 1 })
    expect(fetcher.mock.calls.map(call => call[0])).toEqual([
      '/api/movies/originals/preview-files/a.mp4'
    ])
  })

  it('stops when aborted', async () => {
    const fetcher = vi.fn(() =>
      Promise.resolve({
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1))
      })
    )
    const stop = warmPlaylistMovies(entities, { fetcher, concurrency: 1 })
    stop()
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true)
  })
})

describe('lib/playlist isPlaylistInScope', () => {
  const scope = { productionId: 'p1', episodeId: 'ep-a' }
  const playlist = fields => ({
    project_id: 'p1',
    episode_id: null,
    is_for_all: false,
    ...fields
  })

  // A live playlist joins the list on screen only under the rules zou lists
  // the playlists with.
  it('follows the episode rules of the list', () => {
    expect(isPlaylistInScope(playlist({ episode_id: 'ep-a' }), scope)).toBe(
      true
    )
    expect(isPlaylistInScope(playlist({ episode_id: 'ep-b' }), scope)).toBe(
      false
    )
    const all = { ...scope, episodeId: 'all' }
    expect(isPlaylistInScope(playlist({ is_for_all: true }), all)).toBe(true)
    expect(isPlaylistInScope(playlist({}), all)).toBe(false)
    const main = { ...scope, episodeId: 'main' }
    expect(isPlaylistInScope(playlist({}), main)).toBe(true)
    expect(isPlaylistInScope(playlist({ is_for_all: true }), main)).toBe(false)
    expect(
      isPlaylistInScope(playlist({ episode_id: 'ep-b' }), {
        productionId: 'p1'
      })
    ).toBe(true)
  })

  it('applies the production, task type and entity type filters', () => {
    expect(
      isPlaylistInScope(
        playlist({ project_id: 'p2', episode_id: 'ep-a' }),
        scope
      )
    ).toBe(false)
    expect(
      isPlaylistInScope(playlist({ episode_id: 'ep-a', task_type_id: 'tt2' }), {
        ...scope,
        taskTypeId: 'tt1'
      })
    ).toBe(false)
    expect(
      isPlaylistInScope(playlist({ is_for_all: true, for_entity: 'shot' }), {
        ...scope,
        episodeId: 'all',
        forEntity: 'asset'
      })
    ).toBe(false)
  })
})

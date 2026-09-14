import { describe, it, expect, vi } from 'vitest'

import { warmPlaylistMovies } from '@/lib/playlistWarmup'

const entities = [
  { preview_file_id: 'a', preview_file_extension: 'mp4' },
  { preview_file_id: 'b', preview_file_extension: 'png' },
  { preview_file_id: null, preview_file_extension: 'mp4' },
  { preview_file_id: 'c', preview_file_extension: 'mp4' },
  { preview_file_id: 'd', preview_file_extension: 'mp4' }
]

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('lib/playlistWarmup', () => {
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
      Promise.resolve({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)) })
    )
    const stop = warmPlaylistMovies(entities, { fetcher, concurrency: 1 })
    stop()
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true)
  })
})

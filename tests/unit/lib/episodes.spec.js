// @vitest-environment node

import {
  isEpisodeInLoadedScope,
  isNewShotInLoadedScope
} from '@/lib/episodes'

describe('isEpisodeInLoadedScope', () => {
  test('holds nothing while no scope is recorded', () => {
    expect(isEpisodeInLoadedScope(null, 'ep-a')).toBe(false)
    expect(isEpisodeInLoadedScope(undefined, null)).toBe(false)
  })

  // The key names the production too: the pseudo-episodes and the empty
  // scope hold everything of their own production, nothing of another one.
  test('holds nothing of another production', () => {
    expect(isEpisodeInLoadedScope('p1/all', 'ep-b', 'p2')).toBe(false)
    expect(isEpisodeInLoadedScope('p1/', 'ep-b', 'p2')).toBe(false)
    expect(isEpisodeInLoadedScope('p1/main', null, 'p2')).toBe(false)
    expect(isEpisodeInLoadedScope('p1/ep-a', 'ep-a', 'p2')).toBe(false)
  })

  test('holds the entities of the loaded production', () => {
    expect(isEpisodeInLoadedScope('p1/all', 'ep-b', 'p1')).toBe(true)
    expect(isEpisodeInLoadedScope('p1/ep-a', 'ep-a', 'p1')).toBe(true)
  })

  test('checks the episode alone when no production is given', () => {
    expect(isEpisodeInLoadedScope('p1/all', 'ep-b')).toBe(true)
    expect(isEpisodeInLoadedScope('p1/all', 'ep-b', undefined)).toBe(true)
  })

  test('holds everything for a production without episodes', () => {
    expect(isEpisodeInLoadedScope('p1/', null)).toBe(true)
    expect(isEpisodeInLoadedScope('p1/', 'ep-a')).toBe(true)
  })

  test('holds everything under the all pseudo-episode, marker or not', () => {
    expect(isEpisodeInLoadedScope('p1/all', 'ep-b')).toBe(true)
    expect(isEpisodeInLoadedScope('p1/all#partial', 'ep-b')).toBe(true)
    expect(isEpisodeInLoadedScope('p1/all#shared', 'ep-b')).toBe(true)
  })

  test('holds only the entities without episode under the main pack', () => {
    expect(isEpisodeInLoadedScope('p1/main', null)).toBe(true)
    expect(isEpisodeInLoadedScope('p1/main', '')).toBe(true)
    expect(isEpisodeInLoadedScope('p1/main', 'ep-a')).toBe(false)
  })

  test('holds only its own entities under a real episode', () => {
    expect(isEpisodeInLoadedScope('p1/ep-a', 'ep-a')).toBe(true)
    expect(isEpisodeInLoadedScope('p1/ep-a', 'ep-b')).toBe(false)
    expect(isEpisodeInLoadedScope('p1/ep-a', null)).toBe(false)
  })
})

describe('isNewShotInLoadedScope', () => {
  test('lets a shot without episode through, the store decides once fetched', () => {
    expect(isNewShotInLoadedScope('p1/ep-a', undefined)).toBe(true)
    expect(isNewShotInLoadedScope('p1/main', undefined)).toBe(true)
  })

  test('skips a shot of another episode', () => {
    expect(isNewShotInLoadedScope('p1/ep-a', 'ep-b')).toBe(false)
  })

  test('keeps a shot of the loaded episode', () => {
    expect(isNewShotInLoadedScope('p1/ep-a', 'ep-a')).toBe(true)
    expect(isNewShotInLoadedScope('p1/all', 'ep-b')).toBe(true)
  })

  // Nothing to insert into: the store drops the fetched shot anyway, and a
  // CSV import would cost one request per shot to every idle client.
  test('skips any shot while no scope is recorded', () => {
    expect(isNewShotInLoadedScope(null, 'ep-a')).toBe(false)
    expect(isNewShotInLoadedScope(null, undefined)).toBe(false)
  })
})

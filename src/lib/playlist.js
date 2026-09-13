export const DEFAULT_NB_FRAMES_PICTURE = 48

/*
 * Warm the server-side movie cache of a playlist before the user presses
 * play. The player preloads only one clip ahead, so the third clip of a
 * playlist starts cold whenever a clip is shorter than the time the server
 * needs to fetch the next movie from its object storage. A one-byte range
 * request per movie makes the server start filling its cache right away.
 *
 * Two requests in flight at a time, at most `limit` movies. The returned
 * function stops the warm-up (leave the page, new entity list).
 */
export const warmPlaylistMovies = (
  entities,
  { isHd = false, limit = 10, concurrency = 2, fetcher = null } = {}
) => {
  const doFetch = fetcher || ((...args) => fetch(...args))
  const variant = isHd ? 'originals' : 'low'
  const queue = (entities || [])
    .filter(
      entity =>
        entity.preview_file_id && entity.preview_file_extension === 'mp4'
    )
    .slice(0, limit)
    .map(
      entity =>
        `/api/movies/${variant}/preview-files/${entity.preview_file_id}.mp4`
    )
  const controller = new AbortController()

  const next = () => {
    const url = queue.shift()
    if (!url || controller.signal.aborted) return
    doFetch(url, {
      headers: { Range: 'bytes=0-0' },
      signal: controller.signal
    })
      .then(response => response.arrayBuffer())
      .catch(() => {})
      .then(next)
  }
  for (let i = 0; i < concurrency; i++) next()

  return () => controller.abort()
}

// Whether a playlist belongs to the list loaded for a scope, with the rules
// of zou's episode playlists route: all holds the playlists made for all
// episodes, main the ones of no episode, a real episode its own ones.
export const isPlaylistInScope = (
  playlist,
  { productionId, episodeId, forEntity, taskTypeId }
) => {
  if (playlist.project_id !== productionId) return false
  if (taskTypeId && playlist.task_type_id !== taskTypeId) return false
  if (forEntity && playlist.for_entity !== forEntity) return false
  if (!episodeId) return true
  if (episodeId === 'all') {
    return !playlist.episode_id && Boolean(playlist.is_for_all)
  }
  if (episodeId === 'main') {
    return !playlist.episode_id && !playlist.is_for_all
  }
  return playlist.episode_id === episodeId
}

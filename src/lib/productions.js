export const PRODUCTION_TYPE_OPTIONS = [
  {
    label: 'short',
    value: 'short'
  },
  {
    label: 'tvshow',
    value: 'tvshow'
  },
  {
    label: 'featurefilm',
    value: 'featurefilm'
  },
  {
    label: 'assets',
    value: 'assets'
  },
  {
    label: 'shots',
    value: 'shots'
  }
]

export const PRODUCTION_STYLE_OPTIONS = [
  { label: '2d', value: '2d' },
  { label: '2dpaper', value: '2dpaper' },
  { label: '3d', value: '3d' },
  { label: '2d3d', value: '2d3d' },
  { label: 'vfx', value: 'vfx' },
  { label: 'commercial', value: 'commercial' },
  { label: 'vr', value: 'vr' },
  { label: 'motion_design', value: 'motion-design' },
  { label: 'archviz', value: 'archviz' },
  { label: 'stop_motion', value: 'stop-motion' },
  { label: 'catalog', value: 'catalog' },
  { label: 'nft', value: 'nft' },
  { label: 'video_game', value: 'video-game' },
  { label: 'immersive', value: 'immersive' },
  { label: 'ar', value: 'ar' }
]

export const HOME_PAGE_OPTIONS = [
  { label: 'assets', value: 'assets' },
  { label: 'shots', value: 'shots' },
  { label: 'sequences', value: 'sequences' }
]

// Lowest movie bitrate the API takes, in Mbit/s.
export const MIN_MOVIE_BITRATE = 1

// Movie bitrates Zou ships with, in Mbit/s, for when /api/config does not
// give the instance ones.
const DEFAULT_MOVIE_BITRATES = {
  hd_bitrate_compression: 28,
  ld_bitrate_compression: 6
}

/*
 * Movie bitrates of the instance, in Mbit/s: the defaults of every
 * production. The high definition one is also the ceiling of all bitrates.
 */
export const getMovieBitrateDefaults = config => ({
  hd_bitrate_compression:
    config?.movie_highdef_bitrate ||
    DEFAULT_MOVIE_BITRATES.hd_bitrate_compression,
  ld_bitrate_compression:
    config?.movie_lowdef_bitrate ||
    DEFAULT_MOVIE_BITRATES.ld_bitrate_compression
})

/*
 * Value to send for a movie bitrate typed in a number field: an empty
 * field means "inherit", so it goes as null instead of an empty string.
 * The API takes whole Mbit/s only.
 */
export function parseBitrate(value) {
  if (value === '' || value === null || value === undefined) return null
  return Math.round(Number(value))
}

// A typed bitrate within the bounds the API enforces, null when unset.
export const clampBitrate = (value, ceiling) => {
  const bitrate = parseBitrate(value)
  return bitrate === null
    ? null
    : Math.min(Math.max(bitrate, MIN_MOVIE_BITRATE), ceiling)
}

/*
 * Bring a pair of typed bitrates within the rules the API enforces: the
 * high definition one never above max, the instance high definition
 * bitrate, the low definition one never above the high definition one,
 * inherited when unset.
 */
export function clampBitrates(
  bitrates,
  {
    inheritedHd = null,
    max = DEFAULT_MOVIE_BITRATES.hd_bitrate_compression
  } = {}
) {
  const hd = clampBitrate(bitrates.hd_bitrate_compression, max)
  const ceiling = Math.min(hd ?? parseBitrate(inheritedHd) ?? max, max)
  return {
    hd_bitrate_compression: hd,
    ld_bitrate_compression: clampBitrate(
      bitrates.ld_bitrate_compression,
      ceiling
    )
  }
}

// Megabytes a minute of movie weighs at a bitrate in Mbit/s.
export const getMovieMegabytesPerMinute = bitrate =>
  Math.round((bitrate * 60) / 8)

export function getTaskTypePriorityOfProd(taskType, production) {
  if (!taskType) {
    return 1
  }
  const productionPriority = production?.task_types_priority?.[taskType.id]
  return productionPriority || taskType.priority
}

export function getTaskStatusPriorityOfProd(taskStatus, production) {
  if (!taskStatus) {
    return 1
  }
  const productionPriority =
    production?.task_statuses_link?.[taskStatus.id]?.priority
  return productionPriority || taskStatus.priority
}

/*
 * Return a copy of taskType with a `url` field pointing to the given task,
 * without mutating the taskType object (which is often a store cache entry).
 */
export const getTaskTypeWithUrl = (taskType, task, entitySlug) => {
  if (!task) return taskType
  const url = `/productions/${task.project_id}/episodes/${task.episode_id || 'all'}/${entitySlug}/tasks/${task.id}`
  return { ...taskType, url }
}

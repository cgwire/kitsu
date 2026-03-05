const PRECISION_FACTOR = 10000
const DEFAULT_FPS = 25

const roundPrecision = value =>
  Math.round(value * PRECISION_FACTOR) / PRECISION_FACTOR

/*
 * Make sure that given time matches a frame in the video
 */
export const roundToFrame = (time, fps) => {
  const frameFactor = roundPrecision(1 / fps)
  const frameNumber = Math.round(time / frameFactor)
  return roundPrecision(frameNumber * frameFactor)
}

export const ceilToFrame = (time, fps) => {
  const frameFactor = roundPrecision(1 / fps)
  const frameNumber = Math.ceil(time / frameFactor)
  return (
    Math.ceil(frameNumber * frameFactor * PRECISION_FACTOR) / PRECISION_FACTOR
  )
}

export const floorToFrame = (time, fps) => {
  const frameFactor = roundPrecision(1 / fps)
  const frameNumber = Math.floor(time / frameFactor)
  return (
    Math.floor(frameNumber * frameFactor * PRECISION_FACTOR) / PRECISION_FACTOR
  )
}

/*
 * Turn a frame number into seconds depending on context.
 */
export const frameToSeconds = (nbFrames, production, shot) => {
  let fps = DEFAULT_FPS
  if (shot && shot.fps) fps = shot.fps
  if (production && production.fps) fps = production.fps
  return Math.round((nbFrames / fps) * 1000) / 1000
}

/*
 * Display time in a timecode format.
 */
export const formatTime = (rawTime, fps) => {
  if (rawTime < 0) rawTime = 0

  const time = new Date(1000 * rawTime).toISOString()
  const milliseconds = parseInt(time.substring(20, 23))
  const frameDuration = roundPrecision(1 / fps)
  const frame = `${Math.round(milliseconds / (1000 * frameDuration))}`.padStart(
    2,
    '0'
  )
  try {
    return `${time.substring(11, 19)}:${frame}`
  } catch (err) {
    console.error(err)
    return '00:00:00:00'
  }
}

/**
 * Get timecode from frame number.
 */
export const formatToTimecode = (frame, fps = DEFAULT_FPS) => {
  if (!frame || frame < 0) frame = 0
  const hours = Math.floor(frame / fps / 3600)
    .toString()
    .padStart(2, '0')
  const minutes = Math.floor((frame - hours * fps * 3600) / fps / 60)
    .toString()
    .padStart(2, '0')
  const seconds = Math.floor(
    (frame - hours * fps * 3600 - minutes * fps * 60) / fps
  )
    .toString()
    .padStart(2, '0')
  const frames = (frame % fps).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}:${frames}`
}

/*
 * Convert frame to a frame string.
 */
export const formatFrame = frame => {
  if (frame < 0) frame = 0
  return `${frame}`.padStart(3, '0')
}

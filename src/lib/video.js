const PRECISION_FACTOR = 10000
export const DEFAULT_FPS = 25
// Seeking exactly on a frame boundary can decode the previous frame (the
// browser truncates the time to its timescale), so seeks aim just past it.
export const SEEK_NUDGE = 0.001

/*
 * Time to seek so the decoder lands on the start of the given frame. Uses
 * the unrounded fps: frame * frameDuration drifts along the clip.
 */
export const frameStartTime = (frame, fps) => frame / fps + SEEK_NUDGE

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
 * Timecodes count whole frames: a fractional rate counts on its nominal one,
 * as non-drop-frame timecodes do (29.97 fps counts 30 frames a second).
 */
const getTimecodeRate = fps => {
  const rate = Math.round(parseFloat(fps))
  return rate > 0 && Number.isFinite(rate) ? rate : DEFAULT_FPS
}

/**
 * Get timecode from frame number.
 */
export const formatToTimecode = (frame, fps) => {
  fps = getTimecodeRate(fps)
  frame = Math.round(frame)
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
 * Display time in a timecode format: the timecode of the nearest frame.
 */
export const formatTime = (rawTime, fps) => {
  if (!Number.isFinite(rawTime) || rawTime < 0) rawTime = 0
  let rate = parseFloat(fps)
  if (!Number.isFinite(rate) || rate <= 0) rate = DEFAULT_FPS
  return formatToTimecode(Math.round(rawTime * rate), rate)
}

/*
 * Convert frame to a frame string.
 */
export const formatFrame = frame => {
  if (frame < 0) frame = 0
  return `${frame}`.padStart(3, '0')
}

/*
 * Get the production start frame of an entity (a shot numbered from
 * data.frame_in, e.g. 1001). Returns undefined when the entity carries no
 * usable value.
 */
export const getEntityFrameStart = entity => {
  const frameIn = parseInt(entity?.data?.frame_in)
  return frameIn > 0 ? frameIn : undefined
}

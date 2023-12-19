/*
 * Make sure that given time matches a frame in the video
 */
export const roundToFrame = (time, fps) => {
  const frameFactor = Math.round((1 / fps) * 10000) / 10000
  const frameNumber = Math.round(time / frameFactor)
  let roundedTime = frameNumber * frameFactor
  roundedTime = Math.round(roundedTime * 10000) / 10000
  return roundedTime
}

export const ceilToFrame = (time, fps) => {
  const frameFactor = Math.round((1 / fps) * 10000) / 10000
  const frameNumber = Math.ceil(time / frameFactor)
  let roundedTime = frameNumber * frameFactor
  roundedTime = Math.ceil(roundedTime * 10000) / 10000
  return roundedTime
}

export const floorToFrame = (time, fps) => {
  const frameFactor = Math.round((1 / fps) * 10000) / 10000
  const frameNumber = Math.floor(time / frameFactor)
  let roundedTime = frameNumber * frameFactor
  roundedTime = Math.floor(roundedTime * 10000) / 10000
  return roundedTime
}

/*
 * Turn a frame number into seconds depending on context.
 */
export const frameToSeconds = (nbFrames, production, shot) => {
  let fps = 25
  if (shot && shot.fps) fps = shot.fps
  if (production && production.fps) fps = production.fps
  return Math.round((nbFrames / fps) * 1000) / 1000
}

/*
 * Display time at this format.
 */
export const formatTime = seconds => {
  if (seconds < 0) seconds = 0
  let centiseconds = `${Math.round((seconds % 1) * 100)}`.padStart(2, '0')
  centiseconds = '.' + centiseconds
  try {
    return new Date(1000 * seconds).toISOString().substr(11, 8) + centiseconds
  } catch (err) {
    console.error(err)
    return '00:00:00.00'
  }
}

/*
 * Convert frame to a frame string.
 */
export const formatFrame = frame => {
  if (frame < 0) frame = 0
  return `${frame}`.padStart(3, '0')
}

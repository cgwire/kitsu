export const roundToFrame = (time, fps) => {
  const frameFactor = Math.round((1 / fps) * 100) / 100
  const frameNumber = Math.round(time / frameFactor)
  let roundedTime = frameNumber * frameFactor
  roundedTime = Math.round((roundedTime) * 100) / 100
  return roundedTime
}

export const frameToSeconds = (nbFrames, production, shot) => {
  let fps = 25
  if (shot && shot.fps) fps = shot.fps
  if (production && production.fps) fps = production.fps
  return Math.round((nbFrames / fps) * 100) / 100
}

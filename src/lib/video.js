export const roundToFrame = (time, fps) => {
  const frameFactor = Math.round((1 / fps) * 100) / 100
  const frameNumber = Math.round(time / frameFactor)
  let roundedTime = frameNumber * frameFactor
  roundedTime = Math.round((roundedTime) * 100) / 100
  return roundedTime
}

/*
 * Moves a viewer's panzoom from code, for the finger gestures of the
 * players (useTouchNavigation), and finds the spot of the main media that a
 * point over a compared one stands for. A paused panzoom stays still, as it
 * does for the mouse.
 */

export const panPanzoomBy = (instance, dx, dy) => {
  if (instance && !instance.isPaused()) instance.moveBy(dx, dy)
}

// The translation panzoom last wrote on the media, as matrix(s, 0, 0, s, x,
// y). The box of the media follows it, while getTransform() runs ahead of
// it until the next frame.
const appliedTranslation = media => {
  const [, , , , x = 0, y = 0] = (
    media.style.transform.match(/-?[\d.]+(e-?\d+)?/g) || []
  ).map(Number)
  return { x, y }
}

// zoomTo takes the point from the top-left corner of the media before its
// transform. That corner is not the one of its parent when the media is
// centered in it, as a movie in a phone held upright.
export const zoomPanzoomAt = (instance, media, clientX, clientY, ratio) => {
  if (!instance || instance.isPaused() || !media) return
  const { left, top } = media.getBoundingClientRect()
  const { x, y } = appliedTranslation(media)
  instance.zoomTo(clientX - left + x, clientY - top + y, ratio)
}

// A hidden element has an empty box.
const isInside = (box, x, y) =>
  box?.width > 0 &&
  box.height > 0 &&
  x >= box.left &&
  x <= box.right &&
  y >= box.top &&
  y <= box.bottom

// A compared media mirrors the transform of the main one: a point over the
// comparison viewer, beside the main one, stands for the same spot of the
// main media. Laid over the main viewer, the comparison shares its points.
// The boxes are those of both viewers and both media.
export const pointOnMainMedia = (
  clientX,
  clientY,
  { mainArea, comparisonArea, main, compared }
) => {
  const isBesideMain =
    isInside(comparisonArea, clientX, clientY) &&
    !isInside(mainArea, clientX, clientY)
  if (!isBesideMain || !main || !compared) {
    return { x: clientX, y: clientY }
  }
  return {
    x: clientX - compared.left + main.left,
    y: clientY - compared.top + main.top
  }
}

/*
 * Onion skin helpers.
 *
 * Pure logic for the annotation onion skin: pick the neighbouring annotated
 * frames around the current frame and compute each ghost's opacity from its
 * distance. No Vue / no canvas here so it stays unit-testable.
 */

export const ONION_MIN_OPACITY = 0.1
export const ONION_MAX_OPACITY = 0.55

/*
 * Opacity of a ghost annotation `distance` frames away from the current frame,
 * for a span of `n` frames on each side. Linear fade from ONION_MAX_OPACITY at
 * distance 1, floored at ONION_MIN_OPACITY so the farthest ghost stays faintly
 * visible. Returns 0 for invalid inputs.
 */
export const onionOpacity = (distance, n) => {
  if (distance < 1 || n < 1) return 0
  const step = (ONION_MAX_OPACITY - ONION_MIN_OPACITY) / n
  const opacity = ONION_MAX_OPACITY - (distance - 1) * step
  return Math.max(ONION_MIN_OPACITY, Math.min(ONION_MAX_OPACITY, opacity))
}

/*
 * Neighbours to ghost around `currentFrame`: up to `n` frames before and after
 * that actually carry an annotation, clamped to [0, nbFrames - 1]. The current
 * frame itself is never included (it holds the editable annotation).
 *
 * `getAnnotationAtFrame(frame)` returns the annotation on that frame, or a
 * falsy value when none. `nbFrames` is optional; when omitted only the lower
 * bound (>= 0) is enforced.
 *
 * Returns [{ annotation, distance, frame }], nearest distances first.
 */
export const selectOnionNeighbors = (
  currentFrame,
  n,
  getAnnotationAtFrame,
  nbFrames
) => {
  const inRange = frame =>
    frame >= 0 && (nbFrames == null || frame <= nbFrames - 1)
  return Array.from({ length: Math.max(0, n) }, (_, i) => i + 1)
    .flatMap(distance =>
      [currentFrame - distance, currentFrame + distance]
        .filter(inRange)
        .map(frame => ({
          frame,
          distance,
          annotation: getAnnotationAtFrame(frame)
        }))
    )
    .filter(entry => entry.annotation)
}

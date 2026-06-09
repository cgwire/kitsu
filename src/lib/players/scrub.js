/*
 * Positional-relative scrub mapping.
 *
 * Maps a horizontal drag (in pixels) to a frame, anchored on the frame
 * where the drag started: the full reference width spans the whole clip,
 * so dragging across the player traverses the clip regardless of its
 * length. Anchoring on the start frame (rather than accumulating per
 * move event) keeps it drift-free — a back-and-forth drag returns to the
 * exact starting frame.
 */
export const scrubFrame = ({ startFrame, deltaPx, width, frameCount }) => {
  if (!width || frameCount <= 1) return startFrame
  const lastFrame = frameCount - 1
  const target = startFrame + Math.round((deltaPx * lastFrame) / width)
  return Math.max(0, Math.min(lastFrame, target))
}

const ANCHOR_GAP = 4
const VIEWPORT_MARGIN = 8

// Style of a fixed popup opened from an anchor (a list cell), kept inside the
// viewport: below the anchor when the popup height fits there, else above it
// when it fits there, else on the side with more room. The max height bounds
// the popup to the room on its side, resized content included.
export const getPopupStyle = (anchor, popup, viewport) => {
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchor.left, viewport.width - popup.width - VIEWPORT_MARGIN)
  )
  // Clamped for an anchor that sticks out of the viewport.
  const belowTop = Math.max(anchor.bottom + ANCHOR_GAP, VIEWPORT_MARGIN)
  const aboveBottom = Math.min(
    anchor.top - ANCHOR_GAP,
    viewport.height - VIEWPORT_MARGIN
  )
  const roomBelow = viewport.height - VIEWPORT_MARGIN - belowTop
  const roomAbove = aboveBottom - VIEWPORT_MARGIN
  const isBelow =
    roomBelow >= popup.height ||
    (roomAbove < popup.height && roomBelow >= roomAbove)
  const style = { left: `${left}px`, width: `${popup.width}px` }
  if (isBelow) {
    return { ...style, top: `${belowTop}px`, maxHeight: `${roomBelow}px` }
  }
  // Pinned by its bottom edge: the real height may differ from the given one.
  return {
    ...style,
    bottom: `${viewport.height - aboveBottom}px`,
    maxHeight: `${roomAbove}px`
  }
}

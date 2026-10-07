const ANCHOR_GAP = 4
const VIEWPORT_MARGIN = 8

// Placement of a fixed popup opened from an anchor (a list cell), kept inside
// the viewport: below the anchor when the popup height fits there, else above
// it when it fits there, else on the side with more room. The room is the
// height left on that side: the style max height bounds the popup to it,
// resized content included. A negative gap overlaps the anchor edge.
export const getPopupPlacement = (
  anchor,
  popup,
  viewport,
  gap = ANCHOR_GAP
) => {
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchor.left, viewport.width - popup.width - VIEWPORT_MARGIN)
  )
  // Clamped for an anchor that sticks out of the viewport.
  const belowTop = Math.max(anchor.bottom + gap, VIEWPORT_MARGIN)
  const aboveBottom = Math.min(
    anchor.top - gap,
    viewport.height - VIEWPORT_MARGIN
  )
  const roomBelow = viewport.height - VIEWPORT_MARGIN - belowTop
  const roomAbove = aboveBottom - VIEWPORT_MARGIN
  const isBelow =
    roomBelow >= popup.height ||
    (roomAbove < popup.height && roomBelow >= roomAbove)
  const room = isBelow ? roomBelow : roomAbove
  // Above, pinned by its bottom edge: the real height may differ from the
  // given one.
  const position = isBelow
    ? { top: `${belowTop}px` }
    : { bottom: `${viewport.height - aboveBottom}px` }
  return {
    isBelow,
    room,
    style: {
      left: `${left}px`,
      width: `${popup.width}px`,
      ...position,
      maxHeight: `${room}px`
    }
  }
}

export const getPopupStyle = (anchor, popup, viewport, gap) =>
  getPopupPlacement(anchor, popup, viewport, gap).style

/*
 * Finger navigation on a player: one finger pans the media, two fingers
 * pinch-zoom it. The stylus and the mouse keep annotating: fingers never
 * reach the annotation canvas, and they are ignored while a pen is down,
 * which also leaves out the palm resting on the screen.
 *
 * panzoom's own touch handling is kept out: it listens on the media's
 * parent only, so it missed the fingers landing on the annotation
 * overlay, and a pinch started beside the media divided by a length it
 * never measured ("zoom requires valid numbers").
 */
import { onBeforeUnmount, onMounted, toValue } from 'vue'

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const middle = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/**
 * @param {Object} options
 * @param {Ref<HTMLElement>} options.container element holding the surfaces
 * @param {Function} options.surfaces elements where a finger navigates:
 *   the annotation overlay and the media's parent
 * @param {Ref<Boolean>} options.isEnabled
 * @param {Function} options.panBy (dx, dy) in screen pixels
 * @param {Function} options.zoomAt (clientX, clientY, ratio)
 */
export const useTouchNavigation = ({
  container,
  surfaces,
  isEnabled,
  panBy,
  zoomAt
}) => {
  // Fingers by pointer id, in landing order: the first two drive the
  // gesture.
  const fingers = new Map()
  const pens = new Set()

  const isOnSurface = event =>
    toValue(surfaces).some(surface => surface?.contains(event.target))

  const isNavigatingFinger = event =>
    event.pointerType === 'touch' && toValue(isEnabled) && isOnSurface(event)

  const onPointerDown = event => {
    if (event.pointerType === 'pen') {
      pens.add(event.pointerId)
      fingers.clear()
    } else if (isNavigatingFinger(event)) {
      event.stopPropagation()
      if (pens.size === 0) {
        fingers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      }
    }
  }

  const onPointerMove = event => {
    if (!isNavigatingFinger(event)) return
    event.stopPropagation()
    const drivers = [...fingers.entries()].slice(0, 2)
    const index = drivers.findIndex(
      ([pointerId]) => pointerId === event.pointerId
    )
    if (index === -1) {
      // A finger past the first two drives from where it is once one of
      // them lifts.
      if (fingers.has(event.pointerId)) {
        fingers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      }
      return
    }
    const before = drivers.map(([, point]) => point)
    const point = { x: event.clientX, y: event.clientY }
    fingers.set(event.pointerId, point)
    if (before.length === 1) {
      panBy(point.x - before[0].x, point.y - before[0].y)
    } else {
      const after = before.map((previous, i) =>
        i === index ? point : previous
      )
      const from = middle(...before)
      const to = middle(...after)
      panBy(to.x - from.x, to.y - from.y)
      const length = distance(...before)
      if (length > 0) zoomAt(to.x, to.y, distance(...after) / length)
    }
  }

  const onPointerUp = event => {
    pens.delete(event.pointerId)
    if (isNavigatingFinger(event)) event.stopPropagation()
    fingers.delete(event.pointerId)
  }

  const onTouchStart = event => {
    if (toValue(isEnabled) && isOnSurface(event)) event.stopPropagation()
  }

  // Capture phase: the container sees the events before the overlay and
  // the media's parent, where fabric and panzoom listen.
  const listeners = [
    ['pointerdown', onPointerDown, { capture: true }],
    ['pointermove', onPointerMove, { capture: true }],
    ['touchstart', onTouchStart, { capture: true, passive: true }]
  ]
  // A pen or a finger can be lifted out of the player: a pen left down
  // would block the fingers.
  const windowListeners = [
    ['pointerup', onPointerUp, { capture: true }],
    ['pointercancel', onPointerUp, { capture: true }]
  ]
  let element = null

  onMounted(() => {
    element = toValue(container)
    listeners.forEach(([type, listener, options]) =>
      element?.addEventListener(type, listener, options)
    )
    windowListeners.forEach(([type, listener, options]) =>
      window.addEventListener(type, listener, options)
    )
  })

  onBeforeUnmount(() => {
    listeners.forEach(([type, listener, options]) =>
      element?.removeEventListener(type, listener, options)
    )
    windowListeners.forEach(([type, listener, options]) =>
      window.removeEventListener(type, listener, options)
    )
    element = null
    fingers.clear()
    pens.clear()
  })
}

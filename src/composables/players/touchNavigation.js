/*
 * Finger gestures on a player. Two fingers navigate: they pan and
 * pinch-zoom the media. One finger uses the annotation tool turned on, as
 * the mouse does, and pans the media when none is.
 *
 * Once a stylus has touched a player, the fingers only navigate until the
 * page reloads: the palm resting on the screen while drawing would leave
 * marks. They are also ignored while a pen is down.
 *
 * A finger landing on the annotations waits a moment before the tool gets
 * it: a second finger landing meanwhile makes a pinch, of which fabric
 * never hears. A finger moving away draws at once.
 *
 * panzoom's own touch handling is kept out: it listens on the media's
 * parent only, so it missed the fingers landing on the annotation
 * overlay, and a pinch started beside the media divided by a length it
 * never measured ("zoom requires valid numbers").
 */
import { onBeforeUnmount, onMounted, toValue } from 'vue'

// How long and how far a finger on the annotations waits for a second one.
const HOLD_DELAY = 300
const HOLD_DISTANCE = 16

// What fabric and the brushes read from a pointer event.
const POINTER_FIELDS = [
  'pointerId',
  'pointerType',
  'isPrimary',
  'clientX',
  'clientY',
  'pressure'
]

// Shared by the players of the page.
let isStylusUsed = false

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

const middle = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

const pointOf = event => ({ x: event.clientX, y: event.clientY })

const pointerInit = event =>
  Object.fromEntries(POINTER_FIELDS.map(field => [field, event[field]]))

/**
 * @param {Object} options
 * @param {Ref<HTMLElement>} options.container element holding the surfaces
 * @param {Function} options.surfaces elements where a finger navigates:
 *   the annotation overlay and the media's parent
 * @param {Function} options.overlay the annotation overlay, where one
 *   finger uses the tool turned on
 * @param {Ref<Boolean>} options.isAnnotating an annotation tool is on
 * @param {Ref<Boolean>} options.isEnabled
 * @param {Function} options.panBy (dx, dy) in screen pixels
 * @param {Function} options.zoomAt (clientX, clientY, ratio)
 */
export const useTouchNavigation = ({
  container,
  surfaces,
  overlay,
  isAnnotating,
  isEnabled,
  panBy,
  zoomAt
}) => {
  // Navigating fingers by pointer id, in landing order: the first two
  // drive the gesture.
  const fingers = new Map()
  const pens = new Set()
  // The finger on the annotations waiting for a second one, then the
  // finger the tool got, with its last event.
  let heldFinger = null
  let toolFinger = null
  // The events of the held finger, played again for the tool.
  const replays = new WeakSet()

  const isOnSurface = event =>
    toValue(surfaces).some(surface => surface?.contains(event.target))

  const isPlayerFinger = event =>
    event.pointerType === 'touch' && toValue(isEnabled) && isOnSurface(event)

  const isForTool = event =>
    toValue(isAnnotating) &&
    !isStylusUsed &&
    Boolean(toValue(overlay)?.contains(event.target))

  const replay = (target, type, init) => {
    const event = new PointerEvent(type, {
      ...init,
      bubbles: true,
      cancelable: true,
      composed: true
    })
    replays.add(event)
    target.dispatchEvent(event)
  }

  const dropHeldFinger = () => {
    clearTimeout(heldFinger?.timer)
    heldFinger = null
  }

  const handOver = () => {
    const { pointerId, target, events } = heldFinger
    dropHeldFinger()
    toolFinger = { pointerId, target, init: events[events.length - 1][1] }
    events.forEach(([type, init]) => replay(target, type, init))
  }

  // The brush follows one pointer type: once lifted, a finger still holding
  // the tool, a palm resting before the first pen contact, ended the stroke
  // of the pen. Its own stroke ends where the pen lands.
  const releaseToolFinger = () => {
    if (!toolFinger) return
    const { target, init } = toolFinger
    toolFinger = null
    replay(target, 'pointerup', init)
  }

  const holdFinger = event => {
    heldFinger = {
      pointerId: event.pointerId,
      target: event.target,
      start: pointOf(event),
      point: pointOf(event),
      events: [['pointerdown', pointerInit(event)]],
      timer: setTimeout(handOver, HOLD_DELAY)
    }
  }

  const onPointerDown = event => {
    if (replays.has(event)) return
    if (event.pointerType === 'pen') {
      isStylusUsed = true
      pens.add(event.pointerId)
      fingers.clear()
      dropHeldFinger()
      releaseToolFinger()
    } else if (isPlayerFinger(event)) {
      event.stopPropagation()
      if (pens.size > 0 || toolFinger) return
      if (heldFinger) {
        // A second finger: a pinch.
        fingers.set(heldFinger.pointerId, heldFinger.point)
        dropHeldFinger()
        fingers.set(event.pointerId, pointOf(event))
      } else if (fingers.size === 0 && isForTool(event)) {
        holdFinger(event)
      } else {
        fingers.set(event.pointerId, pointOf(event))
      }
    }
  }

  const onPointerMove = event => {
    if (!isPlayerFinger(event)) return
    if (event.pointerId === toolFinger?.pointerId) {
      toolFinger.init = pointerInit(event)
      return
    }
    event.stopPropagation()
    if (event.pointerId === heldFinger?.pointerId) {
      heldFinger.events.push(['pointermove', pointerInit(event)])
      heldFinger.point = pointOf(event)
      if (distance(heldFinger.start, heldFinger.point) > HOLD_DISTANCE) {
        handOver()
      }
      return
    }
    const drivers = [...fingers.entries()].slice(0, 2)
    const index = drivers.findIndex(
      ([pointerId]) => pointerId === event.pointerId
    )
    if (index === -1) {
      // A finger past the first two drives from where it is once one of
      // them lifts.
      if (fingers.has(event.pointerId)) {
        fingers.set(event.pointerId, pointOf(event))
      }
      return
    }
    const before = drivers.map(([, point]) => point)
    const point = pointOf(event)
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
    if (replays.has(event)) return
    pens.delete(event.pointerId)
    if (event.pointerId === heldFinger?.pointerId) {
      // A tap goes to the tool, a finger the system cancels does not.
      if (event.type === 'pointerup') handOver()
      else dropHeldFinger()
    }
    if (event.pointerId === toolFinger?.pointerId) {
      toolFinger = null
      // fabric does not listen to pointercancel: end the stroke there.
      if (event.type === 'pointercancel') {
        replay(event.target, 'pointerup', pointerInit(event))
      }
      return
    }
    if (isPlayerFinger(event)) event.stopPropagation()
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
    dropHeldFinger()
    fingers.clear()
    pens.clear()
  })
}

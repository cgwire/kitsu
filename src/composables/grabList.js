/*
 * Grab-and-drag scrolling for list wrappers.
 *
 * Wire `startBrowsing` on the grabbable area (tbody usually); document
 * level move/stop listeners are managed here.
 */
import { onBeforeUnmount, onMounted } from 'vue'

import {
  addEvents,
  getClientX,
  getClientY,
  removeEvents
} from '@/composables/dom'

const FORM_TAGS = ['INPUT', 'SELECT', 'TEXTAREA']

export const useGrabList = wrapperRef => {
  let isBrowsing = false
  let initialClientX = null
  let initialClientY = null

  const startBrowsing = event => {
    if (FORM_TAGS.includes(event.target.tagName)) return
    document.body.style.cursor = 'grabbing'
    isBrowsing = true
    initialClientX = getClientX(event)
    initialClientY = getClientY(event)
  }

  const stopBrowsing = () => {
    if (!isBrowsing) return
    document.body.style.cursor = 'default'
    isBrowsing = false
    initialClientX = null
    initialClientY = null
  }

  const onMouseMove = event => {
    const wrapper = wrapperRef.value
    if (!isBrowsing || !wrapper) return
    const movementX = event.movementX || getClientX(event) - initialClientX
    const movementY = event.movementY || getClientY(event) - initialClientY
    initialClientX = getClientX(event)
    initialClientY = getClientY(event)
    wrapper.scrollLeft -= movementX
    wrapper.scrollTop -= movementY
  }

  const documentEvents = [
    ['mousemove', onMouseMove],
    ['touchmove', onMouseMove],
    ['mouseup', stopBrowsing],
    ['mouseleave', stopBrowsing],
    ['touchend', stopBrowsing],
    ['touchcancel', stopBrowsing],
    ['keyup', stopBrowsing]
  ]

  onMounted(() => {
    addEvents(documentEvents)
  })

  onBeforeUnmount(() => {
    stopBrowsing()
    removeEvents(documentEvents)
  })

  return { startBrowsing }
}

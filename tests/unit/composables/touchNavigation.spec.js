import { mount } from '@vue/test-utils'
import { defineComponent, h, onMounted, ref } from 'vue'

import { useTouchNavigation } from '@/composables/players/touchNavigation'

// A player: the annotation overlay and the media's parent (the panzoom
// owner) are the surfaces, the rest of the container is not. The surfaces
// are kept past the unmount, which clears the template refs. Attached to
// the document: a pen or a finger can be lifted out of the player.
const mountNavigation = ({ isEnabled = ref(true) } = {}) => {
  const panBy = vi.fn()
  const zoomAt = vi.fn()
  const container = ref(null)
  const overlay = ref(null)
  const owner = ref(null)
  let surfaces = []
  const Host = defineComponent({
    setup() {
      useTouchNavigation({
        container,
        surfaces: () => surfaces,
        isEnabled,
        panBy,
        zoomAt
      })
      onMounted(() => {
        surfaces = [overlay.value, owner.value]
      })
      return () =>
        h('div', { ref: container }, [
          h('div', { ref: overlay }, [h('canvas', { class: 'upper' })]),
          h('div', { ref: owner }, [h('canvas', { class: 'media' })]),
          h('div', { class: 'elsewhere' })
        ])
    }
  })
  const wrapper = mount(Host, { attachTo: document.body })
  const element = selector => wrapper.find(selector).element
  return { wrapper, element, panBy, zoomAt }
}

const pointer = (target, type, { id = 1, kind = 'touch', x = 0, y = 0 }) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y
  })
  Object.defineProperties(event, {
    pointerId: { value: id },
    pointerType: { value: kind }
  })
  target.dispatchEvent(event)
}

const touchStart = target =>
  target.dispatchEvent(new Event('touchstart', { bubbles: true }))

describe('composables/touchNavigation', () => {
  let wrapper

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
  })

  it.each(['.upper', '.media'])('pans with one finger on %s', selector => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const surface = navigation.element(selector)

    pointer(surface, 'pointerdown', { x: 100, y: 100 })
    pointer(surface, 'pointermove', { x: 110, y: 95 })
    pointer(surface, 'pointermove', { x: 130, y: 95 })

    expect(navigation.panBy.mock.calls).toEqual([
      [10, -5],
      [20, 0]
    ])
    expect(navigation.zoomAt).not.toHaveBeenCalled()
  })

  it('zooms a pinch around the middle of the fingers', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, x: 100, y: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 200, y: 100 })
    pointer(upper, 'pointermove', { id: 2, x: 300, y: 100 })

    expect(navigation.panBy.mock.calls).toEqual([[50, 0]])
    expect(navigation.zoomAt.mock.calls).toEqual([[200, 100, 2]])
  })

  it('pinches with a finger on the media and one on the overlay', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper

    pointer(navigation.element('.media'), 'pointerdown', { id: 1, x: 100 })
    pointer(navigation.element('.upper'), 'pointerdown', { id: 2, x: 200 })
    pointer(navigation.element('.upper'), 'pointermove', { id: 2, x: 300 })

    expect(navigation.zoomAt.mock.calls).toEqual([[200, 0, 2]])
  })

  it('pans on with the finger left after a pinch', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, x: 100, y: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 200, y: 100 })
    pointer(upper, 'pointerup', { id: 2, x: 200, y: 100 })
    pointer(upper, 'pointermove', { id: 1, x: 90, y: 100 })

    expect(navigation.panBy.mock.calls).toEqual([[-10, 0]])
  })

  it('pinches from where a third finger is once it takes over', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, x: 100, y: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 200, y: 100 })
    pointer(upper, 'pointerdown', { id: 3, x: 300, y: 100 })
    pointer(upper, 'pointermove', { id: 3, x: 400, y: 100 })
    pointer(upper, 'pointerup', { id: 1, x: 100, y: 100 })
    pointer(upper, 'pointermove', { id: 3, x: 420, y: 100 })

    expect(navigation.panBy.mock.calls).toEqual([[10, 0]])
    expect(navigation.zoomAt.mock.calls).toEqual([[310, 100, 1.1]])
  })

  it('gives no zoom for two fingers on the same spot', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, x: 100, y: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 100, y: 100 })
    pointer(upper, 'pointermove', { id: 2, x: 120, y: 100 })

    expect(navigation.zoomAt).not.toHaveBeenCalled()
    expect(navigation.panBy.mock.calls).toEqual([[10, 0]])
  })

  it('keeps the fingers away from the annotation canvas', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const seen = []
    upper.addEventListener('pointerdown', event => seen.push(event.pointerType))

    pointer(upper, 'pointerdown', { id: 1, kind: 'touch' })
    pointer(upper, 'pointerdown', { id: 2, kind: 'pen' })
    pointer(upper, 'pointerdown', { id: 3, kind: 'mouse' })

    expect(seen).toEqual(['pen', 'mouse'])
  })

  it('keeps the touches away from the own touch handling of panzoom', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const media = navigation.element('.media')
    const panzoomTouchStart = vi.fn()
    media.parentElement.addEventListener('touchstart', panzoomTouchStart)

    touchStart(media)

    expect(panzoomTouchStart).not.toHaveBeenCalled()
  })

  it('ignores the fingers while the pen draws', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, kind: 'pen', x: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 300 })
    pointer(upper, 'pointermove', { id: 2, x: 320 })

    expect(navigation.panBy).not.toHaveBeenCalled()
  })

  it('stops a finger already down once the pen lands', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    pointer(upper, 'pointermove', { id: 1, x: 110 })
    pointer(upper, 'pointerdown', { id: 2, kind: 'pen', x: 300 })
    pointer(upper, 'pointermove', { id: 1, x: 130 })

    expect(navigation.panBy.mock.calls).toEqual([[10, 0]])
  })

  it('navigates again once the pen is lifted', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, kind: 'pen' })
    pointer(upper, 'pointerup', { id: 1, kind: 'pen' })
    pointer(upper, 'pointerdown', { id: 2, x: 300 })
    pointer(upper, 'pointermove', { id: 2, x: 320 })

    expect(navigation.panBy.mock.calls).toEqual([[20, 0]])
  })

  it('navigates again once the pen is lifted out of the player', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, kind: 'pen' })
    pointer(document.body, 'pointerup', { id: 1, kind: 'pen' })
    pointer(upper, 'pointerdown', { id: 2, x: 300 })
    pointer(upper, 'pointermove', { id: 2, x: 320 })

    expect(navigation.panBy.mock.calls).toEqual([[20, 0]])
  })

  it('forgets a finger lifted out of the player', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    pointer(document.body, 'pointerup', { id: 1, x: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 300 })
    pointer(upper, 'pointermove', { id: 2, x: 320 })

    expect(navigation.zoomAt).not.toHaveBeenCalled()
    expect(navigation.panBy.mock.calls).toEqual([[20, 0]])
  })

  it('leaves the fingers landing out of the surfaces alone', () => {
    const navigation = mountNavigation()
    wrapper = navigation.wrapper
    const elsewhere = navigation.element('.elsewhere')
    const seen = vi.fn()
    elsewhere.addEventListener('pointerdown', seen)
    elsewhere.addEventListener('touchstart', seen)

    pointer(elsewhere, 'pointerdown', { x: 100 })
    pointer(elsewhere, 'pointermove', { x: 120 })
    touchStart(elsewhere)

    expect(navigation.panBy).not.toHaveBeenCalled()
    expect(seen).toHaveBeenCalledTimes(2)
  })

  it('leaves every event alone while disabled', () => {
    const navigation = mountNavigation({ isEnabled: ref(false) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const seen = vi.fn()
    upper.addEventListener('pointerdown', seen)
    upper.addEventListener('touchstart', seen)

    pointer(upper, 'pointerdown', { x: 100 })
    pointer(upper, 'pointermove', { x: 120 })
    touchStart(upper)

    expect(navigation.panBy).not.toHaveBeenCalled()
    expect(seen).toHaveBeenCalledTimes(2)
  })

  it('stops listening once unmounted', () => {
    const navigation = mountNavigation()
    const upper = navigation.element('.upper')
    const seen = vi.fn()
    upper.addEventListener('pointerdown', seen)

    navigation.wrapper.unmount()
    pointer(upper, 'pointerdown', { x: 100 })

    expect(seen).toHaveBeenCalledTimes(1)
  })

  // The task panel mounts a player for each task opened.
  it('removes its window listeners once unmounted', () => {
    const added = vi.spyOn(window, 'addEventListener')
    const removed = vi.spyOn(window, 'removeEventListener')
    const navigation = mountNavigation()
    const listeners = spy => spy.mock.calls.map(([type, fn]) => [type, fn])

    navigation.wrapper.unmount()

    expect(listeners(added).length).toBeGreaterThan(0)
    expect(listeners(removed)).toEqual(
      expect.arrayContaining(listeners(added))
    )
    added.mockRestore()
    removed.mockRestore()
  })
})

import { mount } from '@vue/test-utils'
import { defineComponent, h, onMounted, ref } from 'vue'

// The module remembers a stylus for the page's life: each test imports it
// afresh.
let useTouchNavigation

// A player: the annotation overlay and the media's parent (the panzoom
// owner) are the surfaces, the rest of the container is not. The surfaces
// are kept past the unmount, which clears the template refs. Attached to
// the document: a pen or a finger can be lifted out of the player.
const mountNavigation = ({
  isEnabled = ref(true),
  isAnnotating = ref(false)
} = {}) => {
  const panBy = vi.fn()
  const zoomAt = vi.fn()
  const container = ref(null)
  const overlay = ref(null)
  const owner = ref(null)
  let surfaces = []
  let annotationOverlay = null
  const Host = defineComponent({
    setup() {
      useTouchNavigation({
        container,
        surfaces: () => surfaces,
        overlay: () => annotationOverlay,
        isAnnotating,
        isEnabled,
        panBy,
        zoomAt
      })
      onMounted(() => {
        surfaces = [overlay.value, owner.value]
        annotationOverlay = overlay.value
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

const pointer = (
  target,
  type,
  { id = 1, kind = 'touch', x = 0, y = 0, ...init }
) =>
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerId: id,
      pointerType: kind,
      isPrimary: true,
      ...init
    })
  )

const touchStart = target =>
  target.dispatchEvent(new Event('touchstart', { bubbles: true }))

describe('composables/touchNavigation', () => {
  let wrapper
  let unlistens = []

  // What fabric hears: the pointerdown on its canvas, then the moves and
  // the release on the document.
  const listenLikeFabric = upper => {
    const heard = []
    const record = event =>
      heard.push([event.type, event.pointerId, event.clientX])
    upper.addEventListener('pointerdown', record)
    document.addEventListener('pointermove', record)
    document.addEventListener('pointerup', record)
    unlistens.push(() => {
      upper.removeEventListener('pointerdown', record)
      document.removeEventListener('pointermove', record)
      document.removeEventListener('pointerup', record)
    })
    return heard
  }

  beforeEach(async () => {
    vi.resetModules()
    ;({ useTouchNavigation } = await import(
      '@/composables/players/touchNavigation'
    ))
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    unlistens.forEach(unlisten => unlisten())
    unlistens = []
    vi.useRealTimers()
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

  it('hands a finger on the annotations to the tool after a moment', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { x: 100 })
    const heardFirst = [...heard]
    vi.advanceTimersByTime(300)
    pointer(upper, 'pointermove', { x: 105 })
    pointer(upper, 'pointerup', { x: 105 })

    expect(heardFirst).toEqual([])
    expect(heard).toEqual([
      ['pointerdown', 1, 100],
      ['pointermove', 1, 105],
      ['pointerup', 1, 105]
    ])
    expect(navigation.panBy).not.toHaveBeenCalled()
  })

  it('hands the finger to the tool as it landed', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    let down = null
    upper.addEventListener('pointerdown', event => {
      down = event
    })

    pointer(upper, 'pointerdown', { x: 100, y: 50, pressure: 0.25 })
    vi.advanceTimersByTime(300)

    expect(down).toMatchObject({
      pointerType: 'touch',
      isPrimary: true,
      clientX: 100,
      clientY: 50,
      pressure: 0.25
    })
  })

  it('hands a finger moving away to the tool at once', () => {
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { x: 100 })
    pointer(upper, 'pointermove', { x: 110 })
    const heardFirst = [...heard]
    pointer(upper, 'pointermove', { x: 130 })

    expect(heardFirst).toEqual([])
    expect(heard).toEqual([
      ['pointerdown', 1, 100],
      ['pointermove', 1, 110],
      ['pointermove', 1, 130]
    ])
  })

  it('hands a tap to the tool', () => {
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { x: 100 })
    pointer(upper, 'pointerup', { x: 100 })

    expect(heard).toEqual([
      ['pointerdown', 1, 100],
      ['pointerup', 1, 100]
    ])
  })

  it('zooms a pinch started while a tool is on', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 200 })
    pointer(upper, 'pointermove', { id: 2, x: 300 })
    vi.advanceTimersByTime(300)

    expect(navigation.zoomAt.mock.calls).toEqual([[200, 0, 2]])
    expect(heard).toEqual([])
  })

  it('zooms a pinch whose second finger lands a moment later', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    vi.advanceTimersByTime(250)
    pointer(upper, 'pointerdown', { id: 2, x: 200 })
    pointer(upper, 'pointermove', { id: 2, x: 300 })

    expect(navigation.zoomAt.mock.calls).toEqual([[200, 0, 2]])
    expect(heard).toEqual([])
  })

  it('pinches again with a finger landing back during a pinch', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 200 })
    pointer(upper, 'pointerup', { id: 2, x: 200 })
    pointer(upper, 'pointerdown', { id: 3, x: 200 })
    pointer(upper, 'pointermove', { id: 3, x: 300 })
    vi.advanceTimersByTime(300)

    expect(navigation.zoomAt.mock.calls).toEqual([[200, 0, 2]])
    expect(heard).toEqual([])
  })

  it('hands the next finger to the tool once the first lifted', () => {
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    pointer(upper, 'pointerup', { id: 1, x: 100 })
    pointer(upper, 'pointerdown', { id: 2, x: 200 })
    pointer(upper, 'pointerup', { id: 2, x: 200 })

    expect(heard).toEqual([
      ['pointerdown', 1, 100],
      ['pointerup', 1, 100],
      ['pointerdown', 2, 200],
      ['pointerup', 2, 200]
    ])
  })

  it('keeps a second finger away while one uses the tool', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    vi.advanceTimersByTime(300)
    pointer(upper, 'pointerdown', { id: 2, x: 200 })
    pointer(upper, 'pointermove', { id: 2, x: 300 })
    pointer(upper, 'pointerup', { id: 2, x: 300 })

    expect(heard).toEqual([['pointerdown', 1, 100]])
    expect(navigation.panBy).not.toHaveBeenCalled()
    expect(navigation.zoomAt).not.toHaveBeenCalled()
  })

  it('pans with a finger beside the annotations while a tool is on', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const media = navigation.element('.media')
    const heard = listenLikeFabric(navigation.element('.upper'))

    pointer(media, 'pointerdown', { x: 100 })
    pointer(media, 'pointermove', { x: 120 })
    vi.advanceTimersByTime(300)

    expect(navigation.panBy.mock.calls).toEqual([[20, 0]])
    expect(heard).toEqual([])
  })

  it('leaves the fingers to navigation once a stylus touched a player', () => {
    vi.useFakeTimers()
    const first = mountNavigation({ isAnnotating: ref(true) })
    pointer(first.element('.upper'), 'pointerdown', { id: 1, kind: 'pen' })
    pointer(first.element('.upper'), 'pointerup', { id: 1, kind: 'pen' })
    first.wrapper.unmount()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 2, x: 100 })
    pointer(upper, 'pointermove', { id: 2, x: 120 })
    vi.advanceTimersByTime(300)

    expect(navigation.panBy.mock.calls).toEqual([[20, 0]])
    expect(heard).toEqual([])
  })

  it('drops a finger waiting for the tool when a pen lands', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    pointer(upper, 'pointerdown', { id: 2, kind: 'pen', x: 300 })
    vi.advanceTimersByTime(300)

    expect(heard).toEqual([['pointerdown', 2, 300]])
  })

  // The brush follows one pointer type: a palm the tool got before the
  // first pen contact went on drawing, and its lift ended the pen's stroke.
  it('ends the stroke of the finger the tool got when a pen lands', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { id: 1, x: 100 })
    vi.advanceTimersByTime(300)
    pointer(upper, 'pointermove', { id: 1, x: 105 })
    pointer(upper, 'pointerdown', { id: 2, kind: 'pen', x: 300 })
    pointer(upper, 'pointermove', { id: 1, x: 110 })
    pointer(upper, 'pointermove', { id: 2, kind: 'pen', x: 310 })
    pointer(upper, 'pointerup', { id: 1, x: 110 })
    pointer(upper, 'pointerup', { id: 2, kind: 'pen', x: 310 })

    expect(heard).toEqual([
      ['pointerdown', 1, 100],
      ['pointermove', 1, 105],
      ['pointerup', 1, 105],
      ['pointerdown', 2, 300],
      ['pointermove', 2, 310],
      ['pointerup', 2, 310]
    ])
  })

  it('ends the stroke of a finger the system cancels', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { x: 100 })
    vi.advanceTimersByTime(300)
    pointer(upper, 'pointercancel', { x: 120 })

    expect(heard).toEqual([
      ['pointerdown', 1, 100],
      ['pointerup', 1, 120]
    ])
  })

  it('drops a finger the system cancels while it waits', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    wrapper = navigation.wrapper
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { x: 100 })
    pointer(upper, 'pointercancel', { x: 100 })
    vi.advanceTimersByTime(300)

    expect(heard).toEqual([])
  })

  it('hands nothing to the tool once unmounted', () => {
    vi.useFakeTimers()
    const navigation = mountNavigation({ isAnnotating: ref(true) })
    const upper = navigation.element('.upper')
    const heard = listenLikeFabric(upper)

    pointer(upper, 'pointerdown', { x: 100 })
    navigation.wrapper.unmount()
    vi.advanceTimersByTime(300)

    expect(heard).toEqual([])
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

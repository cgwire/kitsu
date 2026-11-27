import { mount } from '@vue/test-utils'

import VideoProgress from '@/components/players/progress/VideoProgress.vue'

// 24fps with the project-wide 4-decimal frame duration (roundPrecision(1/24)).
const FRAME_DURATION = 0.0417

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
})

afterAll(() => {
  vi.unstubAllGlobals()
})

const mountProgress = (props = {}) =>
  mount(VideoProgress, {
    props: {
      frameDuration: FRAME_DURATION,
      fps: 24,
      nbFrames: 200,
      ...props
    }
  })

describe('players/VideoProgress', () => {
  describe('clicking an annotation marker', () => {
    it('emits the frame the marker is displayed on', async () => {
      // Annotation times sit on the frame grid (N * frameDuration, rounded to
      // 4 decimals, as produced by roundToFrame). For about half of them the
      // float quotient time / frameDuration lands just below the integer
      // (e.g. 0.1251 / 0.0417 = 2.9999…), so a floor() lands one frame early
      // while the marker itself is drawn with round().
      const annotations = [3, 6, 12, 15, 100].map(frame => ({
        time: Number((frame * FRAME_DURATION).toFixed(4)),
        drawing: { objects: [] }
      }))
      const wrapper = mountProgress({ annotations })
      const marks = wrapper.findAll('.annotation-mark')
      expect(marks).toHaveLength(annotations.length)
      for (const mark of marks) await mark.trigger('click')
      const emitted = wrapper.emitted('progress-changed').map(([f]) => f)
      expect(emitted).toEqual([3, 6, 12, 15, 100])
    })
  })

  describe('clicking the bar', () => {
    it('emits the frame under the cursor on its first pixel', async () => {
      // A click on the first pixel of frame 3 maps to exactly 3 frames, and
      // 3 * 0.0417 / 0.0417 is 2.9999… in floating point: floor() sent the
      // click one frame early on every frame boundary column.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
        { left: 0, top: 0, width: 1000, height: 28 }
      )
      const wrapper = mountProgress({ nbFrames: 100 })
      await wrapper.find('progress').trigger('click', { clientX: 30 })
      expect(wrapper.emitted('progress-changed')).toEqual([[3]])
    })
  })

  // A width read while the bar was hidden stuck at 0, as the size the
  // observer reported last did not change: every click went to frame 0.
  describe('width of the bar', () => {
    let rect
    let onResize

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback) {
            onResize = callback
          }
          observe() {}
          disconnect() {}
        }
      )
      rect = { left: 0, top: 0, width: 0, height: 28 }
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
        () => rect
      )
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    const show = () => {
      rect = { ...rect, width: 1000 }
      onResize()
    }

    it('keeps the width the bar takes once shown after its mount', async () => {
      const wrapper = mountProgress({ nbFrames: 100 })
      show()
      vi.runAllTimers()

      await wrapper.find('progress').trigger('click', { clientX: 300 })

      expect(wrapper.emitted('progress-changed')).toEqual([[30]])
    })

    it('keeps the width of the bar hidden while a movie loads', async () => {
      const wrapper = mountProgress({ nbFrames: 100 })
      show()
      rect = { ...rect, width: 0 }
      await wrapper.setProps({ nbFrames: 200 })
      rect = { ...rect, width: 1000 }

      await wrapper.find('progress').trigger('click', { clientX: 300 })

      expect(wrapper.emitted('progress-changed')).toEqual([[60]])
    })
  })

  describe('scrubbing', () => {
    it('keeps the drag while the button leaves the window', async () => {
      // Chrome fires mouseleave on the document when a held pointer exits
      // the window, and keeps sending the moves: the drag must go on.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
        { left: 0, top: 0, width: 1000, height: 28 }
      )
      const wrapper = mountProgress({ nbFrames: 100 })
      await wrapper.find('progress').trigger('mousedown')
      document.dispatchEvent(new MouseEvent('mouseleave', { buttons: 1 }))
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500 }))
      expect(wrapper.emitted('progress-changed')).toEqual([[50]])

      document.dispatchEvent(new MouseEvent('mouseleave', { buttons: 0 }))
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 700 }))
      expect(wrapper.emitted('progress-changed')).toEqual([[50]])
    })
  })

  describe('marker gestures', () => {
    // 100 frames on 1000px: 10px per frame.
    const annotationAt = (frame, objects) => ({
      time: Number((frame * FRAME_DURATION).toFixed(4)),
      drawing: { objects }
    })
    const mine = { id: 'a', createdBy: 'me' }
    const theirs = { id: 'b', createdBy: 'them' }

    const mountMarkers = (annotations, props = {}) => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
        { left: 0, top: 0, width: 1000, height: 28 }
      )
      return mountProgress({
        nbFrames: 100,
        annotations,
        editableMarkers: true,
        currentUserId: 'me',
        ...props
      })
    }

    const drag = async (wrapper, modifiers, fromX, toX) => {
      const mark = wrapper.find('.annotation-mark')
      await mark.trigger('mousedown', { clientX: fromX, ...modifiers })
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: toX }))
      await wrapper.vm.$nextTick()
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: toX }))
      await mark.trigger('click', { clientX: toX })
    }

    it('moves the marker by the dragged frames with Ctrl', async () => {
      const annotation = annotationAt(10, [mine])
      const wrapper = mountMarkers([annotation])
      await drag(wrapper, { ctrlKey: true }, 105, 305)
      expect(wrapper.emitted('annotation-moved')).toEqual([
        [{ annotation, frame: 30 }]
      ])
      expect(wrapper.emitted('progress-changed')).toBeUndefined()
      expect(wrapper.emitted('start-scrub')).toBeUndefined()
    })

    it('moves with Cmd too', async () => {
      const wrapper = mountMarkers([annotationAt(10, [mine])])
      await drag(wrapper, { metaKey: true }, 105, 205)
      expect(wrapper.emitted('annotation-moved')[0][0].frame).toBe(20)
    })

    it('holds the drawing up to the dragged frame with Shift', async () => {
      const annotation = annotationAt(10, [mine])
      const wrapper = mountMarkers([annotation])
      await drag(wrapper, { shiftKey: true }, 105, 405)
      expect(wrapper.emitted('annotation-hold-changed')).toEqual([
        [{ annotation, holdFrames: 30 }]
      ])
      expect(wrapper.emitted('progress-changed')).toBeUndefined()
    })

    it('never holds before the marker frame', async () => {
      const annotation = annotationAt(10, [{ ...mine, holdFrames: 5 }])
      const wrapper = mountMarkers([annotation])
      await drag(wrapper, { shiftKey: true }, 155, 20)
      expect(wrapper.emitted('annotation-hold-changed')).toEqual([
        [{ annotation, holdFrames: 0 }]
      ])
    })

    it('emits nothing when dropped where it started', async () => {
      const wrapper = mountMarkers([annotationAt(10, [mine])])
      await drag(wrapper, { ctrlKey: true }, 105, 107)
      expect(wrapper.emitted('annotation-moved')).toBeUndefined()
      expect(wrapper.emitted('progress-changed')).toBeUndefined()
    })

    it('scrubs as before on a plain drag', async () => {
      const wrapper = mountMarkers([annotationAt(10, [mine])])
      await drag(wrapper, {}, 105, 305)
      expect(wrapper.emitted('annotation-moved')).toBeUndefined()
      expect(wrapper.emitted('progress-changed')).toEqual([[30], [10]])
    })

    it('scrubs when the frame holds no drawing of the user', async () => {
      const wrapper = mountMarkers([annotationAt(10, [theirs])])
      await drag(wrapper, { ctrlKey: true }, 105, 305)
      expect(wrapper.emitted('annotation-moved')).toBeUndefined()
      expect(wrapper.emitted('progress-changed')).toEqual([[30], [10]])
    })

    it('ignores the modifiers when the markers are not editable', async () => {
      const wrapper = mountMarkers([annotationAt(10, [mine])], {
        editableMarkers: false
      })
      await drag(wrapper, { shiftKey: true }, 105, 305)
      expect(wrapper.emitted('annotation-hold-changed')).toBeUndefined()
    })

    it('spans the held frames', async () => {
      const wrapper = mountMarkers([
        annotationAt(10, [mine, { ...theirs, holdFrames: 4 }])
      ])
      await wrapper.vm.$nextTick()
      const style = wrapper.find('.annotation-mark').attributes('style')
      expect(style).toContain('left: 100px')
      expect(style).toContain('width: 49px')
    })

    it('seeks to the clicked frame inside the held part of a marker', async () => {
      const wrapper = mountMarkers([
        annotationAt(10, [{ ...mine, holdFrames: 20 }])
      ])
      const mark = wrapper.find('.annotation-mark')
      await mark.trigger('click', { clientX: 105 })
      await mark.trigger('click', { clientX: 255 })
      expect(wrapper.emitted('progress-changed')).toEqual([[10], [25]])
    })

    it('shows the authors label while hovering a marker', async () => {
      const annotation = annotationAt(10, [mine, theirs])
      const getAnnotationLabel = vi.fn(() => 'Me, Them')
      const wrapper = mountMarkers([annotation], { getAnnotationLabel })
      const mark = wrapper.find('.annotation-mark')
      await mark.trigger('mouseenter')
      expect(getAnnotationLabel).toHaveBeenCalledWith(annotation)
      expect(wrapper.find('.annotation-authors').text()).toBe('Me, Them')
      await mark.trigger('mouseleave')
      expect(wrapper.find('.annotation-authors').exists()).toBe(false)
    })
  })

  describe('trim handles', () => {
    const dragHandleIn = async wrapper => {
      await wrapper.find('.handle-in').trigger('mousedown')
      document.dispatchEvent(new MouseEvent('mouseup'))
    }

    it('emits the dragged handle-in frame', async () => {
      const wrapper = mountProgress({ handleIn: 10, handleOut: 100 })
      await dragHandleIn(wrapper)
      expect(wrapper.emitted('handle-in-changed')).toHaveLength(1)
    })

    it('ignores a drag when read only', async () => {
      const wrapper = mountProgress({
        handleIn: 10,
        handleOut: 100,
        readOnly: true
      })
      await dragHandleIn(wrapper)
      expect(wrapper.emitted('handle-in-changed')).toBeUndefined()
    })
  })
})

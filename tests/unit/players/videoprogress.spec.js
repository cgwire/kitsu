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
    },
    global: { mocks: { $t: key => key } }
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

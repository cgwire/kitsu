import { usePanzoomSync } from '@/composables/panzoom'

describe('composables/panzoom', () => {
  describe('initial state', () => {
    it('starts with identity transform', () => {
      const { panzoomTransform } = usePanzoomSync()
      expect(panzoomTransform.value).toEqual({ x: 0, y: 0, scale: 1 })
    })
  })

  describe('onPanzoomChanged', () => {
    it('updates the transform ref', () => {
      const { panzoomTransform, onPanzoomChanged } = usePanzoomSync()
      onPanzoomChanged({ x: 10, y: 20, scale: 2 })
      expect(panzoomTransform.value).toEqual({ x: 10, y: 20, scale: 2 })
    })

    it('replaces the previous transform on each call', () => {
      const { panzoomTransform, onPanzoomChanged } = usePanzoomSync()
      onPanzoomChanged({ x: 5, y: 5, scale: 1.5 })
      onPanzoomChanged({ x: -3, y: 7, scale: 0.8 })
      expect(panzoomTransform.value).toEqual({ x: -3, y: 7, scale: 0.8 })
    })
  })

  describe('resetPanzoomTransform', () => {
    it('restores the identity transform', () => {
      const { panzoomTransform, onPanzoomChanged, resetPanzoomTransform } =
        usePanzoomSync()
      onPanzoomChanged({ x: 42, y: -17, scale: 3 })
      resetPanzoomTransform()
      expect(panzoomTransform.value).toEqual({ x: 0, y: 0, scale: 1 })
    })
  })

  describe('applyPanzoomTo', () => {
    it('is a no-op when target is null', () => {
      const { applyPanzoomTo } = usePanzoomSync()
      expect(() => applyPanzoomTo(null)).not.toThrow()
    })

    it('is a no-op when target is undefined', () => {
      const { applyPanzoomTo } = usePanzoomSync()
      expect(() => applyPanzoomTo(undefined)).not.toThrow()
    })

    it('applies the current transform to a fabric-like canvas', () => {
      const { onPanzoomChanged, applyPanzoomTo } = usePanzoomSync()
      const fakeCanvas = {
        setViewportTransform: vi.fn(),
        requestRenderAll: vi.fn()
      }
      onPanzoomChanged({ x: 12, y: 34, scale: 2.5 })
      applyPanzoomTo(fakeCanvas)
      expect(fakeCanvas.setViewportTransform).toHaveBeenCalledWith([
        2.5, 0, 0, 2.5, 12, 34
      ])
      expect(fakeCanvas.requestRenderAll).toHaveBeenCalledOnce()
    })

    it('applies the identity transform when state is fresh', () => {
      const { applyPanzoomTo } = usePanzoomSync()
      const fakeCanvas = {
        setViewportTransform: vi.fn(),
        requestRenderAll: vi.fn()
      }
      applyPanzoomTo(fakeCanvas)
      expect(fakeCanvas.setViewportTransform).toHaveBeenCalledWith([
        1, 0, 0, 1, 0, 0
      ])
    })
  })
})

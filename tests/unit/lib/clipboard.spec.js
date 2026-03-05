import { describe, it, expect } from 'vitest'

import clipboard from '@/lib/clipboard'

describe('clipboard', () => {
  describe('annotations', () => {
    it('returns an empty array initially', () => {
      expect(clipboard.pasteAnnotations()).toEqual([])
    })

    it('returns the same reference after copy', () => {
      const annotations = [{ id: 1, text: 'note' }]
      clipboard.copyAnnotations(annotations)
      expect(clipboard.pasteAnnotations()).toBe(annotations)
    })
  })

  describe('casting', () => {
    it('returns an empty array initially', () => {
      expect(clipboard.pasteCasting()).toEqual([])
    })

    it('returns the same reference after copy', () => {
      const casting = [{ asset_id: 'a1', nb_occurences: 2 }]
      clipboard.copyCasting(casting)
      expect(clipboard.pasteCasting()).toBe(casting)
    })
  })
})

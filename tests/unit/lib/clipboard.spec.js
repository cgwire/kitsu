// @vitest-environment node

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

    // The store edits the casting of a line in place: the clipboard keeps the
    // casting as it was when copied, and each paste gets links of its own.
    it('keeps a copy of the casting and hands out a copy per paste', () => {
      const casting = [{ asset_id: 'a1', nb_occurences: 2 }]
      clipboard.copyCasting(casting)
      casting[0].nb_occurences = 5

      const pasted = clipboard.pasteCasting()
      pasted[0].nb_occurences = 9

      expect(pasted).toEqual([{ asset_id: 'a1', nb_occurences: 9 }])
      expect(clipboard.pasteCasting()).toEqual([
        { asset_id: 'a1', nb_occurences: 2 }
      ])
    })

    it('copies an empty casting for a line without one', () => {
      clipboard.copyCasting(undefined)
      expect(clipboard.pasteCasting()).toEqual([])
    })
  })
})

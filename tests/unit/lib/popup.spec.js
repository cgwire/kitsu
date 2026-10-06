// @vitest-environment node

import { getPopupPlacement, getPopupStyle } from '@/lib/popup'

// The reporter's window and the long-text popup (cgwire/kitsu#2244)
const viewport = { width: 1912, height: 962 }
const popup = { width: 300, height: 120 }

// Vertical edges of the popup box the style yields, at the given height or
// less when the max height bounds it.
const popupBox = (style, height, viewportHeight) => {
  const boxHeight = Math.min(height, parseFloat(style.maxHeight))
  const top =
    style.top !== undefined
      ? parseFloat(style.top)
      : viewportHeight - parseFloat(style.bottom) - boxHeight
  return { top, bottom: top + boxHeight }
}

describe('lib/popup', () => {
  describe('getPopupStyle', () => {
    test('opens below the anchor when the popup fits there', () => {
      const anchor = { top: 310, bottom: 422, left: 329 }
      expect(getPopupStyle(anchor, popup, viewport)).toEqual({
        left: '329px',
        width: '300px',
        top: '426px',
        maxHeight: '528px'
      })
    })

    test('opens above the anchor when only the room above holds it', () => {
      // Last row of a full list: 43 px are left below the cell.
      const anchor = { top: 807, bottom: 919, left: 329 }
      expect(getPopupStyle(anchor, popup, viewport)).toEqual({
        left: '329px',
        width: '300px',
        bottom: '159px',
        maxHeight: '795px'
      })
    })

    test('opens above a row clipped by the bottom of the window', () => {
      const anchor = { top: 891, bottom: 1003, left: 329 }
      expect(getPopupStyle(anchor, popup, viewport)).toMatchObject({
        bottom: '75px',
        maxHeight: '879px'
      })
    })

    test('takes the side with more room, bounded to it, when none holds it', () => {
      const short = { width: 1366, height: 600 }
      expect(
        getPopupStyle({ top: 60, bottom: 520, left: 224 }, popup, short)
      ).toEqual({
        left: '224px',
        width: '300px',
        top: '524px',
        maxHeight: '68px'
      })
      expect(
        getPopupStyle({ top: 125, bottom: 500, left: 224 }, popup, short)
      ).toEqual({
        left: '224px',
        width: '300px',
        bottom: '479px',
        maxHeight: '113px'
      })
    })

    test('keeps the popup off the left and right edges', () => {
      expect(
        getPopupStyle({ top: 310, bottom: 422, left: 1800 }, popup, viewport)
          .left
      ).toBe('1604px')
      expect(
        getPopupStyle({ top: 310, bottom: 422, left: -40 }, popup, viewport)
          .left
      ).toBe('8px')
    })

    test('stays 8 px inside the viewport and off the visible anchor', () => {
      const cases = [300, 600, 962].flatMap(viewportHeight =>
        [46, 112].flatMap(rowHeight =>
          Array.from({ length: (viewportHeight + 100) / 5 }, (_, i) => ({
            viewportHeight,
            anchor: { top: i * 5 - 50, bottom: i * 5 - 50 + rowHeight }
          }))
        )
      )
      cases.forEach(({ viewportHeight, anchor }) => {
        const style = getPopupStyle(
          { ...anchor, left: 329 },
          popup,
          { width: viewport.width, height: viewportHeight }
        )
        const box = popupBox(style, popup.height, viewportHeight)
        const visibleTop = Math.max(anchor.top, 0)
        const visibleBottom = Math.min(anchor.bottom, viewportHeight)
        expect(box.top).toBeGreaterThanOrEqual(8)
        expect(box.bottom).toBeLessThanOrEqual(viewportHeight - 8)
        expect(box.bottom > visibleTop && box.top < visibleBottom).toBe(false)
      })
    })
  })

  describe('getPopupPlacement', () => {
    test('tells the side of the popup and the room left there', () => {
      expect(
        getPopupPlacement({ top: 310, bottom: 422, left: 329 }, popup, viewport)
      ).toEqual({
        isBelow: true,
        room: 528,
        style: {
          left: '329px',
          width: '300px',
          top: '426px',
          maxHeight: '528px'
        }
      })
      expect(
        getPopupPlacement({ top: 807, bottom: 919, left: 329 }, popup, viewport)
      ).toEqual({
        isBelow: false,
        room: 795,
        style: {
          left: '329px',
          width: '300px',
          bottom: '159px',
          maxHeight: '795px'
        }
      })
    })
  })
})

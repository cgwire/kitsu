import {
  normalizeSerializedType,
  normalizeType
} from '@/lib/players/annotationTypes'

describe('lib/players/annotationTypes', () => {
  describe('normalizeType', () => {
    it('maps fabric v6 PascalCase types to the stored lowercase form', () => {
      expect(normalizeType('Rect')).toBe('rect')
      expect(normalizeType('Circle')).toBe('circle')
      expect(normalizeType('Ellipse')).toBe('ellipse')
      expect(normalizeType('Line')).toBe('line')
      expect(normalizeType('Path')).toBe('path')
      expect(normalizeType('Group')).toBe('group')
    })

    it('maps the text variants, keeping i-text distinct from itext', () => {
      // 'IText'.toLowerCase() would be 'itext', which no branch matches —
      // the explicit map is what keeps revival working.
      expect(normalizeType('IText')).toBe('i-text')
      expect(normalizeType('Text')).toBe('text')
      expect(normalizeType('Textbox')).toBe('textbox')
    })

    it('passes legacy lowercase types through unchanged', () => {
      expect(normalizeType('rect')).toBe('rect')
      expect(normalizeType('i-text')).toBe('i-text')
      expect(normalizeType('group')).toBe('group')
    })

    it('leaves custom fixed types untouched', () => {
      // PSStroke is hard-coded, arrow/eraser keep a lowercase static type —
      // none are affected by the v6 PascalCase switch.
      expect(normalizeType('PSStroke')).toBe('PSStroke')
      expect(normalizeType('arrow')).toBe('arrow')
      expect(normalizeType('eraser')).toBe('eraser')
    })

    it('tolerates a missing / non-string type', () => {
      expect(normalizeType(undefined)).toBeUndefined()
      expect(normalizeType(null)).toBeNull()
    })
  })

  describe('normalizeSerializedType', () => {
    it('normalizes the top-level type in place and returns the object', () => {
      const obj = { type: 'Rect' }
      expect(normalizeSerializedType(obj)).toBe(obj)
      expect(obj.type).toBe('rect')
    })

    it('recurses into group children, eraser mask and clipPath', () => {
      const obj = {
        type: 'Group',
        objects: [{ type: 'Path' }, { type: 'IText' }],
        // The eraser node keeps a lowercase 'eraser' type; the point of
        // recursing into it is to normalize its mask paths.
        eraser: {
          type: 'eraser',
          objects: [{ type: 'Path' }]
        },
        clipPath: { type: 'Rect' }
      }
      normalizeSerializedType(obj)
      expect(obj.type).toBe('group')
      expect(obj.objects[0].type).toBe('path')
      expect(obj.objects[1].type).toBe('i-text')
      expect(obj.eraser.type).toBe('eraser')
      expect(obj.eraser.objects[0].type).toBe('path')
      expect(obj.clipPath.type).toBe('rect')
    })

    it('is a no-op on already-lowercase (legacy) data', () => {
      const obj = { type: 'path', objects: [{ type: 'circle' }] }
      normalizeSerializedType(obj)
      expect(obj.type).toBe('path')
      expect(obj.objects[0].type).toBe('circle')
    })
  })
})

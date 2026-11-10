// @vitest-environment node

import {
  applyAnnotationEdits,
  buildHoldEdits,
  buildMoveEdits,
  getAnnotationAuthorIds,
  getAnnotationFrame,
  getAnnotationHoldEnd,
  getHeldAnnotationsAtFrame,
  getOwnObjectHolds,
  hasOwnObjects
} from '@/lib/players/annotationMarkers'

const FPS = 25
const FRAME = 0.04

const annotationAt = (frame, objects) => ({
  time: frame * FRAME,
  drawing: { objects }
})

const mine = (id, extra = {}) => ({ id, createdBy: 'me', ...extra })
const theirs = (id, extra = {}) => ({ id, createdBy: 'them', ...extra })

describe('lib/players/annotationMarkers', () => {
  describe('getAnnotationAuthorIds', () => {
    it('lists each author once, falling back to the guest person_id', () => {
      const annotation = annotationAt(3, [
        mine('a'),
        theirs('b'),
        mine('c'),
        { id: 'd', person_id: 'guest' },
        { id: 'e' }
      ])
      expect(getAnnotationAuthorIds(annotation)).toEqual(['me', 'them', 'guest'])
    })
  })

  describe('getAnnotationFrame / getAnnotationHoldEnd', () => {
    it('maps the time to its frame', () => {
      expect(getAnnotationFrame(annotationAt(12, []), FRAME)).toBe(12)
    })

    it('ends on the frame itself without hold', () => {
      expect(getAnnotationHoldEnd(annotationAt(12, [mine('a')]), FRAME)).toBe(
        12
      )
    })

    it('ends on the longest hold of its objects', () => {
      const annotation = annotationAt(12, [
        mine('a', { holdFrames: 4 }),
        theirs('b', { holdFrames: 9 }),
        mine('c', { holdFrames: 'x' })
      ])
      expect(getAnnotationHoldEnd(annotation, FRAME)).toBe(21)
    })
  })

  describe('getHeldAnnotationsAtFrame', () => {
    const annotations = [
      annotationAt(10, [mine('a', { holdFrames: 5 }), theirs('b')]),
      annotationAt(13, [theirs('c', { holdFrames: 1 })]),
      annotationAt(20, [mine('d', { holdFrames: 2 })])
    ]

    it('returns the objects of earlier frames whose hold covers the frame', () => {
      const held = getHeldAnnotationsAtFrame(annotations, 14, FRAME)
      expect(held.map(a => a.drawing.objects.map(o => o.id))).toEqual([
        ['a'],
        ['c']
      ])
    })

    it('never includes the frame own annotation', () => {
      const held = getHeldAnnotationsAtFrame(annotations, 10, FRAME)
      expect(held).toEqual([])
    })

    it('includes the held objects of the frame itself on demand', () => {
      const held = getHeldAnnotationsAtFrame(annotations, 10, FRAME, {
        includeStart: true
      })
      expect(held.map(a => a.drawing.objects.map(o => o.id))).toEqual([['a']])
    })

    it('stops after the last held frame', () => {
      expect(getHeldAnnotationsAtFrame(annotations, 16, FRAME)).toEqual([])
      expect(
        getHeldAnnotationsAtFrame(annotations, 15, FRAME).length
      ).toBe(1)
    })
  })

  describe('hasOwnObjects', () => {
    it('tells whether the user drew on the frame', () => {
      expect(hasOwnObjects(annotationAt(1, [theirs('a')]), 'me')).toBe(false)
      expect(hasOwnObjects(annotationAt(1, [theirs('a'), mine('b')]), 'me')).toBe(
        true
      )
      expect(hasOwnObjects(annotationAt(1, [mine('b')]), null)).toBe(false)
    })
  })

  describe('buildMoveEdits', () => {
    it('moves only the user objects to the target frame', () => {
      const annotation = annotationAt(10, [
        mine('a', { holdFrames: 3 }),
        theirs('b')
      ])
      const edits = buildMoveEdits({
        annotation,
        toFrame: 30,
        fps: FPS,
        userId: 'me'
      })
      expect(edits.additions).toEqual([
        {
          time: 1.2,
          frame: 30,
          drawing: { objects: [mine('a', { holdFrames: 3 })] }
        }
      ])
      expect(edits.deletions).toEqual([
        { time: 0.4, frame: 10, objects: ['a'] }
      ])
      expect(edits.updates).toEqual([])
    })

    it('returns nothing when the frame does not change or has no own object', () => {
      const annotation = annotationAt(10, [mine('a'), theirs('b')])
      expect(
        buildMoveEdits({ annotation, toFrame: 10, fps: FPS, userId: 'me' })
      ).toBeNull()
      expect(
        buildMoveEdits({ annotation, toFrame: 12, fps: FPS, userId: 'other' })
      ).toBeNull()
    })
  })

  describe('buildMoveEdits with ids (undo / redo)', () => {
    it('moves the given objects whoever drew them', () => {
      const annotation = annotationAt(30, [mine('a'), theirs('b'), mine('c')])
      const edits = buildMoveEdits({
        annotation,
        toFrame: 10,
        fps: FPS,
        ids: ['a', 'b']
      })
      expect(edits.additions[0].drawing.objects.map(o => o.id)).toEqual([
        'a',
        'b'
      ])
      expect(edits.deletions).toEqual([
        { time: 1.2, frame: 30, objects: ['a', 'b'] }
      ])
    })

    it('returns nothing when the objects are gone', () => {
      const annotation = annotationAt(30, [theirs('b')])
      expect(
        buildMoveEdits({ annotation, toFrame: 10, fps: FPS, ids: ['a'] })
      ).toBeNull()
      expect(
        buildMoveEdits({ annotation: null, toFrame: 10, fps: FPS, ids: ['a'] })
      ).toBeNull()
    })
  })

  describe('getOwnObjectHolds', () => {
    it('maps the user objects to their hold', () => {
      const annotation = annotationAt(10, [
        mine('a', { holdFrames: 3 }),
        mine('c'),
        theirs('b', { holdFrames: 9 })
      ])
      expect(getOwnObjectHolds(annotation, 'me')).toEqual({ a: 3, c: 0 })
    })
  })

  describe('buildHoldEdits with a hold per object (undo)', () => {
    it('restores each object hold', () => {
      const annotation = annotationAt(10, [
        mine('a', { holdFrames: 8 }),
        mine('c', { holdFrames: 8 }),
        theirs('b')
      ])
      const edits = buildHoldEdits({
        annotation,
        holdFrames: { a: 3, c: 0 },
        fps: FPS
      })
      expect(edits.updates[0].drawing.objects).toEqual([
        mine('a', { holdFrames: 3 }),
        mine('c')
      ])
    })
  })

  describe('buildHoldEdits', () => {
    it('sets the hold on the user objects only', () => {
      const annotation = annotationAt(10, [mine('a'), theirs('b')])
      const edits = buildHoldEdits({
        annotation,
        holdFrames: 6,
        fps: FPS,
        userId: 'me'
      })
      expect(edits.updates).toEqual([
        {
          time: 0.4,
          frame: 10,
          drawing: { objects: [mine('a', { holdFrames: 6 })] }
        }
      ])
      expect(edits.additions).toEqual([])
      expect(edits.deletions).toEqual([])
    })

    it('drops the hold field when shrunk back to one frame', () => {
      const annotation = annotationAt(10, [mine('a', { holdFrames: 4 })])
      const edits = buildHoldEdits({
        annotation,
        holdFrames: 0,
        fps: FPS,
        userId: 'me'
      })
      expect(edits.updates[0].drawing.objects).toEqual([mine('a')])
    })

    it('returns nothing when no own object changes', () => {
      const annotation = annotationAt(10, [mine('a', { holdFrames: 4 })])
      expect(
        buildHoldEdits({ annotation, holdFrames: 4, fps: FPS, userId: 'me' })
      ).toBeNull()
    })
  })

  describe('applyAnnotationEdits', () => {
    it('applies a move locally, merging into an annotated target frame', () => {
      const annotations = [
        annotationAt(10, [mine('a'), theirs('b')]),
        annotationAt(30, [theirs('c')])
      ]
      const edits = buildMoveEdits({
        annotation: annotations[0],
        toFrame: 30,
        fps: FPS,
        userId: 'me'
      })
      const result = applyAnnotationEdits(annotations, edits, FPS)
      expect(result.map(a => [a.time, a.drawing.objects.map(o => o.id)])).toEqual(
        [
          [0.4, ['b']],
          [1.2, ['c', 'a']]
        ]
      )
      expect(annotations[0].drawing.objects).toHaveLength(2)
    })

    it('drops a frame left empty and adds a new one', () => {
      const annotations = [annotationAt(10, [mine('a')])]
      const edits = buildMoveEdits({
        annotation: annotations[0],
        toFrame: 5,
        fps: FPS,
        userId: 'me'
      })
      const result = applyAnnotationEdits(annotations, edits, FPS)
      expect(result).toEqual([
        { time: 0.2, frame: 5, drawing: { objects: [mine('a')] } }
      ])
    })

    it('applies a hold update', () => {
      const annotations = [annotationAt(10, [mine('a'), theirs('b')])]
      const edits = buildHoldEdits({
        annotation: annotations[0],
        holdFrames: 2,
        fps: FPS,
        userId: 'me'
      })
      const result = applyAnnotationEdits(annotations, edits, FPS)
      expect(result[0].drawing.objects).toEqual([
        mine('a', { holdFrames: 2 }),
        theirs('b')
      ])
    })
  })
})

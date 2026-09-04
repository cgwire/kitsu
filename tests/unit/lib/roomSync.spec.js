// @vitest-environment node

import {
  nextRoomSeq,
  roomSeqOf,
  senderIdOf,
  shouldApplyRoomUpdate,
  withRoomSeq
} from '@/lib/players/roomSync'

describe('lib/players/roomSync', () => {
  describe('nextRoomSeq', () => {
    it('is at least the current wall clock', () => {
      const before = Date.now()
      expect(nextRoomSeq()).toBeGreaterThanOrEqual(before)
    })

    it('always moves past the local sequence', () => {
      const future = Date.now() + 100000
      expect(nextRoomSeq(future, 0)).toBe(future + 1)
    })

    it('always moves past the last applied sequence', () => {
      const future = Date.now() + 100000
      expect(nextRoomSeq(0, future)).toBe(future + 1)
    })
  })

  describe('withRoomSeq / senderIdOf / roomSeqOf', () => {
    it('round-trips the sender id and the sequence', () => {
      const localId = withRoomSeq('uuid-1', 42)
      expect(localId).toBe('uuid-1#42')
      expect(senderIdOf(localId)).toBe('uuid-1')
      expect(roomSeqOf({ local_id: localId })).toBe(42)
    })

    it('leaves a plain local_id untouched', () => {
      expect(senderIdOf('uuid-1')).toBe('uuid-1')
      expect(senderIdOf(undefined)).toBeUndefined()
    })

    it('returns null when no sequence is present', () => {
      expect(roomSeqOf({ local_id: 'uuid-1' })).toBeNull()
      expect(roomSeqOf({})).toBeNull()
      expect(roomSeqOf(null)).toBeNull()
    })

    it('returns null on a malformed suffix', () => {
      expect(roomSeqOf({ local_id: 'uuid-1#abc' })).toBeNull()
    })

    it('prefers an explicit room_seq field over the suffix', () => {
      expect(roomSeqOf({ room_seq: 7, local_id: 'uuid-1#42' })).toBe(7)
    })
  })

  describe('shouldApplyRoomUpdate', () => {
    const base = { localId: 'me', localSeq: 100, lastAppliedSeq: 200 }

    it('rejects missing event data', () => {
      expect(shouldApplyRoomUpdate({ ...base, eventData: null })).toBe(false)
    })

    it('rejects self-echoes (plain local_id)', () => {
      expect(
        shouldApplyRoomUpdate({ ...base, eventData: { local_id: 'me' } })
      ).toBe(false)
    })

    it('rejects self-echoes (suffixed local_id)', () => {
      expect(
        shouldApplyRoomUpdate({ ...base, eventData: { local_id: 'me#300' } })
      ).toBe(false)
    })

    it('applies events without a sequence (older clients)', () => {
      expect(
        shouldApplyRoomUpdate({ ...base, eventData: { local_id: 'other' } })
      ).toBe(true)
    })

    it('rejects sequences at or behind the last applied update', () => {
      expect(
        shouldApplyRoomUpdate({ ...base, eventData: { local_id: 'other#150' } })
      ).toBe(false)
      expect(
        shouldApplyRoomUpdate({ ...base, eventData: { local_id: 'other#200' } })
      ).toBe(false)
    })

    it("rejects sequences at or behind the user's own last action", () => {
      expect(
        shouldApplyRoomUpdate({
          localId: 'me',
          localSeq: 500,
          lastAppliedSeq: 0,
          eventData: { local_id: 'other#400' }
        })
      ).toBe(false)
    })

    it('applies sequences newer than both references', () => {
      expect(
        shouldApplyRoomUpdate({ ...base, eventData: { local_id: 'other#201' } })
      ).toBe(true)
    })
  })
})

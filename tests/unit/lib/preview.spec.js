import { formatRevision } from '@/lib/preview'

describe('lib/preview', () => {
  describe('formatRevision', () => {
    it('pads the revision to the project padding width', () => {
      const project = { revision_padding: 3 }
      expect(formatRevision(0, project)).toEqual('v000')
      expect(formatRevision(42, project)).toEqual('v042')
    })

    it('never truncates a revision wider than the padding', () => {
      expect(formatRevision(1001, { revision_padding: 3 })).toEqual('v1001')
    })

    it('falls back to no padding when the project has none', () => {
      expect(formatRevision(2, { revision_padding: 0 })).toEqual('v2')
      expect(formatRevision(2, {})).toEqual('v2')
      expect(formatRevision(2, undefined)).toEqual('v2')
    })

    it('returns an empty string for a missing revision', () => {
      expect(formatRevision(null, { revision_padding: 3 })).toEqual('')
      expect(formatRevision(undefined, { revision_padding: 3 })).toEqual('')
      expect(formatRevision('', { revision_padding: 3 })).toEqual('')
    })
  })
})

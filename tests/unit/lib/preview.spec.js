// @vitest-environment node

import {
  formatRevision,
  hasPreviewFilePicture,
  isPreviewFileStatus,
  latestPreviewFileStatus
} from '@/lib/preview'

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

  // Zou builds the files of an uploaded preview in a job: its picture and
  // movie routes answer 404 until the preview file is ready.
  describe('preview file statuses', () => {
    it('tells the status codes Zou stores from anything else', () => {
      expect(
        ['broken', 'missing', 'processing', 'ready'].every(isPreviewFileStatus)
      ).toBe(true)
      expect(isPreviewFileStatus('Processing')).toBe(false)
      expect(isPreviewFileStatus(undefined)).toBe(false)
    })

    it('draws a picture for a ready or unknown status only', () => {
      expect(hasPreviewFilePicture('ready')).toBe(true)
      expect(hasPreviewFilePicture(undefined)).toBe(true)
      expect(
        ['broken', 'missing', 'processing'].some(hasPreviewFilePicture)
      ).toBe(false)
    })

    it('keeps a final status over a processing one read before it', () => {
      expect(latestPreviewFileStatus('ready', 'processing')).toBe('ready')
      expect(latestPreviewFileStatus('broken', 'processing')).toBe('broken')
    })

    it('takes a newer status otherwise', () => {
      expect(latestPreviewFileStatus('processing', 'ready')).toBe('ready')
      expect(latestPreviewFileStatus('ready', 'broken')).toBe('broken')
      expect(latestPreviewFileStatus(undefined, 'processing')).toBe(
        'processing'
      )
      expect(latestPreviewFileStatus('ready', undefined)).toBe('ready')
    })
  })
})

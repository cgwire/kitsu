import { downloadBlob } from '@/lib/download'

describe('lib/download', () => {
  const { createObjectURL, revokeObjectURL } = URL

  afterEach(() => {
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
    vi.restoreAllMocks()
  })

  test('clicks a link to the blob, then drops the link and its URL', () => {
    URL.createObjectURL = vi.fn(() => 'blob:kitsu/export')
    URL.revokeObjectURL = vi.fn()
    const clicked = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function () {
        clicked.push({
          download: this.download,
          href: this.getAttribute('href'),
          inDocument: document.body.contains(this),
          isRevoked: URL.revokeObjectURL.mock.calls.length > 0
        })
      }
    )
    const blob = new Blob(['a;b'], { type: 'text/csv' })

    downloadBlob(blob, 'export.csv')

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(clicked).toEqual([
      {
        download: 'export.csv',
        href: 'blob:kitsu/export',
        inDocument: true,
        isRevoked: false
      }
    ])
    expect(document.querySelector('a')).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:kitsu/export')
  })
})

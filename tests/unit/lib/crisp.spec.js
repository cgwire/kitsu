// @vitest-environment node

import crisp from '@/lib/crisp'

describe('lib/crisp', () => {
  let head

  beforeEach(() => {
    head = { appendChild: vi.fn() }
    vi.stubGlobal('window', {})
    vi.stubGlobal('document', {
      createElement: tag => ({ tag }),
      getElementsByTagName: tag => (tag === 'head' ? [head] : [])
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('loads the chat widget of the website', () => {
    crisp.init('website-1')

    expect(window.CRISP_WEBSITE_ID).toEqual('website-1')
    expect(window.$crisp).toEqual([])
    const [script] = head.appendChild.mock.calls[0]
    expect(script).toMatchObject({
      tag: 'script',
      src: 'https://client.crisp.chat/l.js',
      async: true
    })
  })

  test('warns when the widget cannot load', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    crisp.init('website-1')
    const [script] = head.appendChild.mock.calls[0]

    script.onerror()

    expect(console.warn).toHaveBeenCalledWith(
      'Failed to load Crisp chat widget'
    )
  })
})

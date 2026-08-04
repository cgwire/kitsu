import {
  exitDocumentFullScreen,
  getFullScreenElement,
  requestFullScreen
} from '@/composables/fullScreen'

// Safari below 16.4 only exposes the webkit-prefixed fullscreen API:
// the helpers must fall back to it instead of silently doing nothing.
describe('composables/fullScreen helpers', () => {
  afterEach(() => {
    delete document.exitFullscreen
    delete document.webkitCancelFullScreen
    delete document.webkitFullscreenElement
  })

  test('requestFullScreen prefers the unprefixed API', () => {
    const el = {
      requestFullscreen: vi.fn(),
      webkitRequestFullScreen: vi.fn()
    }
    requestFullScreen(el)
    expect(el.requestFullscreen).toHaveBeenCalled()
    expect(el.webkitRequestFullScreen).not.toHaveBeenCalled()
  })

  test('requestFullScreen falls back to the webkit prefix', () => {
    const el = { webkitRequestFullScreen: vi.fn() }
    requestFullScreen(el)
    expect(el.webkitRequestFullScreen).toHaveBeenCalled()
  })

  test('exitDocumentFullScreen falls back to the webkit prefix', () => {
    document.exitFullscreen = undefined
    document.webkitCancelFullScreen = vi.fn()
    exitDocumentFullScreen()
    expect(document.webkitCancelFullScreen).toHaveBeenCalled()
  })

  test('getFullScreenElement reads the webkit-prefixed element', () => {
    const el = {}
    document.webkitFullscreenElement = el
    expect(getFullScreenElement()).toBe(el)
  })

  test('getFullScreenElement returns null when nothing is fullscreen', () => {
    expect(getFullScreenElement()).toBeNull()
  })
})

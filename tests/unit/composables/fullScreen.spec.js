import { effectScope } from 'vue'

import {
  exitDocumentFullScreen,
  getFullScreenElement,
  requestFullScreen,
  useFullScreenTarget
} from '@/composables/fullScreen'

import {
  resetFullScreen,
  setFullScreenElement
} from '../fixtures/full-screen'

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

  test('a denied fullscreen request is swallowed', async () => {
    const el = {
      requestFullscreen: vi.fn(() =>
        Promise.reject(new TypeError('Fullscreen request denied'))
      )
    }
    await expect(requestFullScreen(el)).resolves.toBeUndefined()
  })

  test('a rejected exitFullscreen is swallowed', async () => {
    document.exitFullscreen = vi.fn(() =>
      Promise.reject(new TypeError('Document not active'))
    )
    await expect(exitDocumentFullScreen()).resolves.toBeUndefined()
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

describe('composables/fullScreen useFullScreenTarget', () => {
  afterEach(() => {
    resetFullScreen()
  })

  // A video the element holds may go full screen in its turn: the element
  // stays the target.
  test('gives the element while it or what it holds is in full screen', () => {
    const element = document.createElement('div')
    const video = element.appendChild(document.createElement('video'))
    const scope = effectScope()
    const target = scope.run(() => useFullScreenTarget(() => element))

    expect(target.value).toBeNull()
    setFullScreenElement(element)
    expect(target.value).toBe(element)
    setFullScreenElement(video)
    expect(target.value).toBe(element)
    setFullScreenElement(document.createElement('video'))
    expect(target.value).toBeNull()
    setFullScreenElement(null)
    expect(target.value).toBeNull()

    scope.stop()
    setFullScreenElement(element)
    expect(target.value).toBeNull()
  })
})

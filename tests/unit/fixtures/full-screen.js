// jsdom has no Fullscreen API: set the element the browser shows alone and
// tell the listeners, as its fullscreenchange does.
export const setFullScreenElement = element => {
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    value: element
  })
  document.dispatchEvent(new Event('fullscreenchange'))
}

export const resetFullScreen = () => {
  delete document.fullscreenElement
}

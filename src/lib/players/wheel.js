// Swallow Ctrl+wheel inside player surfaces so the browser page zoom
// never fires there — the players own that gesture (panzoom / timeline
// zoom). Plain wheels are left alone and keep scrolling the page.
export const swallowBrowserZoom = event => {
  if (event.ctrlKey) event.preventDefault()
}

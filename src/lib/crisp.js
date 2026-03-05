export default {
  init(token) {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = token
    const s = document.createElement('script')
    s.src = 'https://client.crisp.chat/l.js'
    s.async = true
    s.onerror = () => console.warn('Failed to load Crisp chat widget')
    document.getElementsByTagName('head')[0].appendChild(s)
  },

  setChatVisibility(isVisible) {
    window.$crisp?.push(['do', isVisible ? 'chat:show' : 'chat:hide'])
  }
}

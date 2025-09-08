export default {
  init(token) {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = token
    ;(function () {
      const d = document
      const s = d.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = true
      d.getElementsByTagName('head')[0].appendChild(s)
    })()
  },

  setChatVisibility(isVisible) {
    window.$crisp?.push(['do', isVisible ? 'chat:show' : 'chat:hide'])
  }
}

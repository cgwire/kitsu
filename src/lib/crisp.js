export default {
  init(token, isVisible) {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = token
    const run = () => {
      const d = document
      const s = d.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = 1
      d.getElementsByTagName('head')[0].appendChild(s)
      s.addEventListener('load', () => {
        setTimeout(() => this.setChatVisibility(isVisible), 800)
      })
    }
    run()
  },

  setChatVisibility(isVisible) {
    const crispEls = document.getElementsByClassName('crisp-client')
    if (crispEls[0]) {
      const crispEl = crispEls[0]
      if (isVisible) {
        crispEl.style.display = ''
      } else {
        crispEl.style.display = 'none'
      }
    }
  }
}

import superagent from 'superagent'

export default {

  init (isVisible, callback) {
    superagent
      .get('/api/config')
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          const token = res.body.crisp_token
          if (token && token.length > 0) {
            this.setup(token, isVisible)
          }
        }
        if (callback) callback()
      })
  },

  setup (token, isVisible) {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = token
    console.log('setup', isVisible)
    const run = () => {
      const d = document
      const s = d.createElement('script')

      s.src = 'https://client.crisp.chat/l.js'
      s.async = 1
      d.getElementsByTagName('head')[0].appendChild(s)
      s.addEventListener("load", () => {
        setTimeout(() => this.setChatVisibilty(isVisible), 800)
      })
    }
    run()
  },

  setChatVisibilty (isVisible) {
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

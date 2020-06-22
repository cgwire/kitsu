import superagent from 'superagent'

export default {

  init (callback) {
    superagent
      .get('/api/config')
      .end((err, res) => {
        if (err) {
          console.error(err)
        } else {
          const token = res.body.crisp_token
          if (token && token.length > 0) this.setup(token)
        }
        if (callback) callback()
      })
  },

  setup (token) {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = token
    function run () {
      var d = document
      var s = d.createElement('script')

      s.src = 'https://client.crisp.chat/l.js'
      s.async = 1
      d.getElementsByTagName('head')[0].appendChild(s)
    }
    run()
  }
}

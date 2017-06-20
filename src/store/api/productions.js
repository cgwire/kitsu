import superagent from 'superagent'

export default {
  getProductions (callback) {
    superagent
      .get('/api/data/projects/all')
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}

import superagent from 'superagent'

export default {
  getPeople (callback) {
    superagent
      .get('/api/data/persons')
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}

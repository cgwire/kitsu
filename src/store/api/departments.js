import superagent from 'superagent'

export default {
  getDepartments (callback) {
    superagent
      .get('/api/data/departments')
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}

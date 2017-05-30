import superagent from 'superagent'

export default {
  getPeople (callback) {
    superagent
      .get('/api/data/persons')
      .end((err, res) => {
        callback(err, res.body)
      })
  },
  deletePerson (personId, callback) {
    superagent
      .del(`/api/data/persons/${personId}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }

}

import superagent from 'superagent'

export default {

  getPeople (callback) {
    superagent
      .get('/api/data/persons')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  updatePerson (person, callback) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      phone: person.phone
    }
    superagent
      .put(`/api/data/persons/${person.id}`)
      .send(data)
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

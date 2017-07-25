import superagent from 'superagent'

export default {
  getShots (callback) {
    superagent
      .get('/api/data/shots/with-tasks')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  getShotType (callback) {
    superagent
      .get('/api/data/shot_type')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  newShot (shot, callback) {
    const data = {
      name: shot.name,
      entity_type_id: shot.shot_type_id,
      project_id: shot.production_id
    }
    superagent
      .post(`/api/data/entities/`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  updateShot (shot, callback) {
    const data = {
      name: shot.name,
      entity_type_id: shot.shot_type_id,
      project_id: shot.project_id
    }
    superagent
      .put(`/api/data/entities/${shot.id}`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteShot (shot, callback) {
    superagent
      .del(`/api/data/entities/${shot.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  postCsv (formData, callback) {
    superagent
      .post('/api/data/import/csv/shots')
      .send(formData)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}

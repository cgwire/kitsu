import superagent from 'superagent'

export default {
  getProductions (callback) {
    superagent
      .get('/api/data/projects/all')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  getOpenProductions (callback) {
    superagent
      .get('/api/data/projects/open')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  getProductionStatus (callback) {
    superagent
      .get('/api/data/project_status')
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  newProduction (production, callback) {
    const data = {
      name: production.name,
      project_status_id: production.project_status_id
    }
    superagent
      .post(`/api/data/projects/`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  updateProduction (production, callback) {
    const data = {
      name: production.name,
      project_status_id: production.project_status_id
    }
    superagent
      .put(`/api/data/projects/${production.id}`)
      .send(data)
      .end((err, res) => {
        callback(err, res.body)
      })
  },

  deleteProduction (production, callback) {
    superagent
      .del(`/api/data/projects/${production.id}`)
      .end((err, res) => {
        callback(err, res.body)
      })
  }
}

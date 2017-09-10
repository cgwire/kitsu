import client from './client'

export default {
  getShots (callback) {
    client.get('/api/data/shots/with-tasks', callback)
  },

  getShotType (callback) {
    client.get('/api/data/shot-type', callback)
  },

  newShot (shot, callback) {
    const data = {
      name: shot.name,
      entity_type_id: shot.shot_type_id,
      project_id: shot.production_id
    }
    client.post(`/api/data/entities/`, data, callback)
  },

  updateShot (shot, callback) {
    const data = {
      name: shot.name,
      entity_type_id: shot.shot_type_id,
      project_id: shot.project_id
    }
    client.put(`/api/data/entities/${shot.id}`, data, callback)
  },

  deleteShot (shot, callback) {
    client.del(`/api/data/shots/${shot.id}`, callback)
  },

  postCsv (formData, callback) {
    client.post('/api/import/csv/shots', formData, callback)
  }
}

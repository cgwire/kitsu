import client from './client'
import superagent from 'superagent'

export default {
  getCustomActions (callback) {
    client.get('/api/data/custom-actions', callback)
  },

  newCustomAction (customAction, callback) {
    const data = {
      name: customAction.name,
      url: customAction.url
    }
    client.post('/api/data/custom-actions/', data, callback)
  },

  updateCustomAction (customAction, callback) {
    const data = {
      name: customAction.name,
      url: customAction.url,
      entity_type: customAction.entityType,
      is_ajax: customAction.isAjax === 'true'
    }
    client.put(`/api/data/custom-actions/${customAction.id}`, data, callback)
  },

  deleteCustomAction (customAction, callback) {
    client.del(`/api/data/custom-actions/${customAction.id}`, callback)
  },

  postCustomAction (url, data) {
    return new Promise((resolve, reject) => {
      superagent
        .post(url)
        .withCredentials()
        .send(data)
        .end((err, res) => {
          if (err) reject(err)
          else resolve()
        })
    })
  }
}

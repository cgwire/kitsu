import client from './client'
import superagent from 'superagent'

export default {
  getCustomActions (callback) {
    client.get('/api/data/custom-actions', callback)
  },

  newCustomAction (customAction) {
    const data = {
      name: customAction.name,
      url: customAction.url
    }
    return client.ppost('/api/data/custom-actions/', data)
  },

  updateCustomAction (customAction) {
    const data = {
      name: customAction.name,
      url: customAction.url,
      entity_type: customAction.entityType,
      is_ajax: customAction.isAjax === 'true'
    }
    return client.pput(`/api/data/custom-actions/${customAction.id}`, data)
  },

  deleteCustomAction (customAction) {
    return client.pdel(`/api/data/custom-actions/${customAction.id}`)
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

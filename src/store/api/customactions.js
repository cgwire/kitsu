import client from './client'

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
      entity_type: customAction.entityType
    }
    client.put(`/api/data/custom-actions/${customAction.id}`, data, callback)
  },

  deleteCustomAction (customAction, callback) {
    client.del(`/api/data/custom-actions/${customAction.id}`, callback)
  }
}

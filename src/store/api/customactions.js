import client from '@/store/api/client'
import superagent from 'superagent'

export default {
  getCustomActions() {
    return client.pget('/api/data/custom-actions')
  },

  newCustomAction(customAction) {
    const data = {
      name: customAction.name,
      url: customAction.url,
      entity_type: customAction.entityType,
      is_ajax: customAction.isAjax === 'true'
    }
    return client.ppost('/api/data/custom-actions/', data)
  },

  updateCustomAction(customAction) {
    const data = {
      name: customAction.name,
      url: customAction.url,
      entity_type: customAction.entityType,
      is_ajax: customAction.isAjax === 'true'
    }
    return client.pput(`/api/data/custom-actions/${customAction.id}`, data)
  },

  deleteCustomAction(customAction) {
    return client.pdel(`/api/data/custom-actions/${customAction.id}`)
  },

  postCustomAction(url, data) {
    return superagent.post(url).withCredentials().send(data)
  }
}

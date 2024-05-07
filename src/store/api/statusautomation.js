import client from '@/store/api/client'
import superagent from 'superagent'

export default {
  getStatusAutomations(callback) {
    client.get('/api/data/status-automations', callback)
  },

  getStatusAutomation(statusAutomationId, callback) {
    client.get(`/api/data/status-automations/${statusAutomationId}`, callback)
  },

  newStatusAutomation(statusAutomation) {
    const data = {
      entity_type: statusAutomation.entityType,
      in_field_type: statusAutomation.inFieldType,
      in_task_type_id: statusAutomation.inTaskTypeId,
      in_task_status_id: statusAutomation.inTaskStatusId,
      out_field_type: statusAutomation.outFieldType,
      out_task_type_id: statusAutomation.outTaskTypeId,
      out_task_status_id: statusAutomation.outTaskStatusId,
      import_last_revision: statusAutomation.importLastRevision
    }
    return client.ppost('/api/data/status-automations/', data)
  },

  updateStatusAutomation(statusAutomation) {
    const data = {
      entity_type: statusAutomation.entityType,
      in_field_type: statusAutomation.inFieldType,
      in_task_type_id: statusAutomation.inTaskTypeId,
      in_task_status_id: statusAutomation.inTaskStatusId,
      out_field_type: statusAutomation.outFieldType,
      out_task_type_id: statusAutomation.outTaskTypeId,
      out_task_status_id: statusAutomation.outTaskStatusId,
      import_last_revision: statusAutomation.importLastRevision === 'true',
      archived: statusAutomation.archived === 'true'
    }
    return client.pput(
      `/api/data/status-automations/${statusAutomation.id}`,
      data
    )
  },

  deleteStatusAutomation(statusAutomation) {
    return client.pdel(`/api/data/status-automations/${statusAutomation.id}`)
  },

  postStatusAutomation(url, data) {
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

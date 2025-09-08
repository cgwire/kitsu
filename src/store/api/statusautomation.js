import client from '@/store/api/client'

export default {
  getStatusAutomations() {
    return client.pget('/api/data/status-automations')
  },

  getStatusAutomation(statusAutomationId) {
    return client.pget(`/api/data/status-automations/${statusAutomationId}`)
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
      import_last_revision: statusAutomation.importLastRevision === 'true'
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
  }
}

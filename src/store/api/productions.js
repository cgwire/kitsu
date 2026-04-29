import client from '@/store/api/client'

const toBoolean = value => value === true || value === 'true'

export default {
  getProductions() {
    return client.pget('/api/data/projects/all')
  },

  getProduction(productionId) {
    return client.getModel('projects', productionId)
  },

  getOpenProductions() {
    return client.pget('/api/data/projects/open')
  },

  getProductionStatus() {
    return client.pget('/api/data/project-status')
  },

  getProductionStats() {
    return client.pget('/api/data/tasks/open-tasks/stats')
  },

  newProduction(production) {
    return client.ppost('/api/data/projects/', production)
  },

  // HTTP PUT, but Zou preserves any field absent from the payload — so
  // callers can send a full or partial payload and only the fields they
  // explicitly provide are forwarded.
  updateProduction(production) {
    const BOOLEAN_FIELDS = [
      'is_clients_isolated',
      'is_preview_download_allowed',
      'is_set_preview_automated',
      'is_publish_default_for_artists'
    ]
    const { id, ...data } = production
    BOOLEAN_FIELDS.forEach(field => {
      if (data[field] !== undefined) {
        data[field] = toBoolean(data[field])
      }
    })
    return client.pput(`/api/data/projects/${id}`, data)
  },

  postAvatar(productionId, formData) {
    return client.ppost(
      `/api/pictures/thumbnails/projects/${productionId}`,
      formData
    )
  },

  deleteProduction(production) {
    return client.pdel(`/api/data/projects/${production.id}?force=true`)
  },

  addPersonToTeam(productionId, personId) {
    const data = { person_id: personId }
    return client.ppost(`/api/data/projects/${productionId}/team`, data)
  },

  removePersonFromTeam(productionId, personId) {
    return client.pdel(`/api/data/projects/${productionId}/team/${personId}`)
  },

  addAssetTypeToProduction(productionId, assetTypeId) {
    const data = { asset_type_id: assetTypeId }
    const path = `/api/data/projects/${productionId}/settings/asset-types`
    return client.ppost(path, data)
  },

  removeAssetTypeFromProduction(productionId, assetTypeId) {
    const path = `/api/data/projects/${productionId}/settings/asset-types/${assetTypeId}`
    return client.pdel(path)
  },

  addBackgroundToProduction(productionId, backgroundId) {
    const data = { preview_background_file_id: backgroundId }
    return client.ppost(
      `/api/data/projects/${productionId}/settings/preview-background-files`,
      data
    )
  },

  removeBackgroundFromProduction(productionId, backgroundId) {
    return client.pdel(
      `/api/data/projects/${productionId}/settings/preview-background-files/${backgroundId}`
    )
  },

  setDefaultBackgroundToProduction(productionId, backgroundId) {
    return client.pput(`/api/data/projects/${productionId}`, {
      default_preview_background_file_id: backgroundId
    })
  },

  addTaskTypeToProduction(productionId, taskTypeId, priority) {
    const data = { task_type_id: taskTypeId, priority }
    const path = `/api/data/projects/${productionId}/settings/task-types`
    return client.ppost(path, data)
  },

  removeTaskTypeFromProduction(productionId, taskTypeId) {
    const path = `/api/data/projects/${productionId}/settings/task-types/${taskTypeId}`
    return client.pdel(path)
  },

  addTaskStatusToProduction(productionId, taskStatusId) {
    const data = { task_status_id: taskStatusId }
    const path = `/api/data/projects/${productionId}/settings/task-status`
    return client.ppost(path, data)
  },

  removeTaskStatusFromProduction(productionId, taskStatusId) {
    const path = `/api/data/projects/${productionId}/settings/task-status/${taskStatusId}`
    return client.pdel(path)
  },

  addStatusAutomationToProduction(productionId, statusAutomationId) {
    const data = { status_automation_id: statusAutomationId }
    const path = `/api/data/projects/${productionId}/settings/status-automations`
    return client.ppost(path, data)
  },

  removeStatusAutomationFromProduction(productionId, statusAutomationId) {
    const path = `/api/data/projects/${productionId}/settings/status-automations/${statusAutomationId}`
    return client.pdel(path)
  },

  addMetadataDescriptor(productionId, descriptor) {
    const data = {
      name: descriptor.name,
      data_type: descriptor.data_type,
      choices: descriptor.values,
      for_client: toBoolean(descriptor.for_client),
      entity_type: descriptor.entity_type,
      departments: descriptor.departments
    }
    return client.ppost(
      `/api/data/projects/${productionId}/metadata-descriptors`,
      data
    )
  },

  getMetadataDescriptor(productionId, descriptorId) {
    return client.pget(
      `/api/data/projects/${productionId}/metadata-descriptors/${descriptorId}`
    )
  },

  updateMetadataDescriptor(productionId, descriptor) {
    const data = {
      id: descriptor.id,
      name: descriptor.name,
      data_type: descriptor.data_type,
      choices: descriptor.values,
      for_client: toBoolean(descriptor.for_client),
      entity_type: descriptor.entity_type,
      departments: descriptor.departments
    }
    return client.pput(
      `/api/data/projects/${productionId}/metadata-descriptors/${descriptor.id}`,
      data
    )
  },

  deleteMetadataDescriptor(productionId, descriptorId) {
    return client.pdel(
      `/api/data/projects/${productionId}/metadata-descriptors/${descriptorId}`
    )
  },

  reorderMetadataDescriptors(productionId, entityType, descriptorIds) {
    const data = {
      entity_type: entityType,
      descriptor_ids: descriptorIds
    }
    return client.ppost(
      `/api/data/projects/${productionId}/metadata-descriptors/reorder`,
      data
    )
  }
}

import client from '@/store/api/client'

export default {
  getProjectTemplates() {
    return client.pget('/api/data/project-templates')
  },

  getProjectTemplate(templateId) {
    return client.pget(`/api/data/project-templates/${templateId}`)
  },

  newProjectTemplate(template) {
    const data = {
      name: template.name,
      description: template.description,
      production_type: template.production_type,
      production_style: template.production_style,
      fps: template.fps,
      ratio: template.ratio,
      resolution: template.resolution,
      max_retakes: template.max_retakes,
      homepage: template.homepage,
      is_clients_isolated: template.is_clients_isolated,
      is_preview_download_allowed: template.is_preview_download_allowed,
      is_set_preview_automated: template.is_set_preview_automated,
      is_publish_default_for_artists: template.is_publish_default_for_artists
    }
    return client.ppost('/api/data/project-templates', data)
  },

  editProjectTemplate(template) {
    const data = {
      name: template.name,
      description: template.description,
      production_type: template.production_type,
      production_style: template.production_style,
      fps: template.fps,
      ratio: template.ratio,
      resolution: template.resolution,
      max_retakes: template.max_retakes,
      homepage: template.homepage,
      is_clients_isolated: template.is_clients_isolated,
      is_preview_download_allowed: template.is_preview_download_allowed,
      is_set_preview_automated: template.is_set_preview_automated,
      is_publish_default_for_artists: template.is_publish_default_for_artists
    }
    return client.pput(`/api/data/project-templates/${template.id}`, data)
  },

  deleteProjectTemplate(templateId) {
    return client.pdel(`/api/data/project-templates/${templateId}`)
  },

  newProjectTemplateFromProject(projectId, data) {
    return client.ppost(
      `/api/data/project-templates/from-project/${projectId}`,
      data
    )
  },

  applyTemplateToProject(projectId, templateId) {
    return client.ppost(
      `/api/data/projects/${projectId}/apply-template/${templateId}`,
      {}
    )
  },

  // Task type links
  getTemplateTaskTypes(templateId) {
    return client.pget(`/api/data/project-templates/${templateId}/task-types`)
  },

  addTaskTypeToTemplate(templateId, taskTypeId, priority) {
    return client.ppost(
      `/api/data/project-templates/${templateId}/task-types`,
      { task_type_id: taskTypeId, priority }
    )
  },

  removeTaskTypeFromTemplate(templateId, taskTypeId) {
    return client.pdel(
      `/api/data/project-templates/${templateId}/task-types/${taskTypeId}`
    )
  },

  // Task status links
  getTemplateTaskStatuses(templateId) {
    return client.pget(
      `/api/data/project-templates/${templateId}/task-statuses`
    )
  },

  addTaskStatusToTemplate(templateId, taskStatusId, priority, rolesForBoard) {
    const data = { task_status_id: taskStatusId }
    if (priority != null) data.priority = priority
    if (rolesForBoard != null) data.roles_for_board = rolesForBoard
    return client.ppost(
      `/api/data/project-templates/${templateId}/task-statuses`,
      data
    )
  },

  removeTaskStatusFromTemplate(templateId, taskStatusId) {
    return client.pdel(
      `/api/data/project-templates/${templateId}/task-statuses/${taskStatusId}`
    )
  },

  // Asset type links
  getTemplateAssetTypes(templateId) {
    return client.pget(`/api/data/project-templates/${templateId}/asset-types`)
  },

  addAssetTypeToTemplate(templateId, assetTypeId) {
    return client.ppost(
      `/api/data/project-templates/${templateId}/asset-types`,
      { asset_type_id: assetTypeId }
    )
  },

  removeAssetTypeFromTemplate(templateId, assetTypeId) {
    return client.pdel(
      `/api/data/project-templates/${templateId}/asset-types/${assetTypeId}`
    )
  },

  // Status automation links
  getTemplateStatusAutomations(templateId) {
    return client.pget(
      `/api/data/project-templates/${templateId}/status-automations`
    )
  },

  addStatusAutomationToTemplate(templateId, statusAutomationId) {
    return client.ppost(
      `/api/data/project-templates/${templateId}/status-automations`,
      { status_automation_id: statusAutomationId }
    )
  },

  removeStatusAutomationFromTemplate(templateId, statusAutomationId) {
    return client.pdel(
      `/api/data/project-templates/${templateId}/status-automations/${statusAutomationId}`
    )
  },

  // Preview background files
  getTemplateBackgrounds(templateId) {
    return client.pget(
      `/api/data/project-templates/${templateId}/preview-background-files`
    )
  },

  addBackgroundToTemplate(templateId, backgroundId) {
    return client.ppost(
      `/api/data/project-templates/${templateId}/preview-background-files`,
      { preview_background_file_id: backgroundId }
    )
  },

  removeBackgroundFromTemplate(templateId, backgroundId) {
    return client.pdel(
      `/api/data/project-templates/${templateId}/preview-background-files/${backgroundId}`
    )
  },

  setTemplateDefaultBackground(templateId, backgroundId) {
    return client.pput(
      `/api/data/project-templates/${templateId}/default-preview-background-file`,
      { default_preview_background_file_id: backgroundId }
    )
  },

  // Metadata descriptors
  setTemplateMetadataDescriptors(templateId, descriptors) {
    return client.pput(
      `/api/data/project-templates/${templateId}/metadata-descriptors`,
      { metadata_descriptors: descriptors }
    )
  }
}

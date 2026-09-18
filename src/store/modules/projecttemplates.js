import { sortByName } from '@/lib/sorting'
import projectTemplatesApi from '@/store/api/projecttemplates'
import {
  LOAD_PROJECT_TEMPLATES_END,
  EDIT_PROJECT_TEMPLATE_END,
  DELETE_PROJECT_TEMPLATE_END,
  RESET_ALL
} from '@/store/mutation-types'

const cache = {
  projectTemplateMap: new Map()
}

const initialState = {
  projectTemplates: []
}

const state = { ...initialState }

const getters = {
  projectTemplates: state => state.projectTemplates,
  projectTemplateMap: state => cache.projectTemplateMap,

  getProjectTemplate: state => id => {
    return state.projectTemplates.find(t => t.id === id)
  }
}

const actions = {
  async loadProjectTemplates({ commit }) {
    const templates = await projectTemplatesApi.getProjectTemplates()
    commit(LOAD_PROJECT_TEMPLATES_END, templates)
    return templates
  },

  async loadProjectTemplate(_, templateId) {
    return projectTemplatesApi.getProjectTemplate(templateId)
  },

  async newProjectTemplate({ commit }, data) {
    const template = await projectTemplatesApi.newProjectTemplate(data)
    commit(EDIT_PROJECT_TEMPLATE_END, template)
    return template
  },

  async editProjectTemplate({ commit }, data) {
    const template = await projectTemplatesApi.editProjectTemplate(data)
    commit(EDIT_PROJECT_TEMPLATE_END, template)
    return template
  },

  async deleteProjectTemplate({ commit }, template) {
    await projectTemplatesApi.deleteProjectTemplate(template.id)
    commit(DELETE_PROJECT_TEMPLATE_END, template)
    return template
  },

  async newProjectTemplateFromProject(
    { commit },
    { projectId, name, description }
  ) {
    const template = await projectTemplatesApi.newProjectTemplateFromProject(
      projectId,
      { name, description }
    )
    commit(EDIT_PROJECT_TEMPLATE_END, template)
    return template
  },

  async applyTemplateToProject(_, { projectId, templateId }) {
    return projectTemplatesApi.applyTemplateToProject(projectId, templateId)
  },

  loadTemplateTaskTypes(_, templateId) {
    return projectTemplatesApi.getTemplateTaskTypes(templateId)
  },

  addTaskTypeToTemplate(_, { templateId, taskTypeId, priority, ...bitrates }) {
    return projectTemplatesApi.addTaskTypeToTemplate(
      templateId,
      taskTypeId,
      priority,
      bitrates
    )
  },

  removeTaskTypeFromTemplate(_, { templateId, taskTypeId }) {
    return projectTemplatesApi.removeTaskTypeFromTemplate(
      templateId,
      taskTypeId
    )
  },

  reorderTemplateTaskTypes(_, { templateId, taskTypeIds }) {
    if (!taskTypeIds?.length) return Promise.resolve()
    return projectTemplatesApi.reorderTemplateTaskTypes(templateId, taskTypeIds)
  },

  loadTemplateTaskStatuses(_, templateId) {
    return projectTemplatesApi.getTemplateTaskStatuses(templateId)
  },

  addTaskStatusToTemplate(
    _,
    { templateId, taskStatusId, priority, rolesForBoard }
  ) {
    return projectTemplatesApi.addTaskStatusToTemplate(
      templateId,
      taskStatusId,
      priority,
      rolesForBoard
    )
  },

  removeTaskStatusFromTemplate(_, { templateId, taskStatusId }) {
    return projectTemplatesApi.removeTaskStatusFromTemplate(
      templateId,
      taskStatusId
    )
  },

  reorderTemplateTaskStatuses(_, { templateId, taskStatusIds }) {
    if (!taskStatusIds?.length) return Promise.resolve()
    return projectTemplatesApi.reorderTemplateTaskStatuses(
      templateId,
      taskStatusIds
    )
  },

  loadTemplateAssetTypes(_, templateId) {
    return projectTemplatesApi.getTemplateAssetTypes(templateId)
  },

  addAssetTypeToTemplate(_, { templateId, assetTypeId }) {
    return projectTemplatesApi.addAssetTypeToTemplate(templateId, assetTypeId)
  },

  removeAssetTypeFromTemplate(_, { templateId, assetTypeId }) {
    return projectTemplatesApi.removeAssetTypeFromTemplate(
      templateId,
      assetTypeId
    )
  },

  loadTemplateStatusAutomations(_, templateId) {
    return projectTemplatesApi.getTemplateStatusAutomations(templateId)
  },

  addStatusAutomationToTemplate(_, { templateId, statusAutomationId }) {
    return projectTemplatesApi.addStatusAutomationToTemplate(
      templateId,
      statusAutomationId
    )
  },

  removeStatusAutomationFromTemplate(_, { templateId, statusAutomationId }) {
    return projectTemplatesApi.removeStatusAutomationFromTemplate(
      templateId,
      statusAutomationId
    )
  },

  loadTemplateBackgrounds(_, templateId) {
    return projectTemplatesApi.getTemplateBackgrounds(templateId)
  },

  addBackgroundToTemplate(_, { templateId, backgroundId }) {
    return projectTemplatesApi.addBackgroundToTemplate(templateId, backgroundId)
  },

  removeBackgroundFromTemplate(_, { templateId, backgroundId }) {
    return projectTemplatesApi.removeBackgroundFromTemplate(
      templateId,
      backgroundId
    )
  },

  setTemplateDefaultBackground(_, { templateId, backgroundId }) {
    return projectTemplatesApi.setTemplateDefaultBackground(
      templateId,
      backgroundId
    )
  },

  setTemplateMetadataDescriptors(_, { templateId, descriptors }) {
    return projectTemplatesApi.setTemplateMetadataDescriptors(
      templateId,
      descriptors
    )
  }
}

const mutations = {
  [LOAD_PROJECT_TEMPLATES_END](state, templates) {
    state.projectTemplates = sortByName(templates)
    cache.projectTemplateMap.clear()
    templates.forEach(template => {
      cache.projectTemplateMap.set(template.id, template)
    })
  },

  [EDIT_PROJECT_TEMPLATE_END](state, newTemplate) {
    const existing = getters.getProjectTemplate(state)(newTemplate.id)
    if (existing?.id) {
      Object.assign(existing, newTemplate)
    } else {
      state.projectTemplates.push(newTemplate)
    }
    cache.projectTemplateMap.set(newTemplate.id, newTemplate)
    state.projectTemplates = sortByName(state.projectTemplates)
  },

  [DELETE_PROJECT_TEMPLATE_END](state, templateToDelete) {
    const index = state.projectTemplates.findIndex(
      t => t.id === templateToDelete.id
    )
    if (index >= 0) {
      state.projectTemplates.splice(index, 1)
    }
    cache.projectTemplateMap.delete(templateToDelete.id)
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
    cache.projectTemplateMap.clear()
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

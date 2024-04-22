import Vue from 'vue/dist/vue'
import productionsApi from '@/store/api/productions'
import { sortProductions, sortByName } from '@/lib/sorting'
import {
  addToIdList,
  removeFromIdList,
  removeModelFromList,
  updateModelFromList
} from '@/lib/models'
import {
  LOAD_PRODUCTIONS_START,
  LOAD_PRODUCTIONS_ERROR,
  LOAD_PRODUCTIONS_END,
  LOAD_OPEN_PRODUCTIONS_START,
  LOAD_OPEN_PRODUCTIONS_ERROR,
  LOAD_OPEN_PRODUCTIONS_END,
  LOAD_PRODUCTION_STATUS_START,
  LOAD_PRODUCTION_STATUS_ERROR,
  LOAD_PRODUCTION_STATUS_END,
  ADD_PRODUCTION,
  UPDATE_PRODUCTION,
  REMOVE_PRODUCTION,
  RESET_PRODUCTION_PATH,
  SET_CURRENT_PRODUCTION,
  PRODUCTION_PICTURE_FILE_SELECTED,
  PRODUCTION_AVATAR_UPLOADED,
  TEAM_ADD_PERSON,
  TEAM_REMOVE_PERSON,
  PRODUCTION_ADD_ASSET_TYPE,
  PRODUCTION_REMOVE_ASSET_TYPE,
  PRODUCTION_ADD_BACKGROUND,
  PRODUCTION_REMOVE_BACKGROUND,
  PRODUCTION_UPDATE_DEFAULT_BACKGROUND,
  PRODUCTION_ADD_TASK_TYPE,
  PRODUCTION_REMOVE_TASK_TYPE,
  PRODUCTION_ADD_TASK_STATUS,
  PRODUCTION_REMOVE_TASK_STATUS,
  PRODUCTION_ADD_STATUS_AUTOMATION,
  PRODUCTION_REMOVE_STATUS_AUTOMATION,
  ASSIGN_TASKS,
  ADD_METADATA_DESCRIPTOR_END,
  UPDATE_METADATA_DESCRIPTOR_END,
  DELETE_METADATA_DESCRIPTOR_END,
  CLEAR_SHOTS,
  CLEAR_ASSETS,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  productions: [],
  productionMap: new Map(),
  openProductions: [],
  productionStatus: [],
  productionStatusMap: new Map(),
  currentProduction: null,
  productionAvatarFormData: null,

  isProductionsLoading: false,
  isProductionsLoadingError: false,
  isOpenProductionsLoading: false,

  assetsPath: { name: 'open-productions' },
  assetTypesPath: { name: 'open-productions' },
  shotsPath: { name: 'open-productions' },
  editsPath: { name: 'open-productions' },
  episodesPath: { name: 'open-productions' },
  sequencesPath: { name: 'open-productions' },
  sequenceStatsPath: { name: 'open-productions' },
  episodeStatsPath: { name: 'open-productions' },
  breakdownPath: { name: 'open-productions' },
  playlistsPath: { name: 'open-productions' },
  teamPath: { name: 'open-productions' }
}

const state = { ...initialState }

const helpers = {
  getProductionComponentPath(routeName, productionId, episodeId) {
    let route = { name: 'open-productions' }
    if (episodeId) {
      route = {
        name: 'episode-' + routeName,
        params: {
          episode_id: episodeId,
          production_id: productionId
        }
      }
    } else if (productionId) {
      return {
        name: routeName,
        params: {
          production_id: productionId
        }
      }
    }
    if (
      ['assets', 'shots', 'edits', 'sequences', 'episodes'].includes(routeName)
    ) {
      route.query = { search: '' }
    }
    return route
  },

  isEmptyArray(production, field) {
    return !production || !production[field] || production[field].length === 0
  }
}

const productionEntityTaskTypeIds = entityType => (state, getters) => {
  return getters.productionTaskTypes
    .filter(taskType => taskType.for_entity === entityType)
    .map(taskType => taskType.id)
}

const productionEntityTaskTypes = entityType => (state, getters) => {
  return getters.productionTaskTypes.filter(
    taskType => taskType && taskType.for_entity === entityType
  )
}

const entityMetadataDescriptors = entityType => (state, getters) => {
  if (!state.currentProduction || !state.currentProduction.descriptors) {
    return []
  } else {
    return sortByName(
      state.currentProduction.descriptors.filter(
        d => d.entity_type === entityType
      )
    )
  }
}

const getters = {
  productions: state => state.productions,
  productionMap: state => state.productionMap,
  productionStatusMap: state => state.productionStatusMap,
  openProductions: state => state.openProductions,
  productionStatus: state => state.productionStatus,

  productionAvatarFormData: state => state.productionAvatarFormData,

  isProductionsLoading: state => state.isProductionsLoading,
  isProductionsLoadingError: state => state.isProductionsLoadingError,
  isOpenProductionsLoading: state => state.isOpenProductionsLoading,

  assetsPath: state => state.assetsPath,
  assetTypesPath: state => state.assetTypesPath,
  shotsPath: state => state.shotsPath,
  sequencesPath: state => state.sequencesPath,
  editsPath: state => state.editsPath,
  episodesPath: state => state.episodesPath,
  episodeStatsPath: state => state.episodeStatsPath,
  breakdownPath: state => state.breakdownPath,
  playlistsPath: state => state.playlistsPath,
  teamPath: state => state.teamPath,

  productionAssetTypes: (state, getters, rootState) => {
    if (!state.currentProduction) return []
    if (helpers.isEmptyArray(state.currentProduction, 'asset_types')) {
      return rootState.assetTypes.assetTypes
    } else {
      return sortByName(
        state.currentProduction.asset_types.map(id =>
          rootState.assetTypes.assetTypeMap.get(id)
        )
      )
    }
  },

  productionBackgrounds: (state, getters) => {
    return getters.getProductionBackgrounds(state.currentProduction?.id)
  },

  getProductionBackgrounds: (state, rootState) => id => {
    const production = state.productionMap.get(id)
    const backgrounds = production?.preview_background_files?.map(id =>
      rootState.backgroundMap.get(id)
    )
    return backgrounds ? sortByName(backgrounds) : []
  },

  productionTaskStatuses: (state, getters, rootState) => {
    if (helpers.isEmptyArray(state.currentProduction, 'task_statuses')) {
      return rootState.taskStatus.taskStatus
    } else {
      return sortByName(
        state.currentProduction.task_statuses.map(id =>
          rootState.taskStatus.taskStatusMap.get(id)
        )
      )
    }
  },

  getProductionTaskStatuses: (state, getters, rootState) => id => {
    const production = state.productionMap.get(id)
    if (helpers.isEmptyArray(production, 'task_statuses')) {
      return rootState.taskStatus.taskStatus
    } else {
      return sortByName(
        production.task_statuses.map(id =>
          rootState.taskStatus.taskStatusMap.get(id)
        )
      )
    }
  },

  productionStatusAutomations: (state, getters, rootState) => {
    if (helpers.isEmptyArray(state.currentProduction, 'status_automations')) {
      return []
    } else {
      return state.currentProduction.status_automations.map(id =>
        rootState.statusAutomations.statusAutomationMap.get(id)
      )
    }
  },

  remainingStatusAutomations: (state, getters, rootState, rootGetters) => {
    return rootState.statusAutomations.statusAutomations.filter(
      s =>
        !state.currentProduction.status_automations.includes(s.id) &&
        !rootGetters.isStatusAutomationDisabled(s)
    )
  },

  productionTaskTypes: (state, getters, rootState) => {
    if (helpers.isEmptyArray(state.currentProduction, 'task_types')) {
      return rootState.taskTypes.taskTypes
    } else {
      return sortByName(
        state.currentProduction.task_types.map(id =>
          rootState.taskTypes.taskTypeMap.get(id)
        )
      )
    }
  },

  getProductionTaskTypes: (state, getters, rootState) => id => {
    const production = state.productionMap.get(id)
    if (helpers.isEmptyArray(production, 'task_types')) {
      return rootState.taskTypes.taskTypes
    } else {
      return sortByName(
        production.task_types.map(id => rootState.taskTypes.taskTypeMap.get(id))
      )
    }
  },

  productionAssetTaskTypeIds: productionEntityTaskTypeIds('Asset'),
  productionShotTaskTypeIds: productionEntityTaskTypeIds('Shot'),
  productionEditTaskTypeIds: productionEntityTaskTypeIds('Edit'),
  productionEpisodeTaskTypeIds: productionEntityTaskTypeIds('Episode'),
  productionSequenceTaskTypeIds: productionEntityTaskTypeIds('Sequence'),

  productionAssetTaskTypes: productionEntityTaskTypes('Asset'),
  productionShotTaskTypes: productionEntityTaskTypes('Shot'),
  productionEditTaskTypes: productionEntityTaskTypes('Edit'),
  productionEpisodeTaskTypes: productionEntityTaskTypes('Episode'),
  productionSequenceTaskTypes: productionEntityTaskTypes('Sequence'),

  assetMetadataDescriptors: entityMetadataDescriptors('Asset'),
  shotMetadataDescriptors: entityMetadataDescriptors('Shot'),
  sequenceMetadataDescriptors: entityMetadataDescriptors('Sequence'),
  episodeMetadataDescriptors: entityMetadataDescriptors('Episode'),
  editMetadataDescriptors: entityMetadataDescriptors('Edit'),

  currentProduction: state => {
    if (state.currentProduction) {
      return state.currentProduction
    } else if (state.openProductions.length > 0) {
      return state.openProductions[0]
    } else {
      return null
    }
  },

  isTVShow: state => {
    const production = getters.currentProduction(state)
    return production && production.production_type === 'tvshow'
  },

  productionDepartmentIds: (state, getters) => {
    const departmentIds = {}
    return getters.productionTaskTypes.reduce((acc, type) => {
      if (type.department_id && !departmentIds[type.department_id]) {
        departmentIds[type.department_id] = true
        acc.push(type.department_id)
      }
      return acc
    }, [])
  },

  productionAssetTypeOptions: (state, getters) => {
    return getters.productionAssetTypes
      .filter(assetType => assetType !== undefined)
      .map(assetType => ({ label: assetType.name, value: assetType.id }))
  },

  productionStatusOptions: state =>
    state.productionStatus.map(status => ({
      label: status.name,
      value: status.id
    })),

  openProductionOptions: state =>
    state.openProductions.map(production => ({
      label: production.name,
      value: production.id
    }))
}

const actions = {
  loadProductionStatus({ commit, state }, callback) {
    commit(LOAD_PRODUCTION_STATUS_START)
    productionsApi.getProductionStatus((err, productionStatus) => {
      if (err) commit(LOAD_PRODUCTION_STATUS_ERROR)
      else commit(LOAD_PRODUCTION_STATUS_END, productionStatus)
      if (callback) callback(err)
    })
  },

  async loadOpenProductions({ commit }) {
    commit(LOAD_OPEN_PRODUCTIONS_START)
    try {
      const productions = await productionsApi.getOpenProductions()
      commit(LOAD_OPEN_PRODUCTIONS_END, productions)
    } catch (err) {
      commit(LOAD_OPEN_PRODUCTIONS_ERROR)
    }
  },

  loadProductions({ commit, state }, callback) {
    commit(LOAD_PRODUCTIONS_START)
    productionsApi.getProductions((err, productions) => {
      if (err) commit(LOAD_PRODUCTIONS_ERROR)
      else commit(LOAD_PRODUCTIONS_END, productions)
      if (callback) callback(err)
    })
  },

  loadProduction({ commit, state }, productionId) {
    return productionsApi
      .getProduction(productionId)
      .then(production => {
        if (state.productionMap.get(production.id)) {
          commit(UPDATE_PRODUCTION, production)
        } else {
          commit(ADD_PRODUCTION, production)
        }
      })
      .catch(console.error)
  },

  newProduction({ commit, state }, data) {
    return productionsApi.newProduction(data).then(production => {
      commit(ADD_PRODUCTION, production)
      return production
    })
  },

  editProduction({ commit, state }, data) {
    return productionsApi.updateProduction(data).then(production => {
      commit(UPDATE_PRODUCTION, production)
    })
  },

  deleteProduction({ commit, state }, production) {
    return productionsApi.deleteProduction(production).then(() => {
      commit(REMOVE_PRODUCTION, production)
    })
  },

  setProduction({ commit, rootGetters }, productionId) {
    commit(SET_CURRENT_PRODUCTION, productionId)
    commit(CLEAR_ASSETS)
    commit(CLEAR_SHOTS)
    if (rootGetters.isTVShow) {
      const episode = rootGetters.currentEpisode
      const episodeId = episode ? episode.id : null
      if (productionId) {
        commit(RESET_PRODUCTION_PATH, { productionId, episodeId })
      }
    } else {
      if (productionId) {
        commit(RESET_PRODUCTION_PATH, { productionId })
      }
    }
  },

  storeProductionPicture({ commit }, formData) {
    commit(PRODUCTION_PICTURE_FILE_SELECTED, formData)
  },

  uploadProductionAvatar({ commit, state }, productionId) {
    return new Promise((resolve, reject) => {
      productionsApi.postAvatar(
        productionId,
        state.productionAvatarFormData,
        err => {
          commit(PRODUCTION_AVATAR_UPLOADED, productionId)
          if (err) reject(err)
          else resolve()
        }
      )
    })
  },

  addPersonToTeam({ commit, state }, person) {
    commit(TEAM_ADD_PERSON, person.id)
    return productionsApi.addPersonToTeam(state.currentProduction.id, person.id)
  },

  removePersonFromTeam({ commit, state }, person) {
    commit(TEAM_REMOVE_PERSON, person.id)
    return productionsApi.removePersonFromTeam(
      state.currentProduction.id,
      person.id
    )
  },

  addAssetTypeToProduction({ commit, state }, assetTypeId) {
    commit(PRODUCTION_ADD_ASSET_TYPE, assetTypeId)
    return productionsApi.addAssetTypeToProduction(
      state.currentProduction.id,
      assetTypeId
    )
  },

  removeAssetTypeFromProduction({ commit, state }, assetTypeId) {
    commit(PRODUCTION_REMOVE_ASSET_TYPE, assetTypeId)
    return productionsApi.removeAssetTypeFromProduction(
      state.currentProduction.id,
      assetTypeId
    )
  },

  addTaskTypeToProduction({ commit, state }, { taskTypeId, priority = null }) {
    commit(PRODUCTION_ADD_TASK_TYPE, taskTypeId)
    return productionsApi.addTaskTypeToProduction(
      state.currentProduction.id,
      taskTypeId,
      priority
    )
  },

  removeTaskTypeFromProduction({ commit, state }, taskTypeId) {
    commit(PRODUCTION_REMOVE_TASK_TYPE, taskTypeId)
    return productionsApi.removeTaskTypeFromProduction(
      state.currentProduction.id,
      taskTypeId
    )
  },

  addTaskStatusToProduction({ commit, state }, taskStatusId) {
    commit(PRODUCTION_ADD_TASK_STATUS, taskStatusId)
    return productionsApi.addTaskStatusToProduction(
      state.currentProduction.id,
      taskStatusId
    )
  },

  removeTaskStatusFromProduction({ commit, state }, taskStatusId) {
    commit(PRODUCTION_REMOVE_TASK_STATUS, taskStatusId)
    return productionsApi.removeTaskStatusFromProduction(
      state.currentProduction.id,
      taskStatusId
    )
  },

  addStatusAutomationToProduction({ commit, state }, statusAutomationId) {
    commit(PRODUCTION_ADD_STATUS_AUTOMATION, statusAutomationId)
    return productionsApi.addStatusAutomationToProduction(
      state.currentProduction.id,
      statusAutomationId
    )
  },

  removeStatusAutomationFromProduction({ commit, state }, statusAutomationId) {
    commit(PRODUCTION_REMOVE_STATUS_AUTOMATION, statusAutomationId)
    return productionsApi.removeStatusAutomationFromProduction(
      state.currentProduction.id,
      statusAutomationId
    )
  },

  addMetadataDescriptor({ commit, state }, descriptor) {
    if (descriptor.id) {
      const previousDescriptorFieldName =
        state.currentProduction.descriptors.find(
          d => d.id === descriptor.id
        ).field_name
      return productionsApi
        .updateMetadataDescriptor(state.currentProduction.id, descriptor)
        .then(descriptor => {
          commit(UPDATE_METADATA_DESCRIPTOR_END, {
            production: state.currentProduction,
            previousDescriptorFieldName,
            descriptor
          })
        })
    } else {
      return productionsApi.addMetadataDescriptor(
        state.currentProduction.id,
        descriptor
      )
    }
  },

  deleteMetadataDescriptor({ commit, state }, descriptorId) {
    return productionsApi
      .deleteMetadataDescriptor(state.currentProduction.id, descriptorId)
      .then(() => {
        commit(DELETE_METADATA_DESCRIPTOR_END, { id: descriptorId })
      })
  },

  refreshMetadataDescriptor({ commit, state }, descriptorId) {
    return productionsApi
      .getMetadataDescriptor(state.currentProduction.id, descriptorId)
      .then(descriptor => {
        const descriptorMap = new Map()
        state.openProductions.forEach(production => {
          if (!production.descriptors) Vue.set(production, 'descriptors', [])
          production.descriptors.forEach(desc => {
            descriptorMap.set(desc.id, desc)
          })
        })
        if (!descriptorMap.get(descriptor.id)) {
          commit(ADD_METADATA_DESCRIPTOR_END, {
            production: state.productionMap.get(descriptor.project_id),
            descriptor
          })
        } else {
          commit(UPDATE_METADATA_DESCRIPTOR_END, {
            production: state.productionMap.get(descriptor.project_id),
            descriptor
          })
        }
      })
  },

  async addBackgroundToProduction({ commit, state }, backgroundId) {
    await productionsApi.addBackgroundToProduction(
      state.currentProduction.id,
      backgroundId
    )
    commit(PRODUCTION_ADD_BACKGROUND, backgroundId)
  },

  async removeBackgroundFromProduction({ commit, state }, backgroundId) {
    try {
      await productionsApi.removeBackgroundFromProduction(
        state.currentProduction.id,
        backgroundId
      )
      commit(PRODUCTION_REMOVE_BACKGROUND, backgroundId)
    } catch (err) {
      console.error(err)
    }
  },

  async setDefaultBackgroundToProduction({ commit, state }, backgroundId) {
    try {
      await productionsApi.setDefaultBackgroundToProduction(
        state.currentProduction.id,
        backgroundId
      )
      commit(PRODUCTION_UPDATE_DEFAULT_BACKGROUND, backgroundId)
    } catch (err) {
      console.error(err)
    }
  }
}

const mutations = {
  [LOAD_PRODUCTIONS_START](state) {
    state.productions = []
    state.isProductionsLoading = true
    state.isProductionsLoadingError = false
  },

  [LOAD_PRODUCTIONS_ERROR](state) {
    state.productions = []
    state.isProductionsLoading = false
    state.isProductionsLoadingError = true
  },

  [LOAD_PRODUCTIONS_END](state, productions) {
    state.isProductionsLoading = false
    state.isProductionsLoadingError = false
    state.productions = sortProductions(productions)

    const productionMap = new Map()
    const addProductionToMap = production => {
      if (!productionMap.get(production.id)) {
        productionMap.set(production.id, production)
      }
    }
    state.openProductions.forEach(addProductionToMap)
    state.productions.forEach(addProductionToMap)
    state.productionMap = productionMap
  },

  [LOAD_OPEN_PRODUCTIONS_START](state) {
    state.isOpenProductionsLoading = true
    state.openProductions = []
  },
  [LOAD_OPEN_PRODUCTIONS_ERROR](state) {
    state.isOpenProductionsLoading = false
  },
  [LOAD_OPEN_PRODUCTIONS_END](state, productions) {
    state.isOpenProductionsLoading = false
    state.openProductions = sortByName(productions)

    const productionMap = new Map()
    productions.forEach(production => {
      productionMap.set(production.id, production)
    })
    state.productionMap = productionMap

    if (!state.currentProduction && state.openProductions.length > 0) {
      state.currentProduction = state.openProductions[0]
    }
  },

  [LOAD_PRODUCTION_STATUS_START](state) {
    state.productionStatus = []
  },
  [LOAD_PRODUCTION_STATUS_ERROR](state) {},
  [LOAD_PRODUCTION_STATUS_END](state, productionStatus) {
    const productionStatusMap = new Map()
    productionStatus.forEach(status => {
      productionStatusMap.set(status.id, status)
    })
    state.productionStatus = productionStatus
    state.productionStatusMap = productionStatusMap
  },

  [ADD_PRODUCTION](state, production) {
    const productionStatus = state.productionStatusMap.get(
      production.project_status_id
    )
    production.project_status_name = productionStatus.name
    state.productions.push(production)
    state.productionMap.set(production.id, production)
    state.productionMap = new Map(state.productionMap) // for reactivity
    state.openProductions.push(production)
    state.productions = sortProductions(state.productions)
    state.openProductions = sortByName(state.openProductions)
  },

  [UPDATE_PRODUCTION](state, production) {
    const previousProduction = state.productions.find(
      ({ id }) => id === production.id
    )
    const openProduction = state.openProductions.find(
      ({ id }) => id === production.id
    )
    const productionStatus = state.productionStatusMap.get(
      production.project_status_id
    )

    // status changed
    const isStatusChanged =
      previousProduction &&
      previousProduction.project_status_id !== productionStatus.id
    production.project_status_name = productionStatus.name

    // update states
    if (previousProduction) {
      Object.assign(previousProduction, production)
      Object.assign(production, previousProduction)
    }
    if (openProduction) {
      Object.assign(openProduction, production)
      Object.assign(production, openProduction)
    }
    if (isStatusChanged) {
      if (production.project_status_name === 'Open') {
        state.openProductions.push(previousProduction)
      } else {
        state.openProductions = removeModelFromList(
          state.openProductions,
          previousProduction
        )
      }
    }
    state.productionMap.set(production.id, production)
    state.productionMap = new Map(state.productionMap) // for reactivity
    state.productions = sortProductions(state.productions)
    state.openProductions = sortByName(state.openProductions)
  },

  [REMOVE_PRODUCTION](state, productionToDelete) {
    state.productions = removeModelFromList(
      state.productions,
      productionToDelete
    )
    state.openProductions = removeModelFromList(
      state.openProductions,
      productionToDelete
    )
    state.productionMap.delete(productionToDelete.id)
  },

  [PRODUCTION_PICTURE_FILE_SELECTED](state, formData) {
    state.productionAvatarFormData = formData
  },

  [PRODUCTION_AVATAR_UPLOADED](state, productionId) {
    const production = state.productionMap.get(productionId)
    if (production) production.has_avatar = true
  },

  [SET_CURRENT_PRODUCTION](state, productionId) {
    const production = state.productionMap.get(productionId)
    state.currentProduction = production
  },

  [RESET_PRODUCTION_PATH](state, { productionId, episodeId }) {
    state.assetsPath = helpers.getProductionComponentPath(
      'assets',
      productionId,
      episodeId
    )
    state.assetTypesPath = helpers.getProductionComponentPath(
      'production-asset-types',
      productionId,
      episodeId
    )
    state.shotsPath = helpers.getProductionComponentPath(
      'shots',
      productionId,
      episodeId
    )
    state.editsPath = helpers.getProductionComponentPath(
      'edits',
      productionId,
      episodeId
    )
    state.episodesPath = helpers.getProductionComponentPath(
      'episodes',
      productionId
    )
    state.sequencesPath = helpers.getProductionComponentPath(
      'sequences',
      productionId,
      episodeId
    )
    state.sequenceStatsPath = helpers.getProductionComponentPath(
      'sequence-stats',
      productionId,
      episodeId
    )
    state.episodeStatsPath = helpers.getProductionComponentPath(
      'episode-stats',
      productionId
    )
    state.breakdownPath = helpers.getProductionComponentPath(
      'breakdown',
      productionId,
      episodeId
    )
    state.playlistsPath = helpers.getProductionComponentPath(
      'playlists',
      productionId,
      episodeId
    )
    state.teamPath = helpers.getProductionComponentPath('team', productionId)
  },

  [TEAM_ADD_PERSON](state, personId) {
    addToIdList(state.currentProduction, 'team', personId)
  },

  [TEAM_REMOVE_PERSON](state, personId) {
    removeFromIdList(state.currentProduction, 'team', personId)
  },

  [PRODUCTION_ADD_ASSET_TYPE](state, assetTypeId) {
    addToIdList(state.currentProduction, 'asset_types', assetTypeId)
  },

  [PRODUCTION_REMOVE_ASSET_TYPE](state, assetTypeId) {
    removeFromIdList(state.currentProduction, 'asset_types', assetTypeId)
  },

  [PRODUCTION_ADD_BACKGROUND](state, backgroundId) {
    addToIdList(
      state.currentProduction,
      'preview_background_files',
      backgroundId
    )
  },

  [PRODUCTION_REMOVE_BACKGROUND](state, backgroundId) {
    removeFromIdList(
      state.currentProduction,
      'preview_background_files',
      backgroundId
    )
  },

  [PRODUCTION_UPDATE_DEFAULT_BACKGROUND](state, backgroundId) {
    state.currentProduction.default_preview_background_file_id = backgroundId
  },

  [PRODUCTION_ADD_TASK_STATUS](state, taskStatusId) {
    addToIdList(state.currentProduction, 'task_statuses', taskStatusId)
  },

  [PRODUCTION_REMOVE_TASK_STATUS](state, taskStatusId) {
    removeFromIdList(state.currentProduction, 'task_statuses', taskStatusId)
  },

  [PRODUCTION_ADD_TASK_TYPE](state, taskTypeId) {
    addToIdList(state.currentProduction, 'task_types', taskTypeId)
  },

  [PRODUCTION_REMOVE_TASK_TYPE](state, taskTypeId) {
    removeFromIdList(state.currentProduction, 'task_types', taskTypeId)
  },

  [PRODUCTION_ADD_STATUS_AUTOMATION](state, statusAutomationId) {
    addToIdList(
      state.currentProduction,
      'status_automations',
      statusAutomationId
    )
  },

  [PRODUCTION_REMOVE_STATUS_AUTOMATION](state, statusAutomationId) {
    removeFromIdList(
      state.currentProduction,
      'status_automations',
      statusAutomationId
    )
  },

  [ADD_METADATA_DESCRIPTOR_END](state, { production, descriptor }) {
    if (production) {
      if (production.descriptors) {
        production.descriptors.push(descriptor)
      } else {
        Vue.set(production, 'descriptors', [descriptor])
      }
    }
  },

  [UPDATE_METADATA_DESCRIPTOR_END](state, { production, descriptor }) {
    if (production) {
      if (production.descriptors) {
        updateModelFromList(production.descriptors, descriptor)
      } else {
        Vue.set(production, 'descriptors', [])
      }
    }
  },

  [DELETE_METADATA_DESCRIPTOR_END](state, descriptor) {
    const production = state.openProductions.find(production => {
      return production.descriptors.find(d => d.id === descriptor.id)
    })

    if (production) {
      production.descriptors = removeModelFromList(
        production.descriptors,
        descriptor
      )
    }
  },

  [ASSIGN_TASKS](state, { personId }) {
    const isTeamMember =
      state.currentProduction &&
      state.currentProduction.team.some(pId => pId === personId)
    if (!isTeamMember && state.currentProduction) {
      state.currentProduction.team.push(personId)
    }
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  helpers
}

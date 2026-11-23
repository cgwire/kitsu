import { hasDataValue } from '@/lib/descriptors'
import { isNotFound } from '@/lib/errors'
import {
  addToIdList,
  removeFromIdList,
  removeModelFromList,
  updateModelFromList
} from '@/lib/models'
import { sortByName, sortProductions } from '@/lib/sorting'
import assetsApi from '@/store/api/assets'
import playlistsApi from '@/store/api/playlists'
import productionsApi from '@/store/api/productions'
import shotsApi from '@/store/api/shots'
import assetTypeStore from '@/store/modules/assettypes'
import statusAutomationsStore from '@/store/modules/statusautomation'
import taskStatusStore from '@/store/modules/taskstatus'
import taskTypeStore from '@/store/modules/tasktypes'

import {
  LOAD_PRODUCTIONS_START,
  LOAD_PRODUCTIONS_ERROR,
  LOAD_PRODUCTIONS_END,
  LOAD_OPEN_PRODUCTIONS_END,
  LOAD_PRODUCTION_STATUS_START,
  LOAD_PRODUCTION_STATUS_ERROR,
  LOAD_PRODUCTION_STATUS_END,
  ADD_PRODUCTION,
  UPDATE_PRODUCTION,
  REMOVE_PRODUCTION,
  SET_CURRENT_PRODUCTION,
  PRODUCTION_PICTURE_FILE_SELECTED,
  PRODUCTION_AVATAR_UPLOADED,
  TEAM_ADD_PERSON,
  TEAM_REMOVE_PERSON,
  TEAM_ROLES_LOADED,
  TEAM_MEMBER_ROLE_UPDATED,
  SET_USER_PROJECT_ROLE,
  PRODUCTION_ADD_ASSET_TYPE,
  PRODUCTION_REMOVE_ASSET_TYPE,
  PRODUCTION_SET_ASSET_TYPE_WORKFLOW,
  PRODUCTION_ADD_BACKGROUND,
  PRODUCTION_REMOVE_BACKGROUND,
  PRODUCTION_UPDATE_DEFAULT_BACKGROUND,
  PRODUCTION_ADD_TASK_TYPE,
  PRODUCTION_SET_TASK_STATUS_LINK,
  PRODUCTION_SET_TASK_TYPE_LINK,
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
  CLEAR_EDITS,
  SAVE_LAST_PRODUCTION_ROUTE,
  SET_PRODUCTION_ACCESS_ERROR,
  RESET_ALL
} from '@/store/mutation-types'

const taskTypesCache = taskTypeStore.cache
const taskStatusCache = taskStatusStore.cache

// The user context lists the productions of this status only, though some
// zou routes also count Active and open: the open ones stay those a reload
// shows.
const OPEN_STATUS_NAME = 'Open'

const initialState = {
  productions: [],
  productionMap: new Map(),
  openProductions: [],
  productionStatus: [],
  productionStatusMap: new Map(),
  currentProduction: null,
  // productionId -> personId -> explicit project role, null or absent means
  // the person inherits their global role
  teamRoles: {},
  productionAvatarFormData: null,

  isProductionsLoading: false,
  isProductionsLoadingError: false,

  lastProductionRoute: { name: 'open-productions' },
  // Why a production page sent the user to the home page, which tells it
  // once: { reason: 'forbidden', 'missing' or 'failed', path: of that page }.
  productionAccessError: null
}

const state = { ...initialState }

const helpers = {
  // Route of a production section, following the current production and
  // episode so the back links never point to a scope left behind.
  getSectionPath(getters, rootGetters, routeName, episodic = true) {
    const episodeId =
      episodic && getters.isTVShow ? rootGetters.currentEpisode?.id : undefined
    return helpers.getProductionComponentPath(
      routeName,
      getters.currentProduction?.id,
      episodeId
    )
  },

  getProductionComponentPath(routeName, productionId, episodeId) {
    let route = { name: 'open-productions' }
    if (episodeId) {
      route = {
        name: `episode-${routeName}`,
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
    const descriptors = state.currentProduction.descriptors.filter(
      d => d.entity_type === entityType
    )
    return descriptors.sort((a, b) => {
      const positionA = a.position ?? 1000
      const positionB = b.position ?? 1000
      if (positionA !== positionB) {
        return positionA - positionB
      } else {
        const nameA = a.name || ''
        const nameB = b.name || ''
        return nameA.localeCompare(nameB)
      }
    })
  }
}

// A read of the production serves its status name, an edit does not: the
// name stored for the same status stays, else the map gives it. The context
// loads the statuses once: one created later through the API is missing
// from the map.
const setProductionStatusName = (state, production) => {
  const stored = state.productionMap.get(production.id)
  const storedName =
    stored?.project_status_id === production.project_status_id
      ? stored.project_status_name
      : undefined
  production.project_status_name ??=
    storedName ??
    state.productionStatusMap.get(production.project_status_id)?.name
}

/**
 * The same project often exists as multiple object references (e.g. open list
 * vs all productions). Metadata must be updated on every copy.
 */
const forEachProductionAlias = (state, productionId, fn, primary = null) => {
  if (!productionId) {
    return
  }
  const seen = new Set()
  const run = p => {
    if (!p || p.id !== productionId || seen.has(p)) {
      return
    }
    seen.add(p)
    fn(p)
  }
  run(primary)
  run(state.productionMap?.get(productionId))
  state.productions?.forEach(p => run(p))
  state.openProductions?.forEach(p => run(p))
}

const forEachProductionObjectInState = (state, fn) => {
  const seen = new Set()
  const run = p => {
    if (!p || seen.has(p)) {
      return
    }
    seen.add(p)
    fn(p)
  }
  state.productions?.forEach(run)
  state.openProductions?.forEach(run)
  state.productionMap?.forEach(run)
}

const findProductionInState = (state, id) => {
  if (!id) return null
  return (
    state.productionMap?.get(id) ||
    state.productions?.find(p => p.id === id) ||
    state.openProductions?.find(p => p.id === id) ||
    null
  )
}

const isDescriptorOfAnotherProduction = (state, productionId, descriptorId) => {
  let isListed = false
  forEachProductionObjectInState(state, p => {
    if (
      p.id !== productionId &&
      p.descriptors?.some(d => d.id === descriptorId)
    ) {
      isListed = true
    }
  })
  return isListed
}

// The fields of a column the pages read: a read of a column gives its dates
// too, which the columns of the context lack.
const DESCRIPTOR_FIELDS = [
  'name',
  'field_name',
  'data_type',
  'choices',
  'for_client',
  'entity_type',
  'task_type_id',
  'position',
  'departments'
]

const isSameDescriptor = (known, listed) =>
  DESCRIPTOR_FIELDS.every(
    key => JSON.stringify(known[key]) === JSON.stringify(listed[key])
  )

// The values of a column live under its field name in the data of the
// entities of its type, of its task type for a task column, or of the
// production for a Project column.
const isSameValueSpace = (descriptor, other) =>
  descriptor.entity_type === other.entity_type &&
  (descriptor.task_type_id ?? null) === (other.task_type_id ?? null)

// A rename moves the values of a column to its new field name, over any
// value found there: a column moves once no other one still holds its new
// field name, and a cycle of renames, a swap for instance, goes through a
// temporary field name.
const orderDescriptorUpdates = updates => {
  const steps = []
  let pending = updates.map(update => ({
    ...update,
    fieldName: update.previous.field_name
  }))
  const isHeldByAnother = (update, fieldName) =>
    pending.some(
      other =>
        other !== update &&
        isSameValueSpace(other.descriptor, update.descriptor) &&
        other.fieldName === fieldName
    )
  while (pending.length > 0) {
    const ready = pending.find(
      update => !isHeldByAnother(update, update.descriptor.field_name)
    )
    if (ready) {
      steps.push({
        descriptor: ready.descriptor,
        previousFieldName: ready.fieldName
      })
      pending = pending.filter(update => update !== ready)
    } else {
      // Each column left waits for another one: one of them steps aside.
      const moved = pending.find(update =>
        pending.some(
          other =>
            other !== update &&
            isSameValueSpace(other.descriptor, update.descriptor) &&
            other.descriptor.field_name === update.fieldName
        )
      )
      const temporaryFieldName = `${moved.descriptor.id}:${moved.fieldName}`
      steps.push({
        descriptor: {
          ...moved.previous,
          project_id: moved.descriptor.project_id,
          field_name: temporaryFieldName
        },
        previousFieldName: moved.fieldName
      })
      moved.fieldName = temporaryFieldName
    }
  }
  return steps
}

const isFieldNameOfAnother = (descriptors, descriptor, fieldName) =>
  descriptors.some(
    other =>
      other.id !== descriptor.id &&
      isSameValueSpace(other, descriptor) &&
      other.field_name === fieldName
  )

// Passes on, as the column events would have, the changes between the
// columns the store holds for given production and those Zou lists for it.
// The lists of a production load again once it is on screen, their values
// in place: they follow a rename or a deletion only when they hold values
// loaded before it (moveListValues).
const syncProductionDescriptors = (
  commit,
  production,
  listedDescriptors,
  moveListValues
) => {
  // Copies: the updates change the columns in place.
  const known = (production.descriptors || []).map(descriptor => ({
    ...descriptor
  }))
  known
    .filter(descriptor => !listedDescriptors.some(d => d.id === descriptor.id))
    .forEach(descriptor => {
      commit(DELETE_METADATA_DESCRIPTOR_END, {
        id: descriptor.id,
        descriptor: moveListValues
          ? { ...descriptor, project_id: production.id }
          : undefined
      })
    })
  const changes = listedDescriptors.map(listed => ({
    previous: known.find(d => d.id === listed.id),
    descriptor: { ...listed, project_id: production.id }
  }))
  const updates = changes.filter(
    ({ previous, descriptor }) =>
      previous && !isSameDescriptor(previous, descriptor)
  )
  orderDescriptorUpdates(updates).forEach(
    ({ descriptor, previousFieldName }) => {
      commit(UPDATE_METADATA_DESCRIPTOR_END, {
        production,
        previousDescriptorFieldName: moveListValues
          ? previousFieldName
          : undefined,
        descriptor
      })
    }
  )
  // A list loaded during the drop already holds the values Zou moved, and
  // nothing tells which lists were: in every list, the values of a column
  // renamed to the field name another column held, or whose field name
  // another column took, may have moved twice, and are cleared. The values
  // of a deleted column go, those of a column created since on its field
  // name included.
  if (moveListValues) {
    updates
      .filter(
        ({ previous, descriptor }) =>
          previous.field_name !== descriptor.field_name &&
          (isFieldNameOfAnother(known, descriptor, descriptor.field_name) ||
            isFieldNameOfAnother(
              listedDescriptors,
              descriptor,
              previous.field_name
            ))
      )
      .forEach(({ previous, descriptor }) => {
        ;[previous.field_name, descriptor.field_name].forEach(fieldName => {
          // Without an id, a deletion removes no column: the lists drop the
          // values under the field name.
          commit(DELETE_METADATA_DESCRIPTOR_END, {
            descriptor: { ...descriptor, field_name: fieldName }
          })
        })
      })
  }
  changes
    .filter(({ previous }) => !previous)
    .forEach(({ descriptor }) => {
      commit(ADD_METADATA_DESCRIPTOR_END, { production, descriptor })
    })
}

/** Convert a stored Project descriptor to the form shape the metadata API expects. */
const projectDescriptorToForm = descriptor => ({
  name: descriptor.name,
  data_type: descriptor.data_type,
  values: descriptor.choices,
  for_client: descriptor.for_client,
  departments: descriptor.departments,
  entity_type: 'Project'
})

// In-flight Project descriptor creations keyed by production + field, so the
// per-keystroke metadata-changed events can't create duplicate descriptors.
const pendingProjectDescriptorCreations = new Map()

// The productions whose columns may have changed since they were read: they
// read them again once on screen, and before a save of the values of their
// Project columns.
const staleDescriptorProductionIds = new Set()

// The production on screen when the socket comes back: its lists may hold
// values loaded before the drop, which the next read of its columns moves.
const outdatedListProductionIds = new Set()

// The column events and the reads of the columns of a production take their
// numbers in one sequence. A read of the columns of a production that one
// of its events overtook is made again, and the calls made during a read
// wait for it. The read of a single column is dropped after a later event
// on that column, or once a later read of the columns of its production is
// applied.
let lastDescriptorNumber = 0
const descriptorEventNumbers = new Map()
const productionDescriptorEventNumbers = new Map()
const appliedDescriptorReadNumbers = new Map()
const pendingDescriptorReads = new Map()

const numberDescriptorEvent = (productionId, descriptorId) => {
  const eventNumber = ++lastDescriptorNumber
  productionDescriptorEventNumbers.set(productionId, eventNumber)
  if (descriptorId) {
    descriptorEventNumbers.set(descriptorId, eventNumber)
  }
  return eventNumber
}

const hasDescriptorEventSince = (productionId, number) =>
  (productionDescriptorEventNumbers.get(productionId) ?? 0) > number

// A listing may predate an answer the store took during its request for one
// production alone, a save or a read, or the answer of a save still running:
// that production keeps its entry, and reads its columns again before its
// next save. Saves that all fail bring no answer: the production then takes
// the last listing that held it while they ran, unless it took an answer of
// its own since that listing went out.
const productionSaveCounts = new Map()
const productionAnswerNumbers = new Map()
const listingsDuringSaves = new Map()

const isSavedOrReadSince = (productionId, number) =>
  productionSaveCounts.has(productionId) ||
  (productionAnswerNumbers.get(productionId) ?? 0) > number

const listedDescriptors = (known, production) =>
  known.descriptors && production.descriptors
    ? [
        ...known.descriptors.filter(d => d.entity_type !== 'Project'),
        ...production.descriptors.filter(d => d.entity_type === 'Project')
      ]
    : known.descriptors || production.descriptors

const takeListingOfFailedSaves = (commit, state, productionId) => {
  const listing = listingsDuringSaves.get(productionId)
  listingsDuringSaves.delete(productionId)
  const known = state.productionMap.get(productionId)
  if (listing && known && !isSavedOrReadSince(productionId, listing.number)) {
    commit(UPDATE_PRODUCTION, {
      ...listing.production,
      descriptors: listedDescriptors(known, listing.production)
    })
    // Its columns may have been read since that listing.
    staleDescriptorProductionIds.add(productionId)
  }
}

// Someone else may have changed the role of the user in the production: a
// project update announces it, and a page listing the team reads it again in
// case the socket missed that update.
const loadTeamWithUserRole = async (commit, rootState, productionId) => {
  const team = await productionsApi.getTeam(productionId)
  commit(TEAM_ROLES_LOADED, { productionId, team })
  const userId = rootState.user.user?.id
  const member = team.find(person => person.id === userId)
  commit(SET_USER_PROJECT_ROLE, {
    projectId: productionId,
    role: member?.project_role ?? null
  })
  return team
}

const getters = {
  productions: state => state.productions,
  productionMap: state => state.productionMap,
  productionStatusMap: state => state.productionStatusMap,
  openProductions: state => state.openProductions,
  productionStatus: state => state.productionStatus,

  productionTeamRoles: state =>
    state.teamRoles[state.currentProduction?.id] || {},
  teamRolesForProduction: state => productionId =>
    state.teamRoles[productionId] || {},

  productionAvatarFormData: state => state.productionAvatarFormData,

  isProductionsLoading: state => state.isProductionsLoading,
  isProductionsLoadingError: state => state.isProductionsLoadingError,

  assetsPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'assets'),
  assetTypesPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'production-asset-types'),
  shotsPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'shots'),
  sequencesPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'sequences'),
  sequenceStatsPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'sequence-stats'),
  editsPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'edits'),
  episodesPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'episodes', false),
  episodeStatsPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'episode-stats', false),
  breakdownPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'breakdown'),
  playlistsPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'playlists'),
  teamPath: (state, getters, rootState, rootGetters) =>
    helpers.getSectionPath(getters, rootGetters, 'team', false),

  lastProductionRoute: state => state.lastProductionRoute,
  productionAccessError: state => state.productionAccessError,

  productionAssetTypes: (state, getters, rootState) => {
    if (!state.currentProduction) return []
    if (helpers.isEmptyArray(state.currentProduction, 'asset_types')) {
      return rootState.assetTypes.assetTypes
    } else {
      return sortByName(
        state.currentProduction.asset_types
          .map(id => assetTypeStore.cache.assetTypeMap.get(id))
          .filter(Boolean)
      )
    }
  },

  // The production workflow of an asset type when it has one, else the studio
  // one. An empty list means all the asset task types are accepted.
  getAssetTypeWorkflow: state => assetTypeId => {
    const workflow =
      state.currentProduction?.asset_type_workflows?.[assetTypeId]
    return workflow?.length
      ? workflow
      : assetTypeStore.cache.assetTypeMap.get(assetTypeId)?.task_types || []
  },

  isInAssetTypeWorkflow: (state, getters) => (assetTypeId, taskTypeId) => {
    const workflow = getters.getAssetTypeWorkflow(assetTypeId)
    return !workflow.length || workflow.includes(taskTypeId)
  },

  productionBackgrounds: (state, getters) => {
    return getters.getProductionBackgrounds(state.currentProduction?.id)
  },

  getProductionBackgrounds: (state, getters, rootState) => id => {
    const ids = state.productionMap.get(id)?.preview_background_files || []
    return rootState.backgrounds.backgrounds.filter(background =>
      ids.includes(background.id)
    )
  },

  productionTaskStatuses: (state, getters, rootState) => {
    if (helpers.isEmptyArray(state.currentProduction, 'task_statuses')) {
      return rootState.taskStatus.taskStatuses
    } else {
      return sortByName(
        state.currentProduction.task_statuses
          .map(id => taskStatusCache.taskStatusMap.get(id))
          .filter(Boolean)
      )
    }
  },

  getProductionTaskStatuses: (state, getters, rootState) => id => {
    const production = state.productionMap.get(id)
    if (helpers.isEmptyArray(production, 'task_statuses')) {
      return rootState.taskStatus.taskStatuses
    } else {
      return sortByName(
        production.task_statuses
          .map(id => taskStatusCache.taskStatusMap.get(id))
          .filter(Boolean)
      )
    }
  },

  productionStatusAutomations: (state, getters, rootState) => {
    if (helpers.isEmptyArray(state.currentProduction, 'status_automations')) {
      return []
    } else {
      return state.currentProduction.status_automations
        .map(id => statusAutomationsStore.cache.statusAutomationMap.get(id))
        .filter(Boolean)
    }
  },

  productionTaskTypes: (state, getters, rootState) => {
    if (helpers.isEmptyArray(state.currentProduction, 'task_types')) {
      return rootState.taskTypes.taskTypes
    } else {
      return sortByName(
        state.currentProduction.task_types
          .map(id => taskTypesCache.taskTypeMap.get(id))
          .filter(Boolean)
      )
    }
  },

  getProductionTaskTypes: (state, getters, rootState) => id => {
    const production = state.productionMap.get(id)
    if (helpers.isEmptyArray(production, 'task_types')) {
      return rootState.taskTypes.taskTypes
    } else {
      return sortByName(
        production.task_types
          .map(id => taskTypesCache.taskTypeMap.get(id))
          .filter(Boolean)
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
  taskMetadataDescriptors: entityMetadataDescriptors('Task'),

  /**
   * Union of all Project-entity metadata descriptors (field definitions) that
   * appear in any project on the all-projects list. Used for the productions
   * table columns.
   */
  mergedProjectMetadataDescriptors: state => {
    const byField = new Map()
    forEachProductionObjectInState(state, p => {
      ;(p.descriptors || [])
        .filter(d => d.entity_type === 'Project')
        .forEach(d => {
          // Prefer a positioned copy: backfilled copies have position=null
          // and must not shadow the ones carrying the saved column order.
          const existing = byField.get(d.field_name)
          if (!existing || (existing.position == null && d.position != null)) {
            byField.set(d.field_name, { ...d })
          }
        })
    })
    return Array.from(byField.values()).sort((a, b) => {
      const positionA = a.position ?? 1000
      const positionB = b.position ?? 1000
      if (positionA !== positionB) {
        return positionA - positionB
      }
      const nameA = a.name || ''
      const nameB = b.name || ''
      return nameA.localeCompare(nameB)
    })
  },

  // Only an explicit false hides: null or a missing flag means visible.
  getClientAccess: (state, getters, rootState, rootGetters) => id => {
    const production = state.productionMap.get(id)
    const isClient = rootGetters.isCurrentUserClient
    const isOn = flag => !isClient || production?.[flag] !== false
    return {
      isStatsVisible: isOn('is_client_stats_visible'),
      isTaskListVisible: isOn('is_client_task_list_visible'),
      isTaskPanelVisible: isOn('is_client_task_panel_visible'),
      isTaskTypeVisible: taskTypeId =>
        !isClient ||
        production?.task_type_links?.[taskTypeId]?.is_client_visible !== false
    }
  },

  clientAccess: (state, getters) =>
    getters.getClientAccess(getters.currentProduction?.id),

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

  isPaperProduction: state => {
    const production = getters.currentProduction(state)
    return production && production.production_style === '2dpaper'
  },

  productionDepartmentIds: (state, getters) => {
    const departmentIds = {}
    return getters.productionTaskTypes.reduce((acc, type) => {
      if (type?.department_id && !departmentIds[type.department_id]) {
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
  // The client home: the entities with their tasks and the latest playlists
  // of a production, left out of the page caches.
  async loadProductionOverview(context, production) {
    const { production_type: productionType } = production
    const [shots, assets, episodes, playlists] = await Promise.all([
      productionType === 'assets' ? [] : shotsApi.getShots(production),
      productionType === 'shots'
        ? []
        : assetsApi.getAssets(production, null, true),
      productionType === 'tvshow' ? shotsApi.getEpisodes(production) : [],
      playlistsApi.getPlaylists(production, null, null, 'updated_at', 1)
    ])
    // Zou types the shots but not the assets.
    const typedAssets = assets.map(asset => ({ ...asset, type: 'Asset' }))
    return { entities: [...shots, ...typedAssets], episodes, playlists }
  },

  async loadProductionStatus({ commit }) {
    commit(LOAD_PRODUCTION_STATUS_START)
    try {
      const productionStatus = await productionsApi.getProductionStatus()
      commit(LOAD_PRODUCTION_STATUS_END, productionStatus)
    } catch (err) {
      commit(LOAD_PRODUCTION_STATUS_ERROR)
    }
  },

  // A quiet listing, after a change made elsewhere, keeps the rows shown
  // until its answer, and through its failure.
  async loadProductions({ commit, state }, { isQuiet = false } = {}) {
    if (!isQuiet) {
      commit(LOAD_PRODUCTIONS_START)
    }
    const listingNumber = ++lastDescriptorNumber
    try {
      const listed = await productionsApi.getProductions()
      const keptIds = new Set(
        listed
          .filter(({ id }) => isSavedOrReadSince(id, listingNumber))
          .map(({ id }) => id)
      )
      commit(
        LOAD_PRODUCTIONS_END,
        listed.map(production =>
          keptIds.has(production.id)
            ? findProductionInState(state, production.id) || production
            : production
        )
      )
      // The listing may predate a column event received meanwhile.
      listed
        .filter(
          ({ id }) =>
            keptIds.has(id) || hasDescriptorEventSince(id, listingNumber)
        )
        .forEach(({ id }) => staleDescriptorProductionIds.add(id))
      listed
        .filter(({ id }) => productionSaveCounts.has(id))
        .forEach(production => {
          listingsDuringSaves.set(production.id, {
            production,
            number: listingNumber
          })
        })
    } catch (err) {
      if (isQuiet) {
        throw err
      }
      commit(LOAD_PRODUCTIONS_ERROR)
    }
  },

  loadProduction({ commit, state }, productionId) {
    return productionsApi.getProduction(productionId).then(production => {
      productionAnswerNumbers.set(production.id, ++lastDescriptorNumber)
      if (state.productionMap.get(production.id)) {
        commit(UPDATE_PRODUCTION, production)
      } else {
        commit(ADD_PRODUCTION, production)
      }
    })
  },

  // Zou announces the update of a production to every user. One the store
  // misses joins it once the user enters its team or it reopens: the
  // listing tells, where a read would refuse the users out of its team.
  async loadProductionIfOpen({ dispatch, state }, productionId) {
    const listed = await productionsApi.getListedProduction(productionId)
    const status = state.productionStatusMap.get(listed?.project_status_id)
    if (status?.name === OPEN_STATUS_NAME) {
      await dispatch('loadProduction', productionId)
    }
  },

  // Zou announces a new production to every user, and refuses its read to
  // those out of its team. Anyone but an admin looks for it first among the
  // productions of their teams, closed ones included: getListedProduction
  // holds their open ones only.
  async loadProductionIfShared({ dispatch, rootGetters }, productionId) {
    if (!rootGetters.isCurrentUserAdmin) {
      const productions = await productionsApi.getProductions()
      if (!productions.some(({ id }) => id === productionId)) return
    }
    await dispatch('loadProduction', productionId)
  },

  async newProduction({ commit }, data) {
    // Zou copies the all-projects metadata columns (Project descriptors)
    // onto the new production at creation, no client-side copy needed.
    const production = await productionsApi.newProduction(data)
    commit(ADD_PRODUCTION, production)
    return production
  },

  async editProduction({ commit, dispatch, state }, data) {
    // The metadata bag (`data.data`) is a JSONB column replaced wholesale by
    // the API, so we merge it with the locally cached values to avoid losing
    // the other fields. A rename made elsewhere moved some of them: the
    // columns of a stale production are read first.
    const payload = { ...data }
    if (data.data) {
      if (staleDescriptorProductionIds.has(data.id)) {
        await dispatch('syncMetadataDescriptors', { productionId: data.id })
      }
      const previous = findProductionInState(state, data.id)
      payload.data = { ...(previous?.data || {}), ...data.data }
    }
    productionSaveCounts.set(
      data.id,
      (productionSaveCounts.get(data.id) ?? 0) + 1
    )
    try {
      const production = await productionsApi.updateProduction(payload)
      productionAnswerNumbers.set(data.id, ++lastDescriptorNumber)
      commit(UPDATE_PRODUCTION, production)
    } finally {
      const count = productionSaveCounts.get(data.id) - 1
      if (count > 0) {
        productionSaveCounts.set(data.id, count)
      } else {
        productionSaveCounts.delete(data.id)
        takeListingOfFailedSaves(commit, state, data.id)
      }
    }
  },

  deleteProduction({ commit, state }, production) {
    return productionsApi.deleteProduction(production).then(() => {
      commit(REMOVE_PRODUCTION, production)
    })
  },

  setProduction({ commit }, productionId) {
    // The lists of the production load again.
    outdatedListProductionIds.clear()
    commit(SET_CURRENT_PRODUCTION, productionId)
    commit(CLEAR_ASSETS)
    commit(CLEAR_SHOTS)
    commit(CLEAR_EDITS)
  },

  storeProductionPicture({ commit }, formData) {
    commit(PRODUCTION_PICTURE_FILE_SELECTED, formData)
  },

  async uploadProductionAvatar({ commit, state }, productionId) {
    await productionsApi.postAvatar(
      productionId,
      state.productionAvatarFormData
    )
    commit(PRODUCTION_AVATAR_UPLOADED, productionId)
  },

  // The team changes at once in the list, and changes back if Zou refuses,
  // in its own production even when the user opened another one meanwhile.
  async addPersonToTeam({ commit, state }, person) {
    const production = state.currentProduction
    // An import also adds the people already in the team: they stay.
    const isMember = production.team?.includes(person.id)
    commit(TEAM_ADD_PERSON, { production, personId: person.id })
    try {
      return await productionsApi.addPersonToTeam(production.id, person.id)
    } catch (err) {
      if (!isMember) {
        commit(TEAM_REMOVE_PERSON, { production, personId: person.id })
      }
      throw err
    }
  },

  async loadProductionTeam({ commit, state, rootState }) {
    return loadTeamWithUserRole(commit, rootState, state.currentProduction.id)
  },

  // For the pages that read the roles without listing the team, such as the
  // comments of a task. A role changed meanwhile waits for the next reload:
  // zou stays the gate.
  async loadTeamRolesOnce({ commit, state }, productionId) {
    if (!productionId || state.teamRoles[productionId]) return
    const team = await productionsApi.getTeam(productionId)
    commit(TEAM_ROLES_LOADED, { productionId, team })
  },

  reloadTeamRoles({ commit, rootState }, productionId) {
    return loadTeamWithUserRole(commit, rootState, productionId)
  },

  async setTeamMemberRole({ commit, state, rootState }, { personId, role }) {
    // The user may open another production before Zou answers.
    const productionId = state.currentProduction.id
    const link = await productionsApi.updateTeamMemberRole(
      productionId,
      personId,
      role
    )
    commit(TEAM_MEMBER_ROLE_UPDATED, { productionId, link })
    // Managers changing their own role must see their gating follow.
    if (personId === rootState.user.user?.id) {
      commit(SET_USER_PROJECT_ROLE, {
        projectId: productionId,
        role: link.role
      })
    }
    return link
  },

  async removePersonFromTeam({ commit, state }, person) {
    const production = state.currentProduction
    const role = state.teamRoles[production.id]?.[person.id]
    commit(TEAM_REMOVE_PERSON, { production, personId: person.id })
    try {
      return await productionsApi.removePersonFromTeam(production.id, person.id)
    } catch (err) {
      commit(TEAM_ADD_PERSON, { production, personId: person.id, role })
      throw err
    }
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

  async setAssetTypeWorkflow({ commit, state }, { assetTypeId, taskTypeIds }) {
    await productionsApi.setAssetTypeWorkflow(
      state.currentProduction.id,
      assetTypeId,
      taskTypeIds
    )
    commit(PRODUCTION_SET_ASSET_TYPE_WORKFLOW, { assetTypeId, taskTypeIds })
  },

  addTaskTypeToProduction(
    { commit, state },
    { taskTypeId, priority = null, ...bitrates }
  ) {
    // A settings field saves on its way out of the page: the next production
    // is current by the time the answer comes back.
    const production = state.currentProduction
    commit(PRODUCTION_ADD_TASK_TYPE, taskTypeId)
    return productionsApi
      .addTaskTypeToProduction(production.id, taskTypeId, priority, bitrates)
      .then(() => {
        commit(PRODUCTION_SET_TASK_TYPE_LINK, {
          production,
          taskTypeId,
          ...bitrates
        })
      })
  },

  setTaskTypeClientVisibility(
    { commit, state },
    { taskTypeId, isClientVisible }
  ) {
    const production = state.currentProduction
    return productionsApi
      .setTaskTypeClientVisibility(production.id, taskTypeId, isClientVisible)
      .then(() => {
        commit(PRODUCTION_SET_TASK_TYPE_LINK, {
          production,
          taskTypeId,
          is_client_visible: isClientVisible
        })
      })
  },

  setTaskStatusClientAllowed(
    { commit, state },
    { taskStatusId, isClientAllowed }
  ) {
    const production = state.currentProduction
    return productionsApi
      .setTaskStatusClientAllowed(production.id, taskStatusId, isClientAllowed)
      .then(() => {
        commit(PRODUCTION_SET_TASK_STATUS_LINK, {
          production,
          taskStatusId,
          is_client_allowed: isClientAllowed
        })
      })
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

  /**
   * Attach task types, task statuses and asset types to the current
   * production in a single request. With replaceTaskTypes, taskTypes is the
   * full wanted set: task type links absent from it are removed.
   */
  async addSettingsToProduction(
    { commit, state },
    {
      taskTypes = [],
      taskStatusIds = [],
      assetTypeIds = [],
      replaceTaskTypes = false
    }
  ) {
    const production = await productionsApi.addSettingsToProduction(
      state.currentProduction.id,
      { taskTypes, taskStatusIds, assetTypeIds, replaceTaskTypes }
    )
    if (replaceTaskTypes) {
      const wantedIds = taskTypes.map(({ taskTypeId }) => taskTypeId)
      state.currentProduction.task_types
        .filter(id => !wantedIds.includes(id))
        .forEach(id => commit(PRODUCTION_REMOVE_TASK_TYPE, id))
    }
    taskTypes.forEach(({ taskTypeId }) =>
      commit(PRODUCTION_ADD_TASK_TYPE, taskTypeId)
    )
    taskStatusIds.forEach(id => commit(PRODUCTION_ADD_TASK_STATUS, id))
    assetTypeIds.forEach(id => commit(PRODUCTION_ADD_ASSET_TYPE, id))
    return production
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
      return productionsApi
        .updateMetadataDescriptor(state.currentProduction.id, descriptor)
        .then(descriptor => {
          // Read once Zou answers, as the productions do: a rename of this
          // column by someone else may have come in during the save.
          const previousDescriptorFieldName =
            state.currentProduction?.descriptors?.find(
              d => d.id === descriptor.id
            )?.field_name
          commit(UPDATE_METADATA_DESCRIPTOR_END, {
            production: state.currentProduction,
            previousDescriptorFieldName,
            descriptor
          })
        })
    } else {
      const { projectId, ...toSend } = descriptor
      const targetId = projectId || state.currentProduction?.id
      if (!targetId) {
        return Promise.reject(new Error('No target project for metadata'))
      }
      return productionsApi
        .addMetadataDescriptor(targetId, toSend)
        .then(created => {
          const production = findProductionInState(
            state,
            created.project_id || targetId
          )
          if (production) {
            commit(ADD_METADATA_DESCRIPTOR_END, {
              production,
              descriptor: created
            })
          }
          return created
        })
    }
  },

  /**
   * Create the same Project-entity metadata descriptor on every open
   * production (Zou still stores one row per project; this mirrors a
   * studio-wide column in the all-projects view).
   */
  async addProjectMetadataDescriptorToAllProductions(
    { commit, state },
    descriptor
  ) {
    // Drop projectId: one request applies the column to every accessible
    // open project server-side, skipping those that already own it.
    // eslint-disable-next-line no-unused-vars
    const { projectId, ...toSend } = descriptor
    const created =
      await productionsApi.addMetadataDescriptorToAllProjects(toSend)
    created.forEach(newDescriptor => {
      const production = findProductionInState(state, newDescriptor.project_id)
      if (production) {
        commit(ADD_METADATA_DESCRIPTOR_END, {
          production,
          descriptor: newDescriptor
        })
      }
    })
  },

  async updateProjectMetadataOnAll({ commit, state }, { fieldName, form }) {
    // eslint-disable-next-line no-unused-vars
    const { id, projectId, ...formFields } = form
    const updated = await productionsApi.updateMetadataDescriptorOnAllProjects(
      fieldName,
      {
        ...formFields,
        entity_type: 'Project'
      }
    )
    updated.forEach(descriptor => {
      const production = findProductionInState(state, descriptor.project_id)
      if (production) {
        commit(UPDATE_METADATA_DESCRIPTOR_END, { production, descriptor })
      }
    })
  },

  async deleteProjectMetadataByFieldName({ commit }, fieldName) {
    const removedIds =
      await productionsApi.deleteMetadataDescriptorOnAllProjects(
        fieldName,
        'Project'
      )
    removedIds.forEach(id => commit(DELETE_METADATA_DESCRIPTOR_END, { id }))
  },

  /**
   * Make sure the production owns its copy of the given Project descriptor,
   * creating it when missing (e.g. production created after the column was).
   */
  async ensureProjectMetadataDescriptor(
    { dispatch },
    { production, descriptor }
  ) {
    // A rename made elsewhere may have given the column, which keeps its id,
    // another field name, and Zou refuses a second copy, which may have come
    // since: the columns of a production off screen are read first.
    if (staleDescriptorProductionIds.has(production.id)) {
      await dispatch('syncMetadataDescriptors', { productionId: production.id })
    }
    const projectDescriptors = (production.descriptors || []).filter(
      d => d.entity_type === 'Project'
    )
    const owned =
      projectDescriptors.find(d => d.id === descriptor.id) ||
      projectDescriptors.find(d => d.field_name === descriptor.field_name)
    if (owned) {
      return owned
    }
    const key = `${production.id}-${descriptor.field_name}`
    if (!pendingProjectDescriptorCreations.has(key)) {
      pendingProjectDescriptorCreations.set(
        key,
        dispatch('addMetadataDescriptor', {
          ...projectDescriptorToForm(descriptor),
          projectId: production.id
        })
          .catch(err => {
            // 400 means the production already owns the row server-side
            // (project template, backfill from another client) without it
            // being loaded locally: the value edit can proceed and the
            // local copy heals on the next productions load.
            if (err?.response?.status !== 400) {
              throw err
            }
            return null
          })
          .finally(() => pendingProjectDescriptorCreations.delete(key))
      )
    }
    return pendingProjectDescriptorCreations.get(key)
  },

  deleteMetadataDescriptor({ commit, state }, descriptorId) {
    const productionId = state.currentProduction.id
    // Read before the request, while the store still lists the column. The
    // descriptors of a production come without its id.
    const known = state.currentProduction.descriptors?.find(
      d => d.id === descriptorId
    )
    const descriptor = known && { ...known, project_id: productionId }
    return productionsApi
      .deleteMetadataDescriptor(productionId, descriptorId)
      .catch(err => {
        // Zou answers 404 when another tab or another person deleted the
        // column first, but also for the column of another production, sent
        // by a confirmation left open across a production switch.
        if (
          !isNotFound(err) ||
          isDescriptorOfAnotherProduction(state, productionId, descriptorId)
        ) {
          throw err
        }
      })
      .then(() => {
        commit(DELETE_METADATA_DESCRIPTOR_END, { id: descriptorId, descriptor })
      })
  },

  // A column deleted elsewhere, in this production or another one: the lists
  // drop its values with it.
  dropMetadataDescriptor({ commit, state }, { productionId, descriptorId }) {
    numberDescriptorEvent(productionId, descriptorId)
    let descriptor
    forEachProductionObjectInState(state, production => {
      const known = production.descriptors?.find(d => d.id === descriptorId)
      if (known && !descriptor) {
        descriptor = { ...known, project_id: production.id }
      }
    })
    commit(DELETE_METADATA_DESCRIPTOR_END, { id: descriptorId, descriptor })
  },

  // A column created or changed elsewhere, read through its production as Zou
  // serves it. A production off screen reads its columns once on screen,
  // rather than a column per event: a change made on the Productions page
  // sends one per production.
  refreshMetadataDescriptor({ commit, state }, { productionId, descriptorId }) {
    const eventNumber = numberDescriptorEvent(productionId, descriptorId)
    const production = state.productionMap.get(productionId)
    if (!production) {
      return
    }
    if (productionId !== state.currentProduction?.id) {
      staleDescriptorProductionIds.add(productionId)
      return
    }
    return productionsApi
      .getMetadataDescriptor(productionId, descriptorId)
      .then(descriptor => {
        if (
          descriptorEventNumbers.get(descriptorId) !== eventNumber ||
          (appliedDescriptorReadNumbers.get(productionId) ?? 0) > eventNumber
        ) {
          return
        }
        const known = production.descriptors?.find(d => d.id === descriptor.id)
        if (!known) {
          commit(ADD_METADATA_DESCRIPTOR_END, { production, descriptor })
        } else {
          commit(UPDATE_METADATA_DESCRIPTOR_END, {
            production,
            previousDescriptorFieldName: known.field_name,
            descriptor
          })
        }
      })
      .catch(err => {
        // The read of an earlier event of the column may have given way to
        // this one: the production reads its columns again, as after any
        // failed read.
        staleDescriptorProductionIds.add(productionId)
        throw err
      })
  },

  // The columns of the production read again if they may have changed since.
  loadStaleMetadataDescriptors({ dispatch }, productionId) {
    if (staleDescriptorProductionIds.has(productionId)) {
      return dispatch('syncMetadataDescriptors', { productionId })
    }
  },

  // Zou sends no event again once the socket is back: every production
  // loaded reads its columns again once on screen, the one on screen at
  // once, and a read made during the drop is made again.
  resyncMetadataDescriptors({ dispatch, state }) {
    state.productionMap.forEach((production, id) => {
      numberDescriptorEvent(id)
      staleDescriptorProductionIds.add(id)
    })
    const productionId = state.currentProduction?.id
    if (productionId) {
      outdatedListProductionIds.add(productionId)
      return dispatch('syncMetadataDescriptors', { productionId })
    }
  },

  // Reads the columns of the production again, and passes their changes on
  // as the events would have. The calls made during the read wait for its
  // end, after the read made again for an event of the production, in their
  // order: the saves of Project values keep the order they were typed in.
  syncMetadataDescriptors({ commit, state }, { productionId }) {
    if (!pendingDescriptorReads.has(productionId)) {
      const readColumns = async () => {
        const readNumber = ++lastDescriptorNumber
        const descriptors =
          await productionsApi.getMetadataDescriptors(productionId)
        if (hasDescriptorEventSince(productionId, readNumber)) {
          return readColumns()
        }
        appliedDescriptorReadNumbers.set(productionId, readNumber)
        staleDescriptorProductionIds.delete(productionId)
        const moveListValues = outdatedListProductionIds.delete(productionId)
        const production = state.productionMap.get(productionId)
        if (production) {
          syncProductionDescriptors(
            commit,
            production,
            descriptors,
            moveListValues
          )
        }
      }
      pendingDescriptorReads.set(
        productionId,
        readColumns().finally(() => pendingDescriptorReads.delete(productionId))
      )
    }
    return pendingDescriptorReads.get(productionId)
  },

  reorderMetadataDescriptors({ commit, state }, { entityType, descriptorIds }) {
    return productionsApi
      .reorderMetadataDescriptors(
        state.currentProduction.id,
        entityType,
        descriptorIds
      )
      .then(updatedDescriptors => {
        updatedDescriptors.forEach(descriptor => {
          commit(UPDATE_METADATA_DESCRIPTOR_END, {
            production: state.currentProduction,
            descriptor
          })
        })
        return updatedDescriptors
      })
  },

  /**
   * Apply the same Project metadata column order on every loaded production
   * (all-projects list). `fieldOrder` is `field_name` values in display order.
   */
  async reorderAllProjectsProjectMetadata(
    { commit, state },
    { entityType, fieldOrder }
  ) {
    if (!fieldOrder?.length || !entityType) return
    // The server applies the field order on every accessible project and
    // keeps unlisted columns at trailing positions.
    const updated =
      await productionsApi.reorderMetadataDescriptorsOnAllProjects(
        entityType,
        fieldOrder
      )
    updated.forEach(descriptor => {
      const production = findProductionInState(state, descriptor.project_id)
      if (production) {
        commit(UPDATE_METADATA_DESCRIPTOR_END, { production, descriptor })
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
  },

  loadProductionStats() {
    return productionsApi.getProductionStats()
  },

  getPreviewAccount(_, productionId) {
    return productionsApi.getPreviewAccount(productionId)
  },

  createPreviewAccount(_, productionId) {
    return productionsApi.createPreviewAccount(productionId)
  },

  setPreviewAccountOpen(_, { productionId, isOpen }) {
    return productionsApi.setPreviewAccountOpen(productionId, isOpen)
  },

  deletePreviewAccount(_, productionId) {
    return productionsApi.deletePreviewAccount(productionId)
  },

  saveLastProductionRoute({ commit }, route) {
    this.commit(SAVE_LAST_PRODUCTION_ROUTE, route)
  },

  setProductionAccessError({ commit }, error) {
    commit(SET_PRODUCTION_ACCESS_ERROR, error)
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

    // The all-productions listing carries no relations and the Project
    // descriptors only: an entry loaded in full, an open production or a
    // closed one reloaded for a link, keeps its object and its other
    // descriptors, and takes the listed fields. The Project columns come
    // with the data, where Zou moves the values of a renamed one.
    state.productions.forEach(production => {
      const known = state.productionMap.get(production.id)
      if (!known) {
        state.productionMap.set(production.id, production)
      } else {
        Object.assign(known, production, {
          descriptors: listedDescriptors(known, production)
        })
      }
    })
  },

  [LOAD_OPEN_PRODUCTIONS_END](state, productions) {
    // The map keeps its objects, the current production among them: a
    // known open production takes the listed fields, a closed one, absent
    // from this listing, stays as it was loaded.
    state.openProductions = sortByName(
      productions.map(production => {
        const known = state.productionMap.get(production.id)
        if (!known) {
          state.productionMap.set(production.id, production)
          return production
        }
        return Object.assign(known, production)
      })
    )

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
    setProductionStatusName(state, production)
    state.productions.push(production)
    state.productionMap.set(production.id, production)
    // A closed production loaded for a link joins the map, not the open ones.
    if (production.project_status_name === OPEN_STATUS_NAME) {
      state.openProductions.push(production)
      state.openProductions = sortByName(state.openProductions)
    }
    state.productions = sortProductions(state.productions)
  },

  [UPDATE_PRODUCTION](state, production) {
    const previousProduction = state.productions.find(
      ({ id }) => id === production.id
    )
    const openProduction = state.openProductions.find(
      ({ id }) => id === production.id
    )
    setProductionStatusName(state, production)

    // The response of an edit carries no relations, and the all-productions
    // copy lists the Project descriptors only: the whole record is the
    // response over the fullest copy in the store, the map entry first.
    // Every copy then takes it, and the map keeps its object, the one the
    // current production points to.
    Object.assign(production, {
      ...previousProduction,
      ...openProduction,
      ...state.productionMap.get(production.id),
      ...production
    })
    forEachProductionAlias(
      state,
      production.id,
      alias => Object.assign(alias, production),
      state.currentProduction
    )
    if (!state.productionMap.has(production.id)) {
      state.productionMap.set(production.id, production)
    }
    const known = state.productionMap.get(production.id)
    const isOpen = production.project_status_name === OPEN_STATUS_NAME
    if (isOpen && !openProduction) {
      state.openProductions.push(known)
    } else if (!isOpen && openProduction) {
      state.openProductions = removeModelFromList(state.openProductions, known)
    }
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
    if (production) {
      production.has_avatar = true
      // The thumbnail URL is cache-busted on updated_at, which the picture
      // upload does not touch server-side.
      production.updated_at = new Date().toISOString()
    }
  },

  [SET_CURRENT_PRODUCTION](state, productionId) {
    const production = state.productionMap.get(productionId)
    state.currentProduction = production
  },

  // A refused removal brings the member back with their project role.
  [TEAM_ADD_PERSON](state, { production, personId, role }) {
    addToIdList(production, 'team', personId)
    if (role) {
      state.teamRoles = {
        ...state.teamRoles,
        [production.id]: { ...state.teamRoles[production.id], [personId]: role }
      }
    }
  },

  [TEAM_REMOVE_PERSON](state, { production, personId }) {
    removeFromIdList(production, 'team', personId)
    delete state.teamRoles[production.id]?.[personId]
  },

  [TEAM_ROLES_LOADED](state, { productionId, team }) {
    state.teamRoles = {
      ...state.teamRoles,
      [productionId]: Object.fromEntries(
        team.map(member => [member.id, member.project_role])
      )
    }
  },

  [TEAM_MEMBER_ROLE_UPDATED](state, { productionId, link }) {
    state.teamRoles = {
      ...state.teamRoles,
      [productionId]: {
        ...state.teamRoles[productionId],
        [link.person_id]: link.role
      }
    }
  },

  [PRODUCTION_ADD_ASSET_TYPE](state, assetTypeId) {
    addToIdList(state.currentProduction, 'asset_types', assetTypeId)
  },

  [PRODUCTION_REMOVE_ASSET_TYPE](state, assetTypeId) {
    removeFromIdList(state.currentProduction, 'asset_types', assetTypeId)
    const workflows = { ...state.currentProduction.asset_type_workflows }
    delete workflows[assetTypeId]
    state.currentProduction.asset_type_workflows = workflows
  },

  [PRODUCTION_SET_ASSET_TYPE_WORKFLOW](state, { assetTypeId, taskTypeIds }) {
    const workflows = { ...state.currentProduction.asset_type_workflows }
    if (taskTypeIds.length) {
      workflows[assetTypeId] = taskTypeIds
    } else {
      delete workflows[assetTypeId]
    }
    state.currentProduction.asset_type_workflows = workflows
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

  [PRODUCTION_SET_TASK_TYPE_LINK](state, { production, taskTypeId, ...link }) {
    if (!production.task_type_links) production.task_type_links = {}
    production.task_type_links[taskTypeId] = {
      ...production.task_type_links[taskTypeId],
      ...link
    }
  },

  [PRODUCTION_SET_TASK_STATUS_LINK](
    state,
    { production, taskStatusId, ...link }
  ) {
    if (!production.task_statuses_link) production.task_statuses_link = {}
    production.task_statuses_link[taskStatusId] = {
      ...production.task_statuses_link[taskStatusId],
      ...link
    }
  },

  [PRODUCTION_REMOVE_TASK_TYPE](state, taskTypeId) {
    removeFromIdList(state.currentProduction, 'task_types', taskTypeId)
    // Zou drops it from the workflows too, and an emptied one no longer exists.
    state.currentProduction.asset_type_workflows = Object.fromEntries(
      Object.entries(state.currentProduction.asset_type_workflows || {})
        .map(([id, workflow]) => [id, workflow.filter(t => t !== taskTypeId)])
        .filter(([, workflow]) => workflow.length)
    )
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
    if (!production || !descriptor) {
      return
    }
    forEachProductionAlias(
      state,
      production.id,
      p => {
        if (!p.descriptors) {
          p.descriptors = []
        }
        if (!p.descriptors.some(d => d.id === descriptor.id)) {
          p.descriptors.push(descriptor)
        }
      },
      production
    )
  },

  [UPDATE_METADATA_DESCRIPTOR_END](state, { production, descriptor }) {
    if (!descriptor?.id) {
      return
    }
    const pid = production?.id
    if (!pid) {
      return
    }
    // Read before any update: the copies of a production can share the
    // descriptor object that the first update changes.
    let previousFieldName
    forEachProductionAlias(
      state,
      pid,
      p => {
        previousFieldName =
          previousFieldName ||
          p.descriptors?.find(d => d.id === descriptor.id)?.field_name
      },
      production
    )
    const isRenamedProjectColumn =
      descriptor.entity_type === 'Project' &&
      previousFieldName &&
      previousFieldName !== descriptor.field_name
    forEachProductionAlias(
      state,
      pid,
      p => {
        if (p.descriptors) {
          updateModelFromList(p.descriptors, descriptor)
        }
        // Zou moves the values of a renamed Project column to its new field
        // name in the data of the production.
        if (isRenamedProjectColumn && hasDataValue(p.data, previousFieldName)) {
          p.data[descriptor.field_name] = p.data[previousFieldName]
          delete p.data[previousFieldName]
        }
      },
      production
    )
  },

  [DELETE_METADATA_DESCRIPTOR_END](state, { id }) {
    forEachProductionObjectInState(state, p => {
      const descriptor = p.descriptors?.find(d => d.id === id)
      if (descriptor) {
        p.descriptors = removeModelFromList(p.descriptors, { id })
        // A Project column keeps its values in the data of the production,
        // which Zou clears with the column.
        if (descriptor.entity_type === 'Project' && p.data) {
          delete p.data[descriptor.field_name]
        }
      }
    })
  },

  [ASSIGN_TASKS](state, { personId }) {
    const isTeamMember =
      state.currentProduction &&
      state.currentProduction.team.some(pId => pId === personId)
    if (!isTeamMember && state.currentProduction) {
      state.currentProduction.team.push(personId)
    }
  },

  [SAVE_LAST_PRODUCTION_ROUTE](state, route) {
    state.lastProductionRoute = route
  },

  [SET_PRODUCTION_ACCESS_ERROR](state, error) {
    state.productionAccessError = error
  },

  [RESET_ALL](state) {
    // The map is filled in place: the initial one must not come back.
    Object.assign(state, { ...initialState, productionMap: new Map() })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  helpers
}

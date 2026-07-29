// vue-router rejects an empty required param, so the :type segment must resolve
// even when the task type is missing from the map: fall back to the task's own
// entity type rather than building a route that throws.
export const getTaskRouteEntity = (task, taskType) => {
  if (taskType?.for_entity) return taskType.for_entity
  const type = task.entity_type_name
  return ['Shot', 'Edit', 'Episode', 'Sequence'].includes(type) ? type : 'Asset'
}

export const getTaskPath = (
  task,
  production,
  isTVShow,
  episode,
  taskTypeMap
) => {
  const productionId = task.project_id ? task.project_id : production.id
  const route = {
    name: 'task',
    params: {
      production_id: productionId,
      task_id: task.id
    }
  }
  // Callers may build the episode from an optional id, so the object is truthy
  // while its id is not: test the resolved id too, an empty one would leave
  // episode-task without its required :episode_id.
  const episodeId = task.episode_id || episode?.id
  if (isTVShow && episode && episodeId) {
    route.name = 'episode-task'
    route.params.episode_id = episodeId
  }
  const taskType = taskTypeMap.get(task.task_type_id)
  const forEntity = getTaskRouteEntity(task, taskType)
  if (forEntity === 'Episode' && task.entity_id) {
    route.name = 'episode-episode-task'
    route.params.episode_id = task.entity_id
    delete route.params.type
  } else {
    route.params.type = pluralizeEntityType(forEntity)
  }
  return route
}

export const getTaskEntityPath = (task, episodeId) => {
  if (task) {
    let type = task.entity_type_name
    if (!['Shot', 'Edit', 'Episode', 'Sequence'].includes(type)) {
      type = 'Asset'
    }
    const entityId = task.entity ? task.entity.id : task.entity_id
    const route = {
      name: type.toLowerCase(),
      params: {
        production_id: task.project_id
      }
    }
    route.params[`${route.name}_id`] = entityId

    if (episodeId && route.name !== 'episode') {
      route.name = `episode-${route.name}`
      route.params.episode_id = episodeId
    }
    return route
  } else {
    return {
      name: 'open-productions'
    }
  }
}

export const getTaskEntitiesPath = (task, episodeId) => {
  if (task) {
    let type = task.entity_type_name
    if (!['Shot', 'Sequence', 'Episode', 'Edit'].includes(type)) {
      type = 'Asset'
    }
    const route = {
      name: `${type.toLowerCase()}s`,
      params: {
        production_id: task.project_id
      },
      query: {
        search: '',
        task_id: task.id
      }
    }
    if (episodeId && !['episode', 'episodes'].includes(route.name)) {
      route.name = `episode-${route.name}`
      route.params.episode_id = episodeId
    }
    return route
  } else {
    return {
      name: 'open-productions'
    }
  }
}

export const getEntitiesPath = (productionId, type, episodeId) => {
  const route = {
    name: type,
    params: {
      production_id: productionId
    }
  }

  if (episodeId) {
    route.name = `episode-${type}`
    route.params.episode_id = episodeId
  }

  return route
}

export const getEntityPath = (
  entityId,
  productionId,
  section,
  episodeId,
  query
) => {
  const route = {
    name: section,
    params: {
      production_id: productionId
    }
  }

  if (episodeId && section !== 'episode') {
    route.name = `episode-${section}`
    route.params.episode_id = episodeId
  }

  if (['shot', 'asset', 'edit', 'sequence', 'episode'].includes(section)) {
    route.params[`${section}_id`] = entityId
  }

  if (query) {
    route.query = query
  }

  return route
}

const SECTION_NAME_MAP = {
  assetTypes: 'production-asset-types',
  newsFeed: 'news-feed',
  plugin: 'production-plugin'
}

const TVSHOW_NON_EPISODIC_SECTIONS = [
  'news-feed',
  'production-settings',
  'quota',
  'budget',
  'team',
  'episodes',
  'episode-stats',
  'concepts',
  'brief'
]

const SECTIONS_WITH_SEARCH = [
  'assets',
  'shots',
  'edits',
  'sequences',
  'episodes',
  'breakdown'
]

/* Enforce section depending on the production type */
const _getAdjustedRouteName = (productionType, section, pluginId = null) => {
  if (pluginId) {
    section = 'production-plugin'
  }
  if (productionType === 'shots' && section === 'assets') {
    return 'shots'
  }
  if (productionType === 'assets' && ['shots', 'sequences'].includes(section)) {
    return 'assets'
  }
  return section
}

const getProductionRoute = (name, productionId, pluginId = null) => {
  const params = {
    production_id: productionId
  }
  if (pluginId) {
    params.plugin_id = pluginId
  }
  return {
    name,
    params
  }
}

export const getProductionPath = (
  production,
  section = production.homepage || 'assets',
  episodeId,
  pluginId
) => {
  const normalizedSection = SECTION_NAME_MAP[section] || section
  const routeName = _getAdjustedRouteName(
    production.production_type,
    normalizedSection,
    pluginId
  )
  let route = getProductionRoute(routeName, production.id, pluginId)

  const shouldEpisodify =
    production.production_type === 'tvshow' &&
    !TVSHOW_NON_EPISODIC_SECTIONS.includes(normalizedSection)

  if (shouldEpisodify) {
    route = episodifyRoute(route, episodeId || 'all')
  }

  if (SECTIONS_WITH_SEARCH.includes(normalizedSection)) {
    route.query = { search: '' }
  }

  return route
}

export const episodifyRoute = (route, episodeId) => {
  if (episodeId) {
    route.name = `episode-${route.name}`
    route.params.episode_id = episodeId
  }
  return route
}

export const getPlaylistPath = (prodId, episodeId, playlistId, section) => {
  const route = {
    name: section ? `${section}-playlist` : 'playlist',
    params: {
      production_id: prodId,
      playlist_id: playlistId
    }
  }
  return episodifyRoute(route, episodeId)
}

const getContextRoute = (name, productionId, episodeId) => {
  return episodifyRoute(getProductionRoute(name, productionId), episodeId)
}

export const getTaskTypeSchedulePath = (
  taskTypeId,
  productionId,
  episodeId,
  type
) => {
  const route = getContextRoute('task-type-schedule', productionId, episodeId)
  route.params.task_type_id = taskTypeId
  route.params.type = pluralizeEntityType(type)
  return route
}

export const getProductionSchedulePath = productionId => {
  return getProductionRoute('schedule', productionId)
}

export const getPersonPath = (personId, section = undefined) => {
  return {
    name: 'person',
    params: {
      person_id: personId
    },
    query: {
      section
    }
  }
}

export const getDownloadAttachmentPath = (attachment, absolute = false) => {
  const path = `/api/data/attachment-files/${attachment.id}/file/${attachment.name}`
  return absolute ? `${window.location.origin}${path}` : path
}

export const getAttachmentThumbnailPath = attachment => {
  return `/api/pictures/thumbnails/attachment-files/${attachment.id}.png`
}

export const pluralizeEntityType = (type = '') => {
  type = type.toLowerCase()
  return ['asset', 'edit', 'episode', 'sequence', 'shot'].includes(type)
    ? `${type}s`
    : type
}

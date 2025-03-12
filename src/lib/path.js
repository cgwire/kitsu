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
  if (isTVShow && episode) {
    route.name = 'episode-task'
    route.params.episode_id = task.episode_id || episode.id
  }
  const taskType = taskTypeMap.get(task.task_type_id)
  if (taskType.for_entity === 'Episode') {
    route.name = 'episode-episode-task'
    route.params.episode_id = task.entity_id
    delete route.params.type
  } else {
    route.params.type = pluralizeEntityType(taskType.for_entity)
  }
  return route
}

export const getTaskEntityPath = (task, episodeId) => {
  if (task) {
    let type = task.entity_type_name
    if (!['Shot', 'Edit', 'Episode'].includes(type)) {
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

  if (episodeId) {
    route.name = `episode-${section}`
    route.params.episode_id = episodeId
  }

  if (['shot', 'asset', 'edit', 'sequence'].includes(section)) {
    route.params[`${section}_id`] = entityId
  }

  if (query) {
    route.query = query
  }

  return route
}

const getProductionRoute = (name, productionId) => {
  return {
    name,
    params: {
      production_id: productionId
    }
  }
}

export const getProductionPath = (
  production,
  section = production.homepage || 'assets',
  episodeId
) => {
  if (section === 'assetTypes') section = 'production-asset-types'
  if (section === 'newsFeed') section = 'news-feed'
  let route = getProductionRoute(section, production.id)

  if (production.production_type === 'shots' && route.name === 'assets') {
    route.name = 'shots'
  } else if (
    production.production_type === 'assets' &&
    ['shots', 'sequences'].includes(route.name)
  ) {
    route.name = 'assets'
  }

  if (
    production.production_type === 'tvshow' &&
    ![
      'news-feed',
      'schedule',
      'production-settings',
      'quota',
      'team',
      'episodes',
      'episode-stats',
      'concepts',
      'brief'
    ].includes(section)
  ) {
    route = episodifyRoute(route, episodeId || 'all')
  }

  if (
    ['assets', 'shots', 'edits', 'sequences', 'episodes', 'breakdown'].includes(
      section
    )
  ) {
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

export const getDownloadAttachmentPath = attachment => {
  return `/api/data/attachment-files/${attachment.id}/file/${attachment.name}`
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

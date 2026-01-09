import client from '@/store/api/client'

export default {
  getPlaylists(production, episode, taskTypeId, sortBy, page) {
    let path = `/api/data/projects/${production.id}`
    if (episode) {
      path += `/episodes/${episode.id}/playlists?sort_by=${sortBy}&page=${page}`
    } else {
      path += `/playlists?sort_by=${sortBy}&page=${page}`
    }
    if (taskTypeId?.length) {
      path += `&task_type_id=${taskTypeId}`
    }
    return client.pget(path)
  },

  getPlaylist(production, playlist) {
    const path = `/api/data/projects/${production.id}/playlists/${playlist.id}`
    return client.pget(path)
  },

  getEntityPreviewFiles(entity) {
    const path = `/api/data/playlists/entities/${entity.id}/preview-files`
    return client.pget(path)
  },

  getRunningPreviewFiles(limit, lastPreviewFileId = null) {
    let path = `/api/data/playlists/preview-files/running?limit=${limit}`
    if (lastPreviewFileId) {
      path += `&cursor_preview_file_id=${lastPreviewFileId}`
    }
    return client.pget(path)
  },

  markPreviewFileAsBroken(previewFileId) {
    return client.pput(`/api/data/preview-files/${previewFileId}`, {
      status: 'broken'
    })
  },

  updatePreviewFileValidationStatus(previewFile, status) {
    return client.pput(`/api/data/preview-files/${previewFile.id}`, {
      validation_status: status
    })
  },

  newPlaylist(playlist) {
    const data = {
      name: playlist.name,
      project_id: playlist.production_id,
      episode_id: playlist.episode_id,
      for_client: playlist.for_client,
      for_entity: playlist.for_entity,
      is_for_all: playlist.is_for_all,
      task_type_id: playlist.task_type_id
    }
    return client.ppost('/api/data/playlists/', data)
  },

  updatePlaylist(playlist) {
    const data = {}
    if (playlist.name) data.name = playlist.name
    if (playlist.for_client !== undefined) {
      data.for_client = playlist.for_client
    }
    if (playlist.shots)
      data.shots = playlist.shots.map(shot => ({
        entity_id: shot.entity_id,
        preview_file_id: shot.preview_file_id
      }))
    if (playlist.for_entity) data.for_entity = playlist.for_entity
    data.task_type_id = playlist.task_type_id || null
    return client.pput(`/api/data/playlists/${playlist.id}`, data)
  },

  deletePlaylist(playlist) {
    return client.pdel(`/api/data/playlists/${playlist.id}`)
  },

  deleteBuildJob(job) {
    const path = `/api/data/playlists/${job.playlist_id}/jobs/${job.id}`
    return client.pdel(path)
  },

  runPlaylistBuild(playlist, full = false) {
    let path = `/api/data/playlists/${playlist.id}/build/mp4`
    if (full) path += '?full=true'
    return client.pget(path)
  },

  loadTempPlaylist(production, taskIds, sort) {
    let path = `/api/data/projects/${production.id}/playlists/temp`
    if (sort) path += '?sort=true'
    return client.ppost(path, { task_ids: taskIds })
  },

  notifyClients(playlist, studioId, departmentId) {
    const data = { studio_id: studioId, department_id: departmentId }
    return client.ppost(
      `/api/data/playlists/${playlist.id}/notify-clients`,
      data
    )
  }
}

import client from '@/store/api/client'

export default {
  getEdit(editId) {
    return client.getModel('edits', editId)
  },

  getEdits(production, episode) {
    let path = '/api/data/edits/with-tasks'
    if (production) path += `?project_id=${production.id}`
    if (episode) path += `&episode_id=${episode.id}`
    return client.pget(path)
  },

  newEdit(edit) {
    const data = {
      name: edit.name,
      description: edit.description,
      data: edit.data
    }
    if (edit.parent_id !== 'null') {
      data.episode_id = edit.parent_id
    }
    return client.ppost(`/api/data/projects/${edit.project_id}/edits`, data)
  },

  updateEdit(edit) {
    const data = {
      name: edit.name,
      description: edit.description,
      data: edit.data
    }
    if (edit.parent_id === 'null' || edit.parent_id) {
      data.parent_id = edit.parent_id
    }
    const path = `/api/data/entities/${edit.id}`
    return client.pput(path, data)
  },

  deleteEdit(edit) {
    if (edit.canceled) {
      return client.pdel(`/api/data/edits/${edit.id}?force=true`)
    } else {
      return client.pdel(`/api/data/edits/${edit.id}`)
    }
  },

  restoreEdit(edit) {
    const data = { canceled: false }
    return client.pput(`/api/data/entities/${edit.id}`, data)
  },

  postCsv(production, formData, toUpdate) {
    let path = `/api/import/csv/projects/${production.id}/edits`
    if (toUpdate) path += '?update=true'
    return client.ppostImport(path, formData)
  },

  loadEditHistory(editId) {
    return client.pget(`/api/data/edits/${editId}/versions`)
  }
}

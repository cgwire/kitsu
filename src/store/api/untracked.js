import client from '@/store/api/client'

export default {
  getUntracked(production) {
    return client.pget(`/api/data/projects/${production.id}/untracked`)
  },

  newUntracked(untracked) {
    const data = {
      name: untracked.name,
      description: untracked.description || '',
      parent_id: untracked.parent_id || null,
      create_task: Boolean(untracked.create_task),
      department_id: untracked.department_id || null,
      color: untracked.color || null
    }
    return client.ppost(
      `/api/data/projects/${untracked.project_id}/untracked`,
      data
    )
  },

  updateUntracked(untracked) {
    const data = {}
    ;['name', 'description', 'parent_id'].forEach(key => {
      if (key in untracked) data[key] = untracked[key]
    })
    return client.pput(`/api/data/untracked/${untracked.id}`, data)
  }
}

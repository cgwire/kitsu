import client from '@/store/api/client'

export default {
  getConcepts(production) {
    return client.pget(
      `/api/data/concepts/with-tasks?project_id=${production.id}`
    )
  },

  getConcept(conceptId) {
    return client.getModel('concepts', conceptId, true)
  },

  newConcept(concept) {
    const data = {
      name: concept.name,
      description: concept.description,
      parent_id: concept.parent_id
    }
    return client.ppost(
      `/api/data/projects/${concept.project_id}/concepts`,
      data
    )
  },

  updateConcept(concept) {
    return client.pput(`/api/data/entities/${concept.id}`, concept)
  },

  deleteConcept(concept) {
    return client.pdel(`/api/data/concepts/${concept.id}?force=true`)
  },

  getEntityLinked(entity) {
    return client.pget(
      `/api/data/entities/${entity.id}/entities-linked/with-tasks`
    )
  },

  getConceptFolders(production) {
    return client.pget(`/api/data/projects/${production.id}/concept-folders`)
  },

  newConceptFolder(production, name) {
    return client.ppost(`/api/data/projects/${production.id}/concept-folders`, {
      name
    })
  },

  updateConceptFolder(folder) {
    return client.pput(`/api/data/concept-folders/${folder.id}`, {
      name: folder.name
    })
  },

  deleteConceptFolder(folder) {
    return client.pdel(`/api/data/concept-folders/${folder.id}`)
  },

  moveConcepts(production, conceptIds, folderId) {
    return client.ppost(
      `/api/actions/projects/${production.id}/move-concepts`,
      { concept_ids: conceptIds, concept_folder_id: folderId }
    )
  }
}

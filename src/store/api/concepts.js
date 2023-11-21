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
    return client.ppost('/api/data/concepts/', concept)
  },

  updateConcept(concept) {
    return client.pput(`/api/data/concepts/${concept.id}`, concept)
  },

  deleteConcept(concept) {
    return client.pdel(`/api/data/concepts/${concept.id}?force=true`)
  }
}

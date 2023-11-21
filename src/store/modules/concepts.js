import conceptsApi from '@/store/api/concepts'
import tasksApi from '@/store/api/tasks'

import {
  LOAD_CONCEPTS_START,
  LOAD_CONCEPTS_ERROR,
  LOAD_CONCEPTS_END,
  EDIT_CONCEPT_END,
  DELETE_CONCEPT_END,
  RESET_ALL
} from '@/store/mutation-types'

const initialState = {
  concepts: [],
  conceptMap: new Map(),
  displayedConcepts: [],
  conceptSearchText: '',
  conceptSearchQueries: []
}

const state = {
  ...initialState
}

const getters = {
  concepts: state => state.concepts,
  conceptMap: state => state.conceptMap
  // editConcept: state => state.editConcept,
  // deleteConcept: state => state.deleteConcept
}

const actions = {
  async loadConcepts({ commit }) {
    commit(LOAD_CONCEPTS_START)
    try {
      const concepts = await conceptsApi.getConcepts()
      commit(LOAD_CONCEPTS_END, concepts)
    } catch (err) {
      commit(LOAD_CONCEPTS_ERROR)
    }
  },

  async loadConcept({ commit }, conceptId) {
    try {
      const concept = await conceptsApi.getConcept(conceptId)
      commit(EDIT_CONCEPT_END, concept)
    } catch (err) {
      console.error(err)
    }
  },

  async newConcept({ commit }, { file, ...data }) {
    let concept = await conceptsApi.newConcept(data)
    const preview = concept.tasks[0].previews[0]
    const { request, promise } = tasksApi.uploadPreview(preview.id, file)
    request.on('progress', e => {
      // commit(SET_UPLOAD_PROGRESS, {
      //   previewId: preview.id,
      //   percent: e.percent,
      //   name: file.name
      // })
    })
    concept = await promise
    commit(EDIT_CONCEPT_END, concept)
    return concept
  },

  async saveConcept({ commit }, data) {
    const concept = await conceptsApi.updateConcept(data)
    commit(EDIT_CONCEPT_END, concept)
    return concept
  },

  async deleteConcept({ commit }, concept) {
    await conceptsApi.deleteConcept(concept)
    commit(DELETE_CONCEPT_END, concept)
  }
}

const mutations = {
  [LOAD_CONCEPTS_START](state) {
    state.concepts = []
    state.conceptMap = new Map()
    state.displayedConcepts = []
  },

  [LOAD_CONCEPTS_ERROR](state) {
    state.concepts = []
    state.conceptMap = new Map()
    state.displayedConcepts = []
  },

  [LOAD_CONCEPTS_END](state, concepts) {
    concepts.forEach(concept => {
      concept.url = `/api/pictures/preview-files/${concept.id}.${concept.extension}`
      concept.thumbnail = `/api/pictures/thumbnails/preview-files/${concept.id}.png`
    })
    // state.concepts = sortByName(concepts)
    state.concepts = concepts
    state.conceptMap = new Map(
      state.concepts.map(concept => [concept.id, concept])
    )
  },

  [EDIT_CONCEPT_END](state, newConcept) {
    newConcept.url = `/api/pictures/preview-files/${newConcept.id}.${newConcept.extension}`
    newConcept.thumbnail = `/api/pictures/thumbnails/preview-files/${newConcept.id}.png`

    const concept = state.conceptMap.get(newConcept.id)

    if (concept?.id) {
      Object.assign(concept, newConcept)
      state.conceptMap.delete(concept.id)
      state.conceptMap.set(concept.id, concept)
      // state.concepts = sortByName(state.concepts)
    } else {
      state.concepts.push(newConcept)
      state.conceptMap.set(newConcept.id, newConcept)
      // state.concepts = sortByName(state.concepts)
    }
  },

  [DELETE_CONCEPT_END](state, conceptToDelete) {
    const conceptToDeleteIndex = state.concepts.findIndex(
      ({ id }) => id === conceptToDelete.id
    )
    if (conceptToDeleteIndex >= 0) {
      state.concepts.splice(conceptToDeleteIndex, 1)
    }
    delete state.conceptMap.get(conceptToDelete.id)
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

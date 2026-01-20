import { v4 as uuidv4 } from 'uuid'

import conceptsApi from '@/store/api/concepts'

import {
  LOAD_CONCEPTS_START,
  LOAD_CONCEPTS_ERROR,
  LOAD_CONCEPTS_END,
  EDIT_CONCEPT_END,
  DELETE_CONCEPT_END,
  ADD_SELECTED_CONCEPTS,
  CLEAR_SELECTED_CONCEPTS,
  LOAD_LINKED_CONCEPTS_START,
  LOAD_LINKED_CONCEPTS_ERROR,
  LOAD_LINKED_CONCEPTS_END,
  RESET_ALL
} from '@/store/mutation-types'

const helpers = {
  populateTask(task, concept) {
    Object.assign(task, {
      entity_name: '',
      project_id: concept.project_id
    })
    return task
  },

  populateConcept(concept) {
    concept.full_name = 'Concept'
    concept.last_comment_date = concept.tasks?.[0]?.last_comment_date
    concept.tasks?.forEach(task => {
      helpers.populateTask(task, concept)
    })
  }
}

const initialState = {
  concepts: [],
  conceptMap: new Map(),
  conceptSearchText: '',
  conceptSearchQueries: [],
  linkedConcepts: [],
  selectedConcepts: new Map()
}

const state = {
  ...initialState
}

const getters = {
  concepts: state => state.concepts,
  conceptMap: state => state.conceptMap,
  linkedConcepts: state => state.linkedConcepts,
  selectedConcepts: state => state.selectedConcepts
}

const actions = {
  async loadConcepts({ commit, rootGetters }) {
    commit(LOAD_CONCEPTS_START)
    try {
      const production = rootGetters.currentProduction
      const concepts = await conceptsApi.getConcepts(production)
      commit(LOAD_CONCEPTS_END, { concepts })
    } catch (err) {
      console.error(err)
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

  async newConcepts({ dispatch }, forms) {
    return Promise.all(forms.map(form => dispatch('newConcept', form)))
  },

  async newConcept({ commit, dispatch, rootGetters }, form) {
    const production = rootGetters.currentProduction

    // Create Entity
    const entity = {
      name: form.get('file').name + '-' + uuidv4(), // unique and mandatory field
      project_id: production.id
    }
    const concept = await conceptsApi.newConcept(entity)

    // Create Task
    const conceptTaskType = rootGetters.taskTypes.find(
      taskType => taskType.for_entity === 'Concept'
    )
    const task = await dispatch('createTask', {
      entityId: concept.id,
      projectId: production.id,
      taskTypeId: conceptTaskType.id,
      type: 'concepts'
    })

    // Create Comment with Preview
    const { preview } = await dispatch('commentTaskWithPreview', {
      taskId: task.id,
      taskStatusId: task.task_status_id,
      form
    })
    await dispatch('setLastTaskPreview', task.id)

    concept.tasks = [task]
    concept.preview_file_id = preview.id
    helpers.populateConcept(concept)

    commit(EDIT_CONCEPT_END, concept)
    return concept
  },

  async editConcept({ commit }, data) {
    const concept = await conceptsApi.updateConcept(data)
    commit(EDIT_CONCEPT_END, concept)
    return concept
  },

  async deleteConcept({ commit }, concept) {
    await conceptsApi.deleteConcept(concept)
    commit(DELETE_CONCEPT_END, concept)
  },

  addSelectedConcepts({ commit }, concept) {
    commit(ADD_SELECTED_CONCEPTS, concept)
  },

  async deleteSelectedConcepts({ state, dispatch }) {
    let selectedConceptIds = [...state.selectedConcepts.values()]
      .filter(concept => !concept.canceled)
      .map(concept => concept.id)
    if (selectedConceptIds.length === 0) {
      selectedConceptIds = [...state.selectedConcepts.keys()]
    }
    for (const conceptId of selectedConceptIds) {
      const concept = state.conceptMap.get(conceptId)
      if (concept) {
        await dispatch('deleteConcept', concept)
      }
    }
  },

  clearSelectedConcepts({ commit }) {
    commit(CLEAR_SELECTED_CONCEPTS)
  },

  async loadLinkedConcepts({ commit }, entity) {
    commit(LOAD_LINKED_CONCEPTS_START)
    try {
      const concepts = await conceptsApi.getEntityLinked(entity)
      commit(LOAD_LINKED_CONCEPTS_END, { concepts })
    } catch (err) {
      console.error(err)
      commit(LOAD_LINKED_CONCEPTS_ERROR)
    }
  }
}

const mutations = {
  [LOAD_CONCEPTS_START](state) {
    state.concepts = []
    state.conceptMap = new Map()
  },

  [LOAD_CONCEPTS_ERROR](state) {
    state.concepts = []
    state.conceptMap = new Map()
  },

  [LOAD_CONCEPTS_END](state, { concepts }) {
    concepts.forEach(helpers.populateConcept)
    state.concepts = concepts
    state.conceptMap = new Map(concepts.map(concept => [concept.id, concept]))
  },

  [EDIT_CONCEPT_END](state, newConcept) {
    const concept = state.conceptMap.get(newConcept.id)
    if (concept?.id) {
      Object.assign(concept, newConcept)
      state.conceptMap.delete(concept.id)
      state.conceptMap.set(concept.id, concept)
    } else {
      state.concepts.push(newConcept)
      state.conceptMap.set(newConcept.id, newConcept)
    }
  },

  [DELETE_CONCEPT_END](state, concept) {
    const conceptIndex = state.concepts.findIndex(({ id }) => id === concept.id)
    if (conceptIndex >= 0) {
      state.concepts.splice(conceptIndex, 1)
    }
    state.conceptMap.delete(concept.id)
  },

  [ADD_SELECTED_CONCEPTS](state, concepts) {
    concepts.forEach(concept => {
      state.selectedConcepts.set(concept.id, concept)
    })
  },

  [CLEAR_SELECTED_CONCEPTS](state) {
    state.selectedConcepts = new Map()
  },

  [LOAD_LINKED_CONCEPTS_START](state) {
    state.linkedConcepts = []
  },

  [LOAD_LINKED_CONCEPTS_ERROR](state) {
    state.linkedConcepts = []
  },

  [LOAD_LINKED_CONCEPTS_END](state, { concepts }) {
    concepts.forEach(helpers.populateConcept)
    state.linkedConcepts = concepts
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

import async from 'async'

import conceptsApi from '@/store/api/concepts'

import {
  LOAD_CONCEPTS_START,
  LOAD_CONCEPTS_ERROR,
  LOAD_CONCEPTS_END,
  EDIT_CONCEPT_END,
  DELETE_CONCEPT_END,
  ADD_SELECTED_CONCEPTS,
  CLEAR_SELECTED_CONCEPTS,
  RESET_ALL
} from '@/store/mutation-types'

const helpers = {
  populateTask(task, concept) {
    Object.assign(task, {
      project_id: concept.project_id
    })
    return task
  },

  populateConcept(concept, personMap) {
    concept.full_name = 'Concept'
    concept.last_comment_date = concept.tasks[0].last_comment_date
    concept.tasks.forEach(task => {
      helpers.populateTask(task, concept)
      // Sort assignees by name
      if (task.assignees.length > 1) {
        task.assignees = task.assignees.sort((a, b) =>
          personMap.get(a).name.localeCompare(personMap.get(b).name)
        )
      }
    })
  }
}

const initialState = {
  concepts: [],
  conceptMap: new Map(),
  displayedConcepts: [],
  conceptSearchText: '',
  conceptSearchQueries: [],
  selectedConcepts: new Map()
}

const state = {
  ...initialState
}

const getters = {
  concepts: state => state.concepts,
  conceptMap: state => state.conceptMap,
  displayedConcepts: state => state.displayedConcepts,
  selectedConcepts: state => state.selectedConcepts
}

const actions = {
  async loadConcepts({ commit, rootGetters }) {
    commit(LOAD_CONCEPTS_START)
    try {
      const personMap = rootGetters.personMap
      const production = rootGetters.currentProduction
      const concepts = await conceptsApi.getConcepts(production)
      commit(LOAD_CONCEPTS_END, { concepts, personMap })
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

  async newConcept({ commit, dispatch, rootGetters }, { form, ...data }) {
    const personMap = rootGetters.personMap
    const production = rootGetters.currentProduction

    // Create Entity
    data.name = crypto.randomUUID() // unique and mandatory field
    data.project_id = production.id
    const concept = await conceptsApi.newConcept(data)

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

    // Assign Task to current User
    const currentUser = rootGetters.user.id
    await dispatch('assignSelectedTasks', {
      personId: currentUser,
      taskIds: [task.id]
    })
    task.assignees = [currentUser]

    concept.tasks = [task]
    concept.preview_file_id = preview.id
    helpers.populateConcept(concept, personMap)

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

  deleteSelectedConcepts({ state, dispatch }) {
    return new Promise((resolve, reject) => {
      let selectedConceptIds = [...state.selectedConcepts.values()]
        .filter(concept => !concept.canceled)
        .map(concept => concept.id)
      if (selectedConceptIds.length === 0) {
        selectedConceptIds = [...state.selectedConcepts.keys()]
      }
      async.eachSeries(
        selectedConceptIds,
        (conceptId, next) => {
          const concept = state.conceptMap.get(conceptId)
          if (concept) {
            dispatch('deleteConcept', concept)
          }
          next()
        },
        err => {
          if (err) reject(err)
          else {
            resolve()
          }
        }
      )
    })
  },

  clearSelectedConcepts({ commit }) {
    commit(CLEAR_SELECTED_CONCEPTS)
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

  [LOAD_CONCEPTS_END](state, { concepts, personMap }) {
    concepts.forEach(concept => {
      helpers.populateConcept(concept, personMap)
    })
    state.concepts = concepts
    state.conceptMap = new Map(
      state.concepts.map(concept => [concept.id, concept])
    )
    state.displayedConcepts = concepts
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
    state.conceptMap = new Map(state.conceptMap) // for reactivity
  },

  [DELETE_CONCEPT_END](state, concept) {
    const conceptIndex = state.concepts.findIndex(({ id }) => id === concept.id)
    if (conceptIndex >= 0) {
      state.concepts.splice(conceptIndex, 1)
    }
    delete state.conceptMap.get(concept.id)
  },

  [ADD_SELECTED_CONCEPTS](state, concepts) {
    concepts.forEach(concept => {
      state.selectedConcepts.set(concept.id, concept)
    })
    state.selectedConcepts = new Map(state.selectedConcepts) // for reactivity
  },

  [CLEAR_SELECTED_CONCEPTS](state) {
    state.selectedConcepts = new Map()
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

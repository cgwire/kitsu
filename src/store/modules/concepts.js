import { v4 as uuidv4 } from 'uuid'

import { sortByName } from '@/lib/sorting'
import conceptsApi from '@/store/api/concepts'
import entitiesApi from '@/store/api/entities'
import tasksApi from '@/store/api/tasks'

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
  LOAD_CONCEPT_FOLDERS_END,
  EDIT_CONCEPT_FOLDER_END,
  DELETE_CONCEPT_FOLDER_END,
  MOVE_CONCEPTS_END,
  UPDATE_CONCEPT_PREVIEW_STATUS,
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
  conceptFolders: [],
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
  conceptFolders: state => state.conceptFolders,
  conceptMap: state => state.conceptMap,
  linkedConcepts: state => state.linkedConcepts,
  selectedConcepts: state => state.selectedConcepts
}

const actions = {
  async loadConcepts({ commit, dispatch, rootGetters }) {
    commit(LOAD_CONCEPTS_START)
    try {
      const production = rootGetters.currentProduction
      const concepts = await conceptsApi.getConcepts(production)
      commit(LOAD_CONCEPTS_END, { concepts })
      // The variants may have been stored after the list was read: the event
      // announcing them then matched no card.
      concepts
        .filter(concept => concept.preview_file_status === 'processing')
        .forEach(concept => {
          dispatch('refreshConceptPreview', concept).catch(console.error)
        })
    } catch (err) {
      commit(LOAD_CONCEPTS_ERROR)
      throw err
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

  async newConcept(
    { commit, dispatch, rootGetters },
    { form, parentId = null }
  ) {
    const production = rootGetters.currentProduction

    // Create Entity
    const entity = {
      name: form.get('file').name + '-' + uuidv4(), // unique and mandatory field
      parent_id: parentId,
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
    concept.preview_file_status = preview.status
    helpers.populateConcept(concept)

    commit(EDIT_CONCEPT_END, concept)
    // The variants may have been stored before the concept was listed: the
    // event announcing them then matched no card.
    if (concept.preview_file_status === 'processing') {
      dispatch('refreshConceptPreview', concept).catch(console.error)
    }
    return concept
  },

  async refreshConceptPreview({ commit }, concept) {
    const preview = await tasksApi.getPreviewFile(concept.preview_file_id)
    commit(UPDATE_CONCEPT_PREVIEW_STATUS, {
      conceptId: concept.id,
      previewFileId: preview.id,
      status: preview.status
    })
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

  async deleteSelectedConcepts({ state, commit, rootGetters }) {
    let selectedConceptIds = [...state.selectedConcepts.values()]
      .filter(concept => !concept.canceled)
      .map(concept => concept.id)
    if (selectedConceptIds.length === 0) {
      selectedConceptIds = [...state.selectedConcepts.keys()]
    }
    const concepts = selectedConceptIds
      .map(conceptId => state.conceptMap.get(conceptId))
      .filter(concept => concept)
    if (concepts.length === 0) return
    await entitiesApi.deleteEntities(
      rootGetters.currentProduction.id,
      concepts.map(concept => concept.id),
      // The unitary concept deletion always forces, so the selection does too:
      // the store drops every concept below, canceled ones included.
      true
    )
    concepts.forEach(concept => {
      commit(DELETE_CONCEPT_END, concept)
    })
  },

  clearSelectedConcepts({ commit }) {
    commit(CLEAR_SELECTED_CONCEPTS)
  },

  async loadConceptFolders({ commit, rootGetters }) {
    const folders = await conceptsApi.getConceptFolders(
      rootGetters.currentProduction
    )
    commit(LOAD_CONCEPT_FOLDERS_END, folders)
  },

  async newConceptFolder({ commit, rootGetters }, name) {
    const folder = await conceptsApi.newConceptFolder(
      rootGetters.currentProduction,
      name
    )
    commit(EDIT_CONCEPT_FOLDER_END, folder)
    return folder
  },

  async editConceptFolder({ commit }, data) {
    const folder = await conceptsApi.updateConceptFolder(data)
    commit(EDIT_CONCEPT_FOLDER_END, folder)
    return folder
  },

  async deleteConceptFolder({ commit }, folder) {
    await conceptsApi.deleteConceptFolder(folder)
    commit(DELETE_CONCEPT_FOLDER_END, folder)
  },

  async moveConcepts({ commit, rootGetters }, { conceptIds, folderId }) {
    const movedIds = await conceptsApi.moveConcepts(
      rootGetters.currentProduction,
      conceptIds,
      folderId
    )
    commit(MOVE_CONCEPTS_END, { conceptIds: movedIds, folderId })
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

  [LOAD_CONCEPT_FOLDERS_END](state, folders) {
    state.conceptFolders = sortByName(folders)
  },

  [EDIT_CONCEPT_FOLDER_END](state, folder) {
    state.conceptFolders = sortByName([
      ...state.conceptFolders.filter(({ id }) => id !== folder.id),
      folder
    ])
  },

  [DELETE_CONCEPT_FOLDER_END](state, folder) {
    state.conceptFolders = state.conceptFolders.filter(
      ({ id }) => id !== folder.id
    )
    state.concepts
      .filter(concept => concept.parent_id === folder.id)
      .forEach(concept => {
        concept.parent_id = null
      })
  },

  [MOVE_CONCEPTS_END](state, { conceptIds, folderId }) {
    state.concepts
      .filter(concept => conceptIds.includes(concept.id))
      .forEach(concept => {
        concept.parent_id = folderId
      })
  },

  [UPDATE_CONCEPT_PREVIEW_STATUS](state, { conceptId, previewFileId, status }) {
    const concept = state.conceptMap.get(conceptId)
    // Two reads can cross: the answer sent before the variants were stored
    // must not undo the one sent after.
    if (
      concept?.preview_file_id === previewFileId &&
      concept.preview_file_status === 'processing'
    ) {
      concept.preview_file_status = status
    }
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

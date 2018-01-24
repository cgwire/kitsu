import peopleApi from '../api/people'
import colors from '../../lib/colors'
import { populateTask } from '../../lib/helpers'
import { sortTasks } from '../../lib/sorting'
import { indexSearch, buildTaskIndex } from '../../lib/indexing'
import taskStatusStore from './taskstatus'
import {
  LOAD_PEOPLE_START,
  LOAD_PEOPLE_ERROR,
  LOAD_PEOPLE_END,

  SHOW_IMPORT_PEOPLE_MODAL,
  HIDE_IMPORT_PEOPLE_MODAL,
  PERSON_CSV_FILE_SELECTED,
  IMPORT_PEOPLE_START,
  IMPORT_PEOPLE_ERROR,
  IMPORT_PEOPLE_END,

  EDIT_PEOPLE_START,
  EDIT_PEOPLE_ERROR,
  EDIT_PEOPLE_END,
  SHOW_EDIT_PEOPLE_MODAL,
  HIDE_EDIT_PEOPLE_MODAL,

  NEW_PEOPLE_END,

  DELETE_PEOPLE_START,
  DELETE_PEOPLE_ERROR,
  DELETE_PEOPLE_END,
  SHOW_DELETE_PEOPLE_MODAL,
  HIDE_DELETE_PEOPLE_MODAL,

  UPLOAD_AVATAR_END,

  LOAD_PERSON_TASKS_END,
  SET_PERSON_TASKS_SEARCH,
  NEW_TASK_COMMENT_END,

  RESET_ALL
} from '../mutation-types'

const helpers = {
  addAdditionalInformation (person) {
    if (person.first_name && person.last_name) {
      person.name = `${person.first_name} ${person.last_name}`
      person.initials = `${person.first_name[0]}${person.last_name[0]}`
    } else if (person.first_name) {
      person.name = person.first_name
      person.initials = person.first_name[0]
    } else if (person.last_name) {
      person.name = person.last_name
      person.initials = person.last_name[0]
    } else {
      person.name = person.email
      person.initials = person.email[0]
    }
    person.initials = person.initials.toUpperCase()
    person.color = colors.fromString(person.name)
    if (person.has_avatar) {
      const randomHash = Math.random().toString(36).substring(7)
      person.avatarPath =
        `/api/pictures/thumbnails/persons/${person.id}` +
        `.png?unique=${randomHash}`
    }
    return person
  },

  getTaskStatus (taskStatusId) {
    return taskStatusStore.state.taskStatusMap[taskStatusId]
  }
}

const state = {
  people: [],
  personMap: {},
  isPeopleLoading: false,
  isPeopleLoadingError: true,

  isImportPeopleModalShown: false,
  isImportPeopleLoading: false,
  isImportPeopleLoadingError: false,

  isEditModalShown: false,
  isEditLoading: false,
  isEditLoadingError: false,
  personToEdit: {},

  isDeleteModalShown: false,
  isDeleteLoading: false,
  isDeleteLoadingError: false,
  personToDelete: undefined,

  personCsvFormData: undefined,

  personTasks: [],
  displayedPersonTasks: [],
  personTasksIndex: {},
  personTasksSearchText: ''
}

const getters = {
  people: state => state.people,
  personMap: state => state.personMap,
  isPeopleLoading: state => state.isPeopleLoading,
  isPeopleLoadingError: state => state.isPeopleLoadingError,

  isImportPeopleModalShown: state => state.isImportPeopleModalShown,
  isImportPeopleLoading: state => state.isImportPeopleLoading,
  isImportPeopleLoadingError: state => state.isImportPeopleLoadingError,

  isDeleteModalShown: state => state.isDeleteModalShown,
  isDeleteLoading: state => state.isDeleteLoading,
  isDeleteLoadingError: state => state.isDeleteLoadingError,
  personToDelete: state => state.personToDelete,

  isEditModalShown: state => state.isEditModalShown,
  isEditLoading: state => state.isEditLoading,
  isEditLoadingError: state => state.isEditLoadingError,
  personToEdit: state => state.personToEdit,

  personCsvFormData: state => state.personCsvFormData,

  displayedPersonTasks: state => state.displayedPersonTasks,
  personTasksSearchText: state => state.personTasksSearchText,

  getPerson: (state, getters) => (id) => state.personMap[id],
  getPersonOptions: state => state.people.map(
    (person) => {
      return {
        label: `${person.first_name} ${person.last_name}`,
        value: person.id
      }
    }
  )
}

const sortPeople = (people) => {
  return people.sort((a, b) => {
    if (a.first_name !== a.last_name) {
      return a.first_name.localeCompare(b.first_name)
    } else {
      return a.last_name.localeCompare(b.last_name)
    }
  })
}

const actions = {

  loadPeople ({ commit, state }, callback) {
    commit(LOAD_PEOPLE_START)
    peopleApi.getPeople((err, people) => {
      if (err) {
        commit(LOAD_PEOPLE_ERROR)
      } else {
        commit(LOAD_PEOPLE_END, people.map((person) => {
          person.departments = person.departments || ''
          return person
        }))
      }
      if (callback) callback(err)
    })
  },

  newPeople ({ commit, state }, payload) {
    commit(EDIT_PEOPLE_START, payload.data)
    peopleApi.newPerson(state.personToEdit, (err, person) => {
      if (err) {
        commit(EDIT_PEOPLE_ERROR)
      } else {
        commit(NEW_PEOPLE_END, person.id)
        commit(EDIT_PEOPLE_END)
        commit(HIDE_EDIT_PEOPLE_MODAL)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  editPeople ({ commit, state }, payload) {
    commit(EDIT_PEOPLE_START, payload.data)
    peopleApi.updatePerson(state.personToEdit, (err, people) => {
      if (err) {
        commit(EDIT_PEOPLE_ERROR)
      } else {
        commit(EDIT_PEOPLE_END)
        commit(HIDE_EDIT_PEOPLE_MODAL)
      }
      if (payload.callback) payload.callback(err)
    })
  },

  deletePeople ({ commit, state }, callback) {
    commit(DELETE_PEOPLE_START)
    peopleApi.deletePerson(state.personToDelete.id, (err, people) => {
      if (err) {
        commit(DELETE_PEOPLE_ERROR)
      } else {
        commit(DELETE_PEOPLE_END)
        commit(HIDE_DELETE_PEOPLE_MODAL)
      }
      if (callback) callback(err)
    })
  },

  uploadPersonFile ({ commit, state }, callback) {
    commit(IMPORT_PEOPLE_START)
    peopleApi.postCsv(state.personCsvFormData, (err) => {
      if (err) {
        commit(IMPORT_PEOPLE_ERROR)
      }
      commit(IMPORT_PEOPLE_END)
      if (callback) callback(err)
    })
  },

  loadPersonTasks ({ commit, state }, { personId, forced, callback }) {
    if (state.personTasks.length === 0 || forced) {
      commit(LOAD_PERSON_TASKS_END, [])
      peopleApi.getPersonTasks(personId, (err, tasks) => {
        if (err) tasks = []
        commit(LOAD_PERSON_TASKS_END, tasks)
        if (callback) callback(err)
      })
    } else {
      if (callback) callback()
    }
  },

  showPersonImportModal ({ commit, state }, personId) {
    commit(SHOW_IMPORT_PEOPLE_MODAL)
  },

  hidePersonImportModal ({ commit, state }, personId) {
    commit(HIDE_IMPORT_PEOPLE_MODAL)
  },

  showPersonEditModal ({ commit, state }, personId) {
    commit(SHOW_EDIT_PEOPLE_MODAL, personId)
  },

  hidePersonEditModal ({ commit, state }, personId) {
    commit(HIDE_EDIT_PEOPLE_MODAL, personId)
  },

  showPersonDeleteModal ({ commit, state }, personId) {
    commit(SHOW_DELETE_PEOPLE_MODAL, personId)
  },

  hidePersonDeleteModal ({ commit, state }, personId) {
    commit(HIDE_DELETE_PEOPLE_MODAL, personId)
  },

  setPersonTasksSearch ({ commit, state }, searchText) {
    commit(SET_PERSON_TASKS_SEARCH, searchText)
  }
}

const mutations = {
  [LOAD_PEOPLE_START] (state) {
    state.isPeopleLoading = true
    state.isPeopleLoadingError = false
    state.personMap = {}
  },

  [LOAD_PEOPLE_ERROR] (state) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = true
  },

  [LOAD_PEOPLE_END] (state, people) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = false
    state.people = sortPeople(people)
    state.people.forEach((person) => {
      person = helpers.addAdditionalInformation(person)
      state.personMap[person.id] = person
    })
  },

  [DELETE_PEOPLE_START] (state) {
    state.isDeleteLoading = true
    state.isDeleteLoadingError = false
  },

  [DELETE_PEOPLE_END] (state) {
    state.isDeleteLoading = false
    const personToDeleteIndex = state.people.findIndex(
      (person) => person.id === state.personToDelete.id
    )
    state.people.splice(personToDeleteIndex, 1)
    delete state.personMap[state.personToDelete.id]
    state.personToDelete = undefined
  },

  [DELETE_PEOPLE_ERROR] (state) {
    state.isDeleteLoading = false
    state.isDeleteLoadingError = true
  },

  [SHOW_DELETE_PEOPLE_MODAL] (state, personId) {
    state.isDeleteModalShown = true
    state.isDeleteLoadingError = false
    state.isDeleteLoading = false
    state.personToDelete = state.people.find(
      (person) => person.id === personId
    )
  },

  [HIDE_DELETE_PEOPLE_MODAL] (state, personId) {
    state.isDeleteModalShown = false
    state.personToDelete = undefined
  },

  [EDIT_PEOPLE_START] (state, data) {
    state.isEditLoading = true
    state.isEditLoadingError = false
    state.personToEdit = Object.assign(state.personToEdit, data)
  },

  [NEW_PEOPLE_END] (state, personId) {
    state.personToEdit.id = personId
  },

  [EDIT_PEOPLE_END] (state) {
    state.isEditLoading = false
    state.isEditLoadingError = false
    const personToEditIndex = state.people.findIndex(
      (person) => person.id === state.personToEdit.id
    )
    state.personToEdit = helpers.addAdditionalInformation(state.personToEdit)
    if (personToEditIndex >= 0) {
      state.people[personToEditIndex] = state.personToEdit
    } else {
      state.people.push(state.personToEdit)
      state.personMap[state.personToEdit.id] = state.personToEdit
      sortPeople(state.people)
    }
    state.personToEdit = {}
  },

  [EDIT_PEOPLE_ERROR] (state) {
    state.isEditLoading = false
    state.isEditLoadingError = true
  },

  [IMPORT_PEOPLE_START] (state, data) {
    state.isImportPeopleLoading = true
    state.isImportPeopleLoadingError = false
  },

  [IMPORT_PEOPLE_END] (state, personId) {
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = false
  },

  [IMPORT_PEOPLE_ERROR] (state) {
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = true
  },

  [SHOW_EDIT_PEOPLE_MODAL] (state, personId) {
    state.isEditModalShown = true
    state.isEditLoadingError = false
    state.isEditLoading = false
    if (personId !== undefined) {
      state.personToEdit = state.people.find(
        (person) => person.id === personId
      )
    } else {
      state.personToEdit = {
        first_name: '',
        last_name: '',
        phone: '',
        email: ''
      }
    }
  },

  [HIDE_EDIT_PEOPLE_MODAL] (state) {
    state.isEditModalShown = false
    state.personToEdit = {}
  },

  [SHOW_IMPORT_PEOPLE_MODAL] (state) {
    state.isImportPeopleModalShown = true
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = false
  },

  [HIDE_IMPORT_PEOPLE_MODAL] (state) {
    state.isImportPeopleModalShown = false
  },

  [PERSON_CSV_FILE_SELECTED] (state, formData) {
    state.personCsvFormData = formData
  },

  [UPLOAD_AVATAR_END] (state, personId) {
    const randomHash = Math.random().toString(36).substring(7)
    const person = state.personMap[personId]
    person.has_avatar = true
    person.avatarPath =
      `/api/pictures/thumbnails/persons/${person.id}` +
      `.png?unique=${randomHash}`
  },

  [LOAD_PERSON_TASKS_END] (state, tasks) {
    tasks.forEach(populateTask)
    state.personTasks = sortTasks(tasks)

    state.personTasksIndex = buildTaskIndex(tasks)
    const searchResult = indexSearch(
      state.personTasksIndex,
      state.personTasksSearchText
    )
    state.displayedPersonTasks = searchResult || state.personTasks
  },

  [SET_PERSON_TASKS_SEARCH] (state, searchText) {
    const searchResult = indexSearch(state.personTasksIndex, searchText)
    state.personTasksSearchText = searchText
    state.displayedPersonTasks = searchResult || state.personTasks
  },

  [NEW_TASK_COMMENT_END] (state, {comment, taskId}) {
    const task = state.personTasks.find((task) => task.id === taskId)

    if (task) {
      const taskStatus = helpers.getTaskStatus(comment.task_status_id)

      Object.assign(task, {
        task_status_id: taskStatus.id,
        task_status_name: taskStatus.name,
        task_status_short_name: taskStatus.short_name,
        task_status_color: taskStatus.color
      })
    }
  },

  [RESET_ALL] (state, people) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = false

    state.isDeleteModalShown = false
    state.isDeleteLoading = false
    state.isDeleteLoadingError = false
    state.personToDelete = {}

    state.isEditModalShown = false
    state.isEditLoading = false
    state.isEditLoadingError = false
    state.personToEdit = {}

    state.isImportModalShown = false
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = false
    state.personCsvFormData = null

    state.people = []
    state.personMap = {}
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  helpers
}

import peopleApi from '@/store/api/people'
import colors from '@/lib/colors'
import { clearSelectionGrid } from '@/lib/selection'
import { populateTask } from '@/lib/models'
import { sortTasks, sortPeople, sortByName } from '@/lib/sorting'
import { indexSearch, buildTaskIndex, buildPeopleIndex } from '@/lib/indexing'
import { applyFilters, getFilters, getKeyWords } from '@/lib/filtering'
import auth from '@/lib/auth'

import taskStatusStore from '@/store/modules/taskstatus'
import taskStore from '@/store/modules/tasks'

import {
  LOAD_PEOPLE_START,
  LOAD_PEOPLE_ERROR,
  LOAD_PEOPLE_END,
  PERSON_CSV_FILE_SELECTED,
  IMPORT_PEOPLE_START,
  IMPORT_PEOPLE_ERROR,
  IMPORT_PEOPLE_END,
  UPLOAD_AVATAR_END,
  CLEAR_AVATAR,
  USER_SAVE_PROFILE_SUCCESS,
  LOAD_PERSON_TASKS_END,
  LOAD_PERSON_DONE_TASKS_END,
  EDIT_PEOPLE_END,
  DELETE_PEOPLE_END,
  SET_PERSON_TASKS_SEARCH,
  SAVE_PERSON_TASKS_SEARCH_END,
  REMOVE_PERSON_TASKS_SEARCH_END,
  NEW_TASK_COMMENT_END,
  ADD_SELECTED_TASK,
  REMOVE_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,
  SET_TIME_SPENT,
  PEOPLE_TIMESHEET_LOADED,
  PERSON_SET_DAY_OFF,
  PERSON_LOAD_TIME_SPENTS_END,
  SET_ORGANISATION,
  SET_PERSON_TASKS_SCROLL_POSITION,
  PEOPLE_SET_DAY_OFFS,
  PEOPLE_SET_DAYS_OFF,
  PEOPLE_SEARCH_CHANGE,
  RESET_ALL,
  REMOVE_PEOPLE_SEARCH_END,
  SAVE_PEOPLE_SEARCH_END,
  DISABLE_TWO_FACTOR_AUTHENTICATION_END
} from '@/store/mutation-types'

const helpers = {
  addAdditionalInformation(person) {
    if (!person) {
      return
    }

    const { email, first_name, last_name } = person

    if (first_name && last_name) {
      person.name = `${first_name} ${last_name}`
      person.initials = `${first_name[0]}${last_name[0]}`
    } else if (first_name) {
      person.name = first_name
      person.initials = first_name[0]
    } else if (last_name) {
      person.name = last_name
      person.initials = last_name[0]
    } else if (email) {
      person.name = email
      person.initials = email[0]
    } else {
      person.name = ''
      person.initials = 'NN'
    }
    person.initials = person.initials.toUpperCase()
    person.color = colors.fromString(person.name)

    if (person.has_avatar) {
      const lastUpdate = person.updated_at || person.created_at
      const timestamp = Date.parse(lastUpdate)
      person.avatarPath = `/api/pictures/thumbnails/persons/${person.id}.png?t=${timestamp}`
    }
    return person
  },

  getTaskStatus(taskStatusId) {
    return taskStatusStore.cache.taskStatusMap.get(taskStatusId)
  },

  buildResult(state, { peopleSearch, departments, persons }) {
    const query = peopleSearch
    const keywords = getKeyWords(query) || []

    const peopleIndex = cache.peopleIndex
    const filters = getFilters({
      entryIndex: peopleIndex,
      departments,
      persons,
      query
    })
    let result = indexSearch(peopleIndex, keywords) || cache.people
    result = applyFilters(result, filters, {})
    result = sortPeople(result)

    state.displayedPeople = result
    state.peopleSearchText = peopleSearch
  }
}

const cache = {
  people: [],
  peopleIndex: {},
  personDoneTasksIndex: {},
  personDoneTasks: [],
  personTasksIndex: {},
  personMap: new Map()
}

const initialState = {
  organisation: {
    name: 'Kitsu',
    hours_by_day: 8,
    has_avatar: false,
    hd_by_default: false,
    timesheets_locked: false,
    use_original_file_name: false,
    format_duration_in_hours: false,
    dark_theme_by_default: false
  },

  people: [],
  displayedPeople: [],
  peopleSearchText: '',
  peopleSearchQueries: [],
  isPeopleLoading: false,
  isPeopleLoadingError: true,

  isImportPeopleLoading: false,
  isImportPeopleLoadingError: false,

  isEditModalShown: false,
  isEditLoading: false,
  isEditLoadingError: false,

  isDeleteModalShown: false,
  isDeleteLoading: false,
  isDeleteLoadingError: false,

  personCsvFormData: undefined,

  person: {},
  personTasks: [],
  displayedPersonTasks: [],
  displayedPersonDoneTasks: [],
  personTasksSearchText: '',
  personTaskSelectionGrid: {},
  personTaskSearchQueries: [],
  personTasksScrollPosition: 0,

  timesheet: {},
  personTimeSpentMap: {},
  personTimeSpentTotal: 0,
  personDayOff: {},
  daysOff: [],
  dayOffMap: {}
}

const state = {
  ...initialState
}

const getters = {
  organisation: state => state.organisation,

  people: state => cache.people,
  peopleWithoutBot: state => cache.people.filter(person => !person.is_bot),
  activePeople: state => cache.people.filter(person => person.active),
  activePeopleWithoutBot: state =>
    cache.people.filter(person => person.active && !person.is_bot),
  displayedPeople: state => state.displayedPeople,
  peopleIndex: state => cache.peopleIndex,
  personMap: state => cache.personMap,
  personEmailMap: state => {
    const emailMap = new Map()
    cache.people.forEach(person => {
      emailMap.set(person.email, person)
    })
    return emailMap
  },
  isPeopleLoading: state => state.isPeopleLoading,
  isPeopleLoadingError: state => state.isPeopleLoadingError,
  peopleSearchQueries: state => state.peopleSearchQueries,
  peopleSearchText: state => state.peopleSearchText,

  isImportPeopleLoading: state => state.isImportPeopleLoading,
  isImportPeopleLoadingError: state => state.isImportPeopleLoadingError,

  isDeleteModalShown: state => state.isDeleteModalShown,
  isDeleteLoading: state => state.isDeleteLoading,
  isDeleteLoadingError: state => state.isDeleteLoadingError,

  isEditModalShown: state => state.isEditModalShown,
  isEditLoading: state => state.isEditLoading,
  isEditLoadingError: state => state.isEditLoadingError,

  personCsvFormData: state => state.personCsvFormData,

  displayedPersonTasks: state => state.displayedPersonTasks,
  displayedPersonDoneTasks: state => state.displayedPersonDoneTasks,
  personTasksSearchText: state => state.personTasksSearchText,
  personTaskSearchQueries: state => state.personTaskSearchQueries,
  personTaskSelectionGrid: state => state.personTaskSelectionGrid,
  personTasksScrollPosition: state => state.personTasksScrollPosition,

  getPerson: state => id => cache.personMap.get(id),

  timesheet: state => state.timesheet,
  personTimeSpentMap: state => state.personTimeSpentMap,
  personTimeSpentTotal: state => state.personTimeSpentTotal,
  personDayOff: state => state.personDayOff,
  personIsDayOff: state => Boolean(state.personDayOff?.id),
  dayOffMap: state => state.dayOffMap,
  daysOff: state => state.daysOff
}

const actions = {
  async getOrganisation({ commit }) {
    const organisations = await peopleApi.getOrganisations()
    commit(SET_ORGANISATION, organisations[0])
  },

  async saveOrganisation({ commit }, form) {
    form.id = state.organisation.id
    const organisation = await peopleApi.updateOrganisation(form)
    commit(SET_ORGANISATION, organisation)
    return organisation
  },

  async uploadOrganisationLogo({ commit, state }, formData) {
    const organisationId = state.organisation.id
    await peopleApi.postOrganisationLogo(organisationId, formData)
    commit(SET_ORGANISATION, { has_avatar: true })
  },

  async deleteOrganisationLogo({ commit, state }) {
    const organisationId = state.organisation.id
    await peopleApi.deleteOrganisationLogo(organisationId)
    commit(SET_ORGANISATION, { has_avatar: false })
  },

  async loadPeople({ commit, rootGetters }) {
    commit(LOAD_PEOPLE_START)
    try {
      const people = await peopleApi.getPeople()
      commit(LOAD_PEOPLE_END, {
        people,
        userFilters: rootGetters.userFilters
      })
    } catch (err) {
      commit(LOAD_PEOPLE_ERROR)
    }
  },

  async loadPerson({ commit }, personId) {
    const person = await peopleApi.getPerson(personId)
    commit(EDIT_PEOPLE_END, person)
  },

  async newPerson({ commit }, data) {
    const person = await peopleApi.createPerson(data)
    commit(EDIT_PEOPLE_END, person)
    return person
  },

  async newPersonAndInvite({ commit }, data) {
    let person = await peopleApi.createPerson(data)
    person = await peopleApi.invitePerson(person)
    commit(EDIT_PEOPLE_END, person)
    return person
  },

  invitePerson({}, person) {
    return peopleApi.invitePerson(person)
  },

  generateToken({}, person) {
    return peopleApi.generateToken(person)
  },

  async uploadPersonAvatar({ commit }, { person, formData }) {
    await peopleApi.postAvatar(person.id, formData)
    commit(UPLOAD_AVATAR_END, person.id)
  },

  async clearPersonAvatar({ commit }, person) {
    await peopleApi.clearPersonAvatar(person)
    commit(CLEAR_AVATAR, person.id)
  },

  async editPerson({ commit }, data) {
    const person = await peopleApi.updatePerson(data)
    commit(EDIT_PEOPLE_END, person)
    return person
  },

  async deletePeople({ commit }, person) {
    await peopleApi.deletePerson(person)
    commit(DELETE_PEOPLE_END)
  },

  async changePasswordPerson({}, { person, form }) {
    if (auth.isPasswordValid(form.password, form.password2)) {
      await peopleApi.changePasswordPerson(person, form)
    } else {
      const err = new Error('Password is not valid')
      err.isValidPassword = false
      throw err
    }
  },

  async disableTwoFactorAuthenticationPerson({ commit }, person) {
    await peopleApi.disableTwoFactorAuthenticationPerson(person)
    commit(DISABLE_TWO_FACTOR_AUTHENTICATION_END, person.id)
  },

  async uploadPersonFile({ commit, state }, toUpdate) {
    commit(IMPORT_PEOPLE_START)
    try {
      await peopleApi.postCsv(state.personCsvFormData, toUpdate)
      commit(IMPORT_PEOPLE_END)
    } catch (err) {
      commit(IMPORT_PEOPLE_ERROR)
      throw err
    }
  },

  async fetchPersonTasks({ commit, rootGetters }, personId) {
    const tasks = (
      await Promise.all([
        peopleApi.getPersonTasks(personId),
        peopleApi.getPersonDoneTasks(personId)
      ])
    ).flat()
    tasks.forEach(task => {
      populateTask(task)
      task.taskStatus = helpers.getTaskStatus(task.task_status_id)
    })

    commit(LOAD_PERSON_TASKS_END, {
      personId,
      tasks,
      userFilters: rootGetters.userFilters,
      taskTypeMap: rootGetters.taskTypeMap
    })

    return tasks
  },

  async loadPersonTasks({ commit, rootGetters }, { personId, date }) {
    const userFilters = rootGetters.userFilters
    const taskTypeMap = rootGetters.taskTypeMap
    commit(LOAD_PERSON_TASKS_END, {
      personId,
      tasks: [],
      userFilters,
      taskTypeMap
    })
    commit(LOAD_PERSON_DONE_TASKS_END, [])

    const [tasks, timeSpents, dayOff] = await Promise.all([
      peopleApi.getPersonTasks(personId).catch(() => []),
      peopleApi.getTimeSpents(personId, date),
      peopleApi.getDayOff(personId, date)
    ])
    commit(PERSON_LOAD_TIME_SPENTS_END, timeSpents || [])
    commit(PERSON_SET_DAY_OFF, dayOff || {})
    commit(LOAD_PERSON_TASKS_END, {
      personId,
      tasks,
      userFilters,
      taskTypeMap
    })
  },

  async loadPersonDoneTasks({ commit }, personId) {
    const doneTasks = await peopleApi
      .getPersonDoneTasks(personId)
      .catch(err => {
        console.error('Error loading done tasks:', err)
        return []
      })
    commit(LOAD_PERSON_DONE_TASKS_END, doneTasks || [])
    return doneTasks
  },

  async loadPersonTimeSpents({ commit }, { personId, date }) {
    const timeSpents = await peopleApi.getTimeSpents(personId, date)
    commit(PERSON_LOAD_TIME_SPENTS_END, timeSpents)
  },

  loadAggregatedPersonTimeSpents(
    {},
    { personId, detailLevel, year, month, week, day, productionId, studioId }
  ) {
    return peopleApi.getAggregatedPersonTimeSpents(
      personId,
      detailLevel,
      year,
      month,
      week,
      day,
      productionId,
      studioId
    )
  },

  loadAggregatedPersonDaysOff(
    {},
    { personId, detailLevel, year, month, week }
  ) {
    if (detailLevel === 'day') {
      return Promise.resolve([])
    } else {
      return peopleApi.getAggregatedPersonDaysOff(
        personId,
        detailLevel,
        year,
        month,
        week
      )
    }
  },

  setPersonTasksSearch({ commit }, searchText) {
    commit(SET_PERSON_TASKS_SEARCH, searchText)
  },

  async savePersonTasksSearch({ commit }, searchQuery) {
    if (
      state.personTaskSearchQueries.some(query => query.name === searchQuery)
    ) {
      return
    }
    searchQuery = await peopleApi.createFilter(
      'persontasks',
      searchQuery,
      searchQuery,
      null,
      null
    )
    commit(SAVE_PERSON_TASKS_SEARCH_END, { searchQuery })
  },

  async removePersonTasksSearch({ commit }, searchQuery) {
    await peopleApi.removeFilter(searchQuery)
    commit(REMOVE_PERSON_TASKS_SEARCH_END, { searchQuery })
  },

  async setTimeSpent({ commit }, { personId, taskId, date, duration }) {
    const timeSpent = await peopleApi.setTimeSpent(
      taskId,
      personId,
      date,
      duration
    )
    commit(SET_TIME_SPENT, timeSpent)
  },

  async setDayOff({ commit }, { id, personId, date, end_date, description }) {
    let dayOff
    if (id) {
      dayOff = await peopleApi.updateDayOff(
        id,
        personId,
        date,
        end_date,
        description
      )
    } else {
      dayOff = await peopleApi.createDayOff(
        personId,
        date,
        end_date,
        description
      )
    }
    commit(PERSON_SET_DAY_OFF, dayOff)
  },

  async unsetDayOff({ commit }, dayOff = null) {
    await peopleApi.deleteDayOff(dayOff || state.personDayOff)
    commit(PERSON_SET_DAY_OFF, {})
  },

  setPersonTasksScrollPosition({ commit }, scrollPosition) {
    commit(SET_PERSON_TASKS_SCROLL_POSITION, scrollPosition)
  },

  async loadTimesheets(
    { commit },
    { detailLevel, year, month, productionId, studioId }
  ) {
    const monthString = String(month).padStart(2, '0')
    let getTableFn
    switch (detailLevel) {
      case 'day':
        getTableFn = peopleApi.getDayTable
        break
      case 'week':
        getTableFn = peopleApi.getWeekTable
        break
      case 'year':
        getTableFn = peopleApi.getYearTable
        break
      default:
        getTableFn = peopleApi.getMonthTable
    }
    const table = await getTableFn(year, monthString, productionId, studioId)
    if (detailLevel === 'day') {
      const dayOffs = await peopleApi.getDaysOff(year, monthString)
      commit(PEOPLE_SET_DAY_OFFS, { dayOffs, month })
    }
    commit(PEOPLE_TIMESHEET_LOADED, table)
  },

  async loadDaysOff({ commit }, { year, month } = {}) {
    month = year && month ? String(month).padStart(2, '0') : undefined
    const daysOff = await peopleApi.getDaysOff(year, month)
    commit(PEOPLE_SET_DAYS_OFF, daysOff)
  },

  setPeopleSearch({ commit, rootGetters }, peopleSearch) {
    commit(PEOPLE_SEARCH_CHANGE, {
      peopleSearch,
      persons: rootGetters.people,
      departments: rootGetters.departments
    })
  },

  async savePeopleSearch({ commit }, searchQuery) {
    if (state.peopleSearchQueries.some(query => query.name === searchQuery)) {
      return
    }
    searchQuery = await peopleApi.createFilter(
      'people',
      searchQuery,
      searchQuery,
      null,
      null
    )
    commit(SAVE_PEOPLE_SEARCH_END, { searchQuery })
  },

  async removePeopleSearch({ commit }, searchQuery) {
    await peopleApi.removeFilter(searchQuery)
    commit(REMOVE_PEOPLE_SEARCH_END, { searchQuery })
  },

  getPersonQuotaShots(
    { rootGetters },
    { taskTypeId, detailLevel, personId, year, month, week, day, computeMode }
  ) {
    const production = rootGetters.currentProduction
    return peopleApi.getPersonQuotaShots(
      production.id,
      taskTypeId,
      personId,
      detailLevel,
      year,
      month,
      week,
      day,
      computeMode
    )
  },

  async loadSalaryScale({ commit }) {
    const scaleEntries = await peopleApi.getSalaryScales()
    const fullScale = {}
    scaleEntries.forEach(
      ({ id, department_id, position, seniority, salary }) => {
        if (!fullScale[department_id]) {
          fullScale[department_id] = {}
        }
        if (!fullScale[department_id][position]) {
          fullScale[department_id][position] = {}
        }
        fullScale[department_id][position][seniority] = { salary, id }
      }
    )
    return fullScale
  },

  async updateSalaryScale({ commit }, salaryScale) {
    await peopleApi.updateSalaryScale(salaryScale)
  }
}

const mutations = {
  [LOAD_PEOPLE_START](state) {
    state.isPeopleLoading = true
    state.isPeopleLoadingError = false
    cache.personMap = new Map()
  },

  [LOAD_PEOPLE_ERROR](state) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = true
  },

  [LOAD_PEOPLE_END](state, { people, userFilters }) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = false
    cache.people = sortPeople(people).map(person => {
      return helpers.addAdditionalInformation(person)
    })
    cache.people.forEach(person => {
      cache.personMap.set(person.id, person)
    })
    state.displayedPeople = cache.people
    cache.peopleIndex = buildPeopleIndex(cache.people)

    state.peopleSearchQueries = userFilters.people?.all || []
  },

  [DELETE_PEOPLE_END](state, person) {
    if (person) {
      const personToDeleteIndex = cache.people.findIndex(
        ({ id }) => id === person.id
      )
      if (personToDeleteIndex >= 0) {
        cache.people.splice(personToDeleteIndex, 1)
      }
      cache.personMap.delete(person.id)
    }
    cache.peopleIndex = buildPeopleIndex(cache.people)
    if (state.peopleSearchText) {
      const keywords = getKeyWords(state.peopleSearchText)
      state.displayedPeople = indexSearch(cache.peopleIndex, keywords)
    } else {
      state.displayedPeople = cache.people
    }
  },

  [EDIT_PEOPLE_END](state, person) {
    person = helpers.addAdditionalInformation(person)
    if (person.name) {
      const personToEditIndex = cache.people.findIndex(
        ({ id }) => id === person.id
      )
      if (personToEditIndex >= 0) {
        cache.people[personToEditIndex] = person
      } else if (!cache.personMap.has(person.id)) {
        cache.people.push(person)
      }
      cache.personMap.set(person.id, person)
      cache.people = sortPeople(cache.people)
      cache.peopleIndex = buildPeopleIndex(cache.people)
      if (state.peopleSearchText) {
        const keywords = getKeyWords(state.peopleSearchText)
        state.displayedPeople = indexSearch(cache.peopleIndex, keywords)
      } else {
        state.displayedPeople = cache.people
      }
    }
  },

  [DISABLE_TWO_FACTOR_AUTHENTICATION_END](state, personId) {
    const person = cache.personMap.get(personId)
    person.totp_enabled = false
    person.email_otp_enabled = false
    person.preferred_two_factor_authentication = null
  },

  [IMPORT_PEOPLE_START](state) {
    state.isImportPeopleLoading = true
    state.isImportPeopleLoadingError = false
  },

  [IMPORT_PEOPLE_END](state) {
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = false
  },

  [IMPORT_PEOPLE_ERROR](state) {
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = true
  },

  [PERSON_CSV_FILE_SELECTED](state, formData) {
    state.personCsvFormData = formData
  },

  [UPLOAD_AVATAR_END](state, personId) {
    const person = cache.personMap.get(personId)
    if (person) {
      const timestamp = Date.now()
      person.avatarPath = `/api/pictures/thumbnails/persons/${person.id}.png?t=${timestamp}`
      person.has_avatar = true
    }
  },

  [CLEAR_AVATAR](state, personId) {
    const person = cache.personMap.get(personId)
    if (person) {
      person.has_avatar = false
    }
  },

  [LOAD_PERSON_TASKS_END](
    state,
    { personId, tasks, userFilters, taskTypeMap }
  ) {
    state.person = cache.personMap.get(personId)

    tasks.forEach(populateTask)
    tasks.forEach(task => {
      const taskStatus = helpers.getTaskStatus(task.task_status_id)
      task.taskStatus = taskStatus
    })
    const personTaskSelectionGrid = {}
    for (let i = 0; i < tasks.length; i++) {
      personTaskSelectionGrid[i] = { 0: false }
    }
    state.personTaskSelectionGrid = personTaskSelectionGrid
    state.personTasks = sortTasks(tasks, taskTypeMap)

    cache.personTasksIndex = buildTaskIndex(tasks)
    const keywords = getKeyWords(state.personTasksSearchText)
    const searchResult = indexSearch(cache.personTasksIndex, keywords)

    state.displayedPersonTasks = searchResult || state.personTasks
    if (userFilters.persontasks && userFilters.persontasks.all) {
      state.personTaskSearchQueries = userFilters.persontasks.all
    } else {
      state.personTaskSearchQueries = []
    }
  },

  [LOAD_PERSON_DONE_TASKS_END](state, tasks) {
    tasks.forEach(populateTask)
    state.displayedPersonDoneTasks = tasks
    cache.personDoneTasks = tasks
    cache.personDoneTasksIndex = buildTaskIndex(tasks)
  },

  [SET_PERSON_TASKS_SEARCH](state, searchText) {
    state.displayedPersonTasks = []
    const keywords = getKeyWords(searchText)
    let searchResult = indexSearch(cache.personTasksIndex, keywords)
    state.personTasksSearchText = searchText
    state.displayedPersonTasks = searchResult || state.personTasks

    searchResult = indexSearch(cache.personDoneTasksIndex, keywords)
    state.displayedPersonDoneTasks = searchResult || cache.personDoneTasks
  },

  [SAVE_PERSON_TASKS_SEARCH_END](state, { searchQuery }) {
    state.personTaskSearchQueries.push(searchQuery)
    state.personTaskSearchQueries = sortByName(state.personTaskSearchQueries)
  },

  [REMOVE_PERSON_TASKS_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.personTaskSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.personTaskSearchQueries.splice(queryIndex, 1)
    }
  },

  [NEW_TASK_COMMENT_END](state, { comment, taskId }) {
    const task = state.personTasks.find(task => task.id === taskId)

    if (task) {
      const taskStatus = helpers.getTaskStatus(comment.task_status_id)

      Object.assign(task, {
        task_status_id: taskStatus.id,
        task_status_name: taskStatus.name,
        task_status_short_name: taskStatus.short_name,
        task_status_color: taskStatus.color
      })

      cache.personTasksIndex = buildTaskIndex(state.personTasks)
      cache.personDoneTasksIndex = buildTaskIndex(cache.personDoneTasks)
    }
  },

  [REMOVE_SELECTED_TASK](state, validationInfo) {
    if (state.personTaskSelectionGrid[validationInfo.x]) {
      state.personTaskSelectionGrid[validationInfo.x][0] = false
    }
  },

  [ADD_SELECTED_TASK](state, validationInfo) {
    if (state.personTaskSelectionGrid[validationInfo.x]) {
      state.personTaskSelectionGrid[validationInfo.x][0] = true
    }
  },

  [CLEAR_SELECTED_TASKS](state, validationInfo) {
    if (
      taskStore.state.nbSelectedValidations > 0 ||
      taskStore.state.nbSelectedTasks > 0
    ) {
      state.personTaskSelectionGrid = clearSelectionGrid(
        state.personTaskSelectionGrid
      )
    }
  },

  [PEOPLE_TIMESHEET_LOADED](state, timesheet) {
    state.timesheet = timesheet
  },

  [SET_TIME_SPENT](state, timeSpent) {
    if (state.person.id === timeSpent.person_id) {
      state.personTimeSpentMap[timeSpent.task_id] = timeSpent
    }
    state.personTimeSpentTotal =
      Object.values(state.personTimeSpentMap).reduce(
        (acc, timeSpent) => timeSpent.duration + acc,
        0
      ) / 60
  },

  [PERSON_LOAD_TIME_SPENTS_END](state, timeSpents) {
    const timeSpentMap = {}
    timeSpents.forEach(timeSpent => {
      timeSpentMap[timeSpent.task_id] = timeSpent
    })
    state.personTimeSpentMap = timeSpentMap

    state.personTimeSpentTotal =
      Object.values(state.personTimeSpentMap).reduce(
        (acc, timeSpent) => timeSpent.duration + acc,
        0
      ) / 60
  },

  [PERSON_SET_DAY_OFF](state, dayOff) {
    state.personDayOff = dayOff
  },

  [PEOPLE_SET_DAYS_OFF](state, daysOff) {
    state.daysOff = daysOff
  },

  [PEOPLE_SET_DAY_OFFS](state, { dayOffs, month }) {
    const dayOffMap = {}
    // Build a map that tells if a day is off. It uses two keys: the person id
    // and the day number.
    dayOffs.forEach(({ person_id, date, end_date }) => {
      if (!dayOffMap[person_id]) {
        dayOffMap[person_id] = {}
      }
      const currentDate = new Date(date)
      const endDate = new Date(end_date)
      while (currentDate <= endDate) {
        if (currentDate.getUTCMonth() + 1 === month) {
          const day = currentDate.toISOString().substring(8, 10)
          dayOffMap[person_id][day] = true
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })
    state.dayOffMap = dayOffMap
  },

  [SET_PERSON_TASKS_SCROLL_POSITION](state, scrollPosition) {
    state.personTasksScrollPosition = scrollPosition
  },

  [PEOPLE_SEARCH_CHANGE](state, payload) {
    helpers.buildResult(state, payload)
  },

  [USER_SAVE_PROFILE_SUCCESS](state, form) {
    // On profile change we need to update the main list.
    const person = cache.personMap.get(form.id)
    if (person) {
      Object.assign(person, form)
      helpers.addAdditionalInformation(person)
    }
  },

  [SET_ORGANISATION](state, organisation) {
    state.organisation = { ...state.organisation, ...organisation }
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
    cache.peopleIndex = {}
    cache.personTasksIndex = {}
    cache.personDoneTasksIndex = {}
    cache.personDoneTasks = []
  },

  [SAVE_PEOPLE_SEARCH_END](state, { searchQuery }) {
    state.peopleSearchQueries.push(searchQuery)
    state.peopleSearchQueries = sortByName(state.peopleSearchQueries)
  },

  [REMOVE_PEOPLE_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.peopleSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.peopleSearchQueries.splice(queryIndex, 1)
    }
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  helpers,
  cache
}

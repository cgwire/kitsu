import Vue from 'vue/dist/vue'
import peopleApi from '@/store/api/people'
import peopleStore from '@/store/modules/people'
import taskStatusStore from '@/store/modules/taskstatus'
import auth from '@/lib/auth'
import { sortTasks, sortByName } from '@/lib/sorting'
import { indexSearch, buildTaskIndex } from '@/lib/indexing'
import { getKeyWords } from '@/lib/filtering'
import { populateTask } from '@/lib/models'
import { buildSelectionGrid, clearSelectionGrid } from '@/lib/selection'

import {
  coercePublicKeyFromJSON,
  coerceCredentialInfoToJSON,
  coerceTwoFactorPayload
} from '@/lib/webauthn'

import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL,
  USER_SAVE_PROFILE_LOADING,
  USER_SAVE_PROFILE_ERROR,
  USER_SAVE_PROFILE_SUCCESS,
  USER_CHANGE_PASSWORD_LOADING,
  USER_CHANGE_PASSWORD_ERROR,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_UNVALID,
  USER_ENABLE_TOTP_SUCCESS,
  USER_DISABLE_TOTP_SUCCESS,
  USER_ENABLE_EMAIL_OTP_SUCCESS,
  USER_DISABLE_EMAIL_OTP_SUCCESS,
  USER_REGISTER_FIDO_SUCCESS,
  USER_UNREGISTER_FIDO_SUCCESS,
  USER_LOAD_TODOS_START,
  USER_LOAD_TODOS_END,
  USER_LOAD_TODOS_ERROR,
  USER_LOAD_DONE_TASKS_END,
  USER_LOAD_TIME_SPENTS_END,
  REGISTER_USER_TASKS,
  PERSON_SET_DAY_OFF,
  SET_TODOS_SEARCH,
  LOAD_USER_FILTERS_END,
  LOAD_USER_FILTERS_ERROR,
  UPDATE_USER_FILTER,
  SAVE_TODO_SEARCH_END,
  REMOVE_TODO_SEARCH_END,
  ADD_SELECTED_TASK,
  REMOVE_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,
  SET_TIME_SPENT,
  UPLOAD_AVATAR_END,
  CHANGE_AVATAR_FILE,
  CLEAR_AVATAR,
  EDIT_PEOPLE_END,
  NEW_TASK_COMMENT_END,
  SET_TODO_LIST_SCROLL_POSITION,
  SAVE_ASSET_SEARCH_END,
  SAVE_SHOT_SEARCH_END,
  REMOVE_ASSET_SEARCH_END,
  LOAD_PRODUCTION_STATUS_END,
  LOAD_DEPARTMENTS_END,
  LOAD_TASK_STATUSES_END,
  LOAD_TASK_TYPES_END,
  LOAD_PEOPLE_END,
  LOAD_CUSTOM_ACTIONS_END,
  LOAD_STATUS_AUTOMATIONS_END,
  LOAD_ASSET_TYPES_END,
  SET_NOTIFICATION_COUNT,
  LOAD_OPEN_PRODUCTIONS_END,
  RESET_ALL,
  SET_CURRENT_PRODUCTION
} from '@/store/mutation-types'

const helpers = {
  getTaskStatus(taskStatusId) {
    return taskStatusStore.state.taskStatusMap.get(taskStatusId)
  }
}

const cache = {
  doneIndex: {},
  doneTasks: [],
  todosIndex: {}
}

const initialState = {
  user: null,
  isAuthenticated: false,

  avatarFormData: null,
  isSaveProfileLoading: false,
  isSaveProfileLoadingError: false,

  changePassword: {
    isLoading: false,
    isError: false,
    isSuccess: false,
    isValid: true
  },

  isTodosLoading: false,
  isTodosLoadingError: false,
  todos: [],
  displayedTodos: [],
  displayedDoneTasks: [],
  todosSearchText: '',
  doneSelectionGrid: {},
  todoSelectionGrid: {},
  todoSearchQueries: [],
  userFilters: {},
  todoListScrollPosition: 0,

  timeSpentMap: {},
  timeSpentTotal: 0
}

const state = {
  ...initialState
}

const getters = {
  user: state => state.user,
  isAuthenticated: state => state.isAuthenticated,
  isCurrentUserManager: state => {
    return state.user && ['admin', 'manager'].includes(state.user.role)
  },
  isCurrentUserAdmin: state => state.user && state.user.role === 'admin',
  isCurrentUserArtist: state => {
    return state.user && ['user', 'vendor'].includes(state.user.role)
  },
  isCurrentUserSupervisor: state =>
    state.user && state.user.role === 'supervisor',
  isCurrentUserClient: state => state.user && state.user.role === 'client',
  isCurrentUserVendor: state => state.user && state.user.role === 'vendor',
  isSaveProfileLoading: state => state.isSaveProfileLoading,
  isSaveProfileLoadingError: state => state.isSaveProfileLoadingError,
  changePassword: state => state.changePassword,

  displayedTodos: state => state.displayedTodos,
  displayedDoneTasks: state => state.displayedDoneTasks,
  doneSelectionGrid: state => state.doneSelectionGrid,
  todosSearchText: state => state.todosSearchText,
  todoSelectionGrid: state => state.todoSelectionGrid,
  todoSearchQueries: state => state.todoSearchQueries,
  userFilters: state => state.userFilters,
  isTodosLoading: state => state.isTodosLoading,
  isTodosLoadingError: state => state.isTodosLoadingError,
  todoListScrollPosition: state => state.todoListScrollPosition,

  timeSpentMap: state => state.timeSpentMap,
  timeSpentTotal: state => state.timeSpentTotal
}

const actions = {
  saveProfile({ commit, state }, payload) {
    commit(USER_SAVE_PROFILE_LOADING)
    peopleApi
      .updatePerson(payload.form)
      .then(() => {
        payload.form.id = state.user.id
        commit(USER_SAVE_PROFILE_SUCCESS, payload.form)
      })
      .catch(err => {
        console.error(err)
        commit(USER_SAVE_PROFILE_ERROR)
      })
  },

  checkNewPasswordValidityAndSave({ commit, state }, { form, callback }) {
    if (auth.isPasswordValid(form.password, form.password2)) {
      actions.changeUserPassword({ commit, state }, { form, callback })
    } else {
      commit(USER_CHANGE_PASSWORD_UNVALID)
      if (callback) callback()
    }
  },

  changeUserPassword({ commit }, payload) {
    commit(USER_CHANGE_PASSWORD_LOADING)
    peopleApi.changePassword(payload.form, err => {
      if (err) {
        commit(USER_CHANGE_PASSWORD_ERROR)
      } else {
        commit(USER_CHANGE_PASSWORD_SUCCESS)
      }
      if (payload.callback) payload.callback()
    })
  },

  preEnableTOTP({ state }) {
    return peopleApi.preEnableTOTP()
  },

  enableTOTP({ commit }, totp) {
    return peopleApi.enableTOTP(totp).then(OTPRecoveryCodes => {
      commit(USER_ENABLE_TOTP_SUCCESS)
      return Promise.resolve(OTPRecoveryCodes)
    })
  },

  disableTOTP({ commit, state }, twoFactorPayload) {
    return peopleApi
      .disableTOTP(coerceTwoFactorPayload(twoFactorPayload))
      .then(() => {
        commit(USER_DISABLE_TOTP_SUCCESS)
        return Promise.resolve()
      })
  },

  preEnableEmailOTP({ commit, state }) {
    return peopleApi.preEnableEmailOTP()
  },

  enableEmailOTP({ commit, state }, otp) {
    return peopleApi.enableEmailOTP(otp).then(OTPRecoveryCodes => {
      commit(USER_ENABLE_EMAIL_OTP_SUCCESS)
      return Promise.resolve(OTPRecoveryCodes)
    })
  },

  sendEmailOTP({ commit, state }, email) {
    return peopleApi.sendEmailOTP(email)
  },

  disableEmailOTP({ commit, state }, twoFactorPayload) {
    return peopleApi
      .disableEmailOTP(coerceTwoFactorPayload(twoFactorPayload))
      .then(() => {
        commit(USER_DISABLE_EMAIL_OTP_SUCCESS)
        return Promise.resolve()
      })
  },

  preRegisterFIDO({ commit, state }) {
    return peopleApi
      .preRegisterFIDO()
      .then(body => Promise.resolve(coercePublicKeyFromJSON(body)))
  },

  registerFIDO({ commit, state }, { registrationResponse, deviceName }) {
    return peopleApi
      .registerFIDO(
        coerceCredentialInfoToJSON(registrationResponse),
        deviceName
      )
      .then(OTPRecoveryCodes => {
        commit(USER_REGISTER_FIDO_SUCCESS, deviceName)
        return Promise.resolve(OTPRecoveryCodes)
      })
  },

  getFIDOChallenge({ commit, state }, email) {
    return peopleApi
      .getFIDOChallenge(email)
      .then(body => Promise.resolve(coercePublicKeyFromJSON(body)))
  },

  unregisterFIDO({ commit, state }, { twoFactorPayload, deviceName }) {
    return peopleApi
      .unregisterFIDO(coerceTwoFactorPayload(twoFactorPayload), deviceName)
      .then(() => {
        commit(USER_UNREGISTER_FIDO_SUCCESS, deviceName)
        return Promise.resolve()
      })
  },

  newRecoveryCodes({ commit, state }, twoFactorPayload) {
    return peopleApi.newRecoveryCodes(coerceTwoFactorPayload(twoFactorPayload))
  },

  loadTodos({ commit, state, rootGetters }, { callback, forced, date }) {
    const userFilters = rootGetters.userFilters
    const taskTypeMap = rootGetters.taskTypeMap

    if (state.todos.length === 0 || forced) {
      commit(USER_LOAD_TODOS_START)
      peopleApi.loadTodos((err, tasks) => {
        if (err) {
          commit(USER_LOAD_TODOS_ERROR)
          if (callback) callback(err)
        } else {
          peopleApi.loadDone((err, doneTasks) => {
            if (err) {
              commit(USER_LOAD_TODOS_ERROR)
            } else {
              commit(USER_LOAD_DONE_TASKS_END, doneTasks)
            }

            return peopleApi
              .loadTimeSpents(date)
              .then(timeSpents => {
                commit(USER_LOAD_TIME_SPENTS_END, timeSpents)
                commit(USER_LOAD_TODOS_END, { tasks, userFilters, taskTypeMap })
                commit(REGISTER_USER_TASKS, { tasks })
                return peopleApi.getDayOff(state.user.id, date)
              })
              .then(dayOff => {
                commit(PERSON_SET_DAY_OFF, dayOff)
                if (callback) callback()
              })
              .catch(err => {
                console.error(err)
                commit(USER_LOAD_TODOS_ERROR)
              })
          })
        }
      })
    } else {
      if (callback) callback()
    }
  },

  loadTasksToCheck({ commit }) {
    return peopleApi.loadTasksToCheck().then(tasks => {
      commit(REGISTER_USER_TASKS, { tasks })
      return Promise.resolve(tasks)
    })
  },

  uploadAvatar({ commit, state }, callback) {
    peopleApi.postAvatar(state.user.id, state.avatarFormData, err => {
      if (!err) commit(UPLOAD_AVATAR_END, state.user.id)
      if (callback) callback(err)
    })
  },

  clearAvatar({ commit, state }) {
    commit(CLEAR_AVATAR)
    return peopleApi.clearAvatar()
  },

  setTodosSearch({ commit, state }, searchText) {
    commit(SET_TODOS_SEARCH, searchText)
  },

  updateSearchFilter({ commit }, searchFilter) {
    commit(UPDATE_USER_FILTER, searchFilter)
    return peopleApi.updateFilter(searchFilter)
  },

  loadUserSearchFilters({ commit }, callback) {
    peopleApi.getUserSearchFilters((err, searchFilters) => {
      if (err) commit(LOAD_USER_FILTERS_ERROR)
      else commit(LOAD_USER_FILTERS_END, searchFilters)
      callback(err)
    })
  },

  saveTodoSearch({ commit, rootGetters }, searchQuery) {
    const query = state.todoSearchQueries.find(
      query => query.name === searchQuery
    )

    if (!query) {
      return peopleApi
        .createFilter('todos', searchQuery, searchQuery, null, null)
        .then(searchQuery => {
          commit(SAVE_TODO_SEARCH_END, { searchQuery })
          return Promise.resolve(searchQuery)
        })
    } else {
      return Promise.resolve()
    }
  },

  removeTodoSearch({ commit, rootGetters }, searchQuery) {
    return peopleApi.removeFilter(searchQuery).then(() => {
      commit(REMOVE_TODO_SEARCH_END, { searchQuery })
      return Promise.resolve(searchQuery)
    })
  },

  setTodoListScrollPosition({ commit, rootGetters }, scrollPosition) {
    commit(SET_TODO_LIST_SCROLL_POSITION, scrollPosition)
  },

  loadContext({ commit, rootGetters }, callback) {
    return peopleApi.getContext().then(context => {
      commit(LOAD_USER_FILTERS_END, context.search_filters)
      commit(LOAD_PRODUCTION_STATUS_END, context.project_status)
      commit(LOAD_DEPARTMENTS_END, context.departments)
      commit(LOAD_TASK_STATUSES_END, context.task_status)
      commit(LOAD_PEOPLE_END, {
        people: context.persons,
        production: rootGetters.currentProduction,
        userFilters: rootGetters.userFilters
      })
      commit(LOAD_CUSTOM_ACTIONS_END, context.custom_actions)
      commit(LOAD_STATUS_AUTOMATIONS_END, context.status_automations)
      commit(LOAD_ASSET_TYPES_END, context.asset_types)
      commit(SET_NOTIFICATION_COUNT, context.notification_count)
      commit(LOAD_OPEN_PRODUCTIONS_END, context.projects)
      if (rootGetters.currentProduction) {
        commit(SET_CURRENT_PRODUCTION, rootGetters.currentProduction.id)
      }
      commit(LOAD_TASK_TYPES_END, context.task_types)
    })
  }
}

const mutations = {
  [USER_LOGIN](state, user) {
    state.user = peopleStore.helpers.addAdditionalInformation(user)
    state.isAuthenticated = true
  },
  [USER_LOGOUT](state, user) {
    state.user = null
    state.isAuthenticated = false
  },
  [USER_LOGIN_FAIL](state, user) {
    state.user = null
    state.isAuthenticated = false
  },

  [USER_SAVE_PROFILE_LOADING](state) {
    state.isSaveProfileLoading = true
    state.isSaveProfileLoadingError = false
  },
  [USER_SAVE_PROFILE_ERROR](state) {
    state.isSaveProfileLoading = false
    state.isSaveProfileLoadingError = true
  },

  [USER_SAVE_PROFILE_SUCCESS](state, form) {
    Object.assign(state.user, form)
    Object.assign(
      state.user,
      peopleStore.helpers.addAdditionalInformation(state.user)
    )
    state.isSaveProfileLoading = false
    state.isSaveProfileLoadingError = false
  },

  [EDIT_PEOPLE_END](state, form) {
    if (state.user && form && state.user.id === form.id) {
      Object.assign(state.user, form)
      Object.assign(
        state.user,
        peopleStore.helpers.addAdditionalInformation(state.user)
      )
    }
  },

  [USER_CHANGE_PASSWORD_LOADING](state) {
    state.changePassword = {
      isLoading: true,
      isError: false,
      isSuccess: false,
      isValid: true
    }
  },
  [USER_CHANGE_PASSWORD_ERROR](state) {
    state.changePassword = {
      isLoading: false,
      isError: true,
      isSuccess: false,
      isValid: true
    }
  },
  [USER_CHANGE_PASSWORD_SUCCESS](state) {
    state.changePassword = {
      isLoading: false,
      isError: false,
      isSuccess: true,
      isValid: true
    }
  },
  [USER_CHANGE_PASSWORD_UNVALID](state) {
    state.changePassword = {
      isLoading: false,
      isError: false,
      isSuccess: false,
      isValid: false
    }
  },

  [USER_ENABLE_TOTP_SUCCESS](state) {
    state.user.totp_enabled = true
    if (!state.user.preferred_two_factor_authentication) {
      state.user.preferred_two_factor_authentication = 'totp'
    }
  },

  [USER_DISABLE_TOTP_SUCCESS](state) {
    state.user.totp_enabled = false
    if (state.user.preferred_two_factor_authentication === 'totp') {
      if (state.user.fido_enabled) {
        state.user.preferred_two_factor_authentication = 'fido'
      } else if (state.user.email_otp_enabled) {
        state.user.preferred_two_factor_authentication = 'email_otp'
      } else {
        state.user.preferred_two_factor_authentication = null
      }
    }
  },

  [USER_ENABLE_EMAIL_OTP_SUCCESS](state) {
    state.user.email_otp_enabled = true
    if (!state.user.preferred_two_factor_authentication) {
      state.user.preferred_two_factor_authentication = 'email_otp'
    }
  },

  [USER_DISABLE_EMAIL_OTP_SUCCESS](state) {
    state.user.email_otp_enabled = false
    if (state.user.preferred_two_factor_authentication === 'email_otp') {
      if (state.user.fido_enabled) {
        state.user.preferred_two_factor_authentication = 'fido'
      } else if (state.user.totp_otp_enabled) {
        state.user.preferred_two_factor_authentication = 'totp'
      } else {
        state.user.preferred_two_factor_authentication = null
      }
    }
  },

  [USER_REGISTER_FIDO_SUCCESS](state, deviceName) {
    state.user.fido_enabled = true
    if (!state.user.preferred_two_factor_authentication) {
      state.user.preferred_two_factor_authentication = 'fido'
    }
    if (typeof state.user.fido_devices === 'undefined') {
      state.user.fido_devices = []
    }
    state.user.fido_devices.push(deviceName)
  },

  [USER_UNREGISTER_FIDO_SUCCESS](state, deviceName) {
    const index = state.user.fido_devices.indexOf(deviceName)
    if (index > -1) {
      state.user.fido_devices.splice(index, 1)
    }
    if (state.user.fido_devices.length === 0) {
      state.user.fido_enabled = false
      if (state.user.preferred_two_factor_authentication === 'fido') {
        if (state.user.email_otp_enabled) {
          state.user.preferred_two_factor_authentication = 'email_otp'
        } else if (state.user.totp_otp_enabled) {
          state.user.preferred_two_factor_authentication = 'totp'
        } else {
          state.user.preferred_two_factor_authentication = null
        }
      }
    }
  },

  [USER_LOAD_TODOS_START](state) {
    state.isTodosLoadingError = false
    state.isTodosLoading = true
    state.timeSpents = {}
    state.timeSpentTotal = 0
  },

  [USER_LOAD_TODOS_END](state, { tasks, userFilters, taskTypeMap }) {
    state.isTodosLoading = false
    tasks.forEach(populateTask)
    tasks.forEach(task => {
      const taskStatus = helpers.getTaskStatus(task.task_status_id)
      task.taskStatus = taskStatus
    })
    state.todoSelectionGrid = buildSelectionGrid(tasks.length, 1)
    state.todos = sortTasks(tasks, taskTypeMap)
    cache.todosIndex = buildTaskIndex(tasks)
    const keywords = getKeyWords(state.todosSearchText)
    const searchResult = indexSearch(cache.todosIndex, keywords)
    state.displayedTodos = (searchResult || state.todos).filter(
      t => !t.entity_canceled
    )
    if (userFilters.todos && userFilters.todos.all) {
      state.todoSearchQueries = userFilters.todos.all
    } else {
      state.todoSearchQueries = []
    }
  },

  [USER_LOAD_DONE_TASKS_END](state, tasks) {
    tasks.forEach(populateTask)
    tasks.forEach(task => {
      const taskStatus = helpers.getTaskStatus(task.task_status_id)
      task.taskStatus = taskStatus
    })
    state.doneSelectionGrid = buildSelectionGrid(tasks.length, 1)
    cache.doneIndex = buildTaskIndex(tasks)
    cache.doneTasks = tasks
    state.displayedDoneTasks = tasks
  },

  [USER_LOAD_TODOS_ERROR](state, tasks) {
    state.isTodosLoadingError = true
  },

  [CHANGE_AVATAR_FILE](state, formData) {
    state.avatarFormData = formData
  },

  [UPLOAD_AVATAR_END](state) {
    if (state.user) {
      const randomHash = Math.random().toString(36).substring(7)
      state.user.has_avatar = true
      Vue.set(state.user, 'uniqueHash', randomHash)
      state.user.avatarPath = `/api/pictures/thumbnails/persons/${state.user.id}.png`
    }
  },

  [NEW_TASK_COMMENT_END](state, { comment, taskId }) {
    const task = state.todos.find(task => task.id === taskId)

    if (task) {
      const taskStatus = helpers.getTaskStatus(comment.task_status_id)

      Object.assign(task, {
        task_status_id: taskStatus.id,
        task_status_name: taskStatus.name,
        task_status_short_name: taskStatus.short_name,
        task_status_color: taskStatus.color,
        last_comment: comment
      })
      cache.todosIndex = buildTaskIndex(state.todos)
      cache.doneIndex = buildTaskIndex(cache.doneTasks)
    }
  },

  [SET_TODOS_SEARCH](state, searchText) {
    const keywords = getKeyWords(searchText)
    let searchResult = indexSearch(cache.todosIndex, keywords)
    state.todosSearchText = searchText
    state.displayedTodos = (searchResult || state.todos).filter(
      t => !t.entity_canceled
    )
    searchResult = indexSearch(cache.doneIndex, keywords)
    state.displayedDoneTasks = searchResult || cache.doneTasks
  },

  [SAVE_TODO_SEARCH_END](state, { searchQuery }) {
    state.todoSearchQueries.push(searchQuery)
    state.todoSearchQueries = sortByName(state.todoSearchQueries)
  },

  [REMOVE_TODO_SEARCH_END](state, { searchQuery }) {
    const queryIndex = state.todoSearchQueries.findIndex(
      query => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.todoSearchQueries.splice(queryIndex, 1)
    }
  },

  [ADD_SELECTED_TASK](state, validationInfo) {
    if (
      validationInfo.done &&
      state.doneSelectionGrid &&
      state.doneSelectionGrid[validationInfo.x]
    ) {
      state.doneSelectionGrid[validationInfo.x][validationInfo.y] = true
    } else if (
      state.todoSelectionGrid &&
      state.todoSelectionGrid[validationInfo.x]
    ) {
      state.todoSelectionGrid[validationInfo.x][validationInfo.y] = true
    }
  },

  [REMOVE_SELECTED_TASK](state, validationInfo) {
    if (
      validationInfo.done &&
      state.doneSelectionGrid &&
      state.doneSelectionGrid[validationInfo.x]
    ) {
      state.doneSelectionGrid[validationInfo.x][validationInfo.y] = false
    } else if (
      state.todoSelectionGrid &&
      state.todoSelectionGrid[validationInfo.x]
    ) {
      state.todoSelectionGrid[validationInfo.x][validationInfo.y] = false
    }
  },

  [CLEAR_SELECTED_TASKS](state) {
    state.todoSelectionGrid = clearSelectionGrid(state.todoSelectionGrid)
    state.doneSelectionGrid = clearSelectionGrid(state.doneSelectionGrid)
  },

  [SET_TODO_LIST_SCROLL_POSITION](state, scrollPosition) {
    state.todoListScrollPosition = scrollPosition
  },

  [LOAD_USER_FILTERS_ERROR](state) {},
  [LOAD_USER_FILTERS_END](state, userFilters) {
    state.userFilters = userFilters
  },
  [UPDATE_USER_FILTER](state, userFilter) {
    Object.keys(state.userFilters).forEach(typeName => {
      Object.keys(state.userFilters[typeName]).forEach(projectId => {
        const projectFilters = state.userFilters[typeName][projectId]
        const filter = projectFilters.find(f => f.id === userFilter.id)
        if (filter) {
          Object.assign(filter, userFilter)
        }
      })
    })
  },

  [SET_TIME_SPENT](state, timeSpent) {
    if (state.user.id === timeSpent.person_id) {
      state.timeSpentMap[timeSpent.task_id] = timeSpent
    }
    state.timeSpentTotal =
      Object.values(state.timeSpentMap).reduce(
        (acc, timeSpent) => timeSpent.duration + acc,
        0
      ) / 60
  },

  [USER_LOAD_TIME_SPENTS_END](state, timeSpents) {
    const timeSpentMap = {}
    timeSpents.forEach(timeSpent => {
      timeSpentMap[timeSpent.task_id] = timeSpent
    })
    state.timeSpentMap = timeSpentMap

    state.timeSpentTotal =
      Object.values(state.timeSpentMap).reduce(
        (acc, timeSpent) => timeSpent.duration + acc,
        0
      ) / 60
  },

  [SAVE_ASSET_SEARCH_END](state, { searchQuery, production }) {
    if (production) {
      if (!state.userFilters.task) state.userFilters.task = {}
      if (!state.userFilters.task[production.id]) {
        state.userFilters.task[production.id] = []
      }
      if (!state.userFilters.task[production.id].includes(searchQuery)) {
        state.userFilters.task[production.id].push(searchQuery)
        state.userFilters.task[production.id] = sortByName(
          state.userFilters.task[production.id]
        )
      }
    }
  },

  [SAVE_SHOT_SEARCH_END](state, { searchQuery, production }) {
    if (!state.userFilters.shot) {
      state.userFilters.shot = {}
    }
    if (!state.userFilters.shot[production.id]) {
      state.userFilters.shot[production.id] = []
    }
    if (!state.userFilters.shot[production.id].includes(searchQuery)) {
      state.userFilters.shot[production.id].push(searchQuery)
      state.userFilters.shot[production.id] = sortByName(
        state.userFilters.shot[production.id]
      )
    }
  },

  [REMOVE_ASSET_SEARCH_END](state) {},

  [CLEAR_AVATAR](state) {
    state.user.has_avatar = false
  },

  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
    cache.doneIndex = {}
    cache.todosIndex = {}
    cache.doneTasks = []
  }
}

export default {
  namespace: true,
  state,
  getters,
  actions,
  mutations
}

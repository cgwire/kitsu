import client from './client'

export default {

  getOrganisation () {
    return client.pget('/api/data/organisations')
      .then(organisations => {
        let organisation = {
          name: 'Kitsu',
          hours_by_day: 8,
          has_avatar: false,
          use_original_file_name: false,
          timesheets_locked: false,
          chat_token_slack: '',
          chat_webhook_mattermost: ''
        }
        if (organisations.length > 0) organisation = organisations[0]
        organisation.use_original_file_name =
          organisation.use_original_file_name ? 'true' : 'false'
        organisation.timesheets_locked =
          organisation.timesheets_locked ? 'true' : 'false'
        Promise.resolve(organisation)
      })
  },

  updateOrganisation (organisation) {
    const data = {
      name: organisation.name,
      hours_by_day: organisation.hours_by_day,
      timesheets_locked: organisation.timesheets_locked === 'true',
      use_original_file_name: organisation.use_original_file_name === 'true',
      hd_by_default: organisation.hd_by_default === 'true',
      chat_token_slack: organisation.chat_token_slack,
      chat_webhook_mattermost: organisation.chat_webhook_mattermost
    }
    return client.pput(`/api/data/organisations/${organisation.id}`, data)
  },

  postOrganisationLogo (organisationId, formData) {
    return client.ppost(
      `/api/pictures/thumbnails/organisations/${organisationId}`,
      formData
    )
  },

  getPeople (callback) {
    client.get('/api/data/persons?relations=true', callback)
  },

  getPerson (personId, callback) {
    client.get(`/api/data/persons/${personId}`, callback)
  },

  createPerson (person) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email.trim(),
      phone: person.phone,
      role: person.role,
      active: person.active,
      departments: person.departments
    }
    return client.ppost('/api/data/persons/new', data)
  },

  invitePerson (person) {
    return client.pget(`/api/actions/persons/${person.id}/invite`)
  },

  updatePerson (person) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email.trim(),
      phone: person.phone,
      timezone: person.timezone,
      locale: person.locale,
      role: person.role,
      active: person.active,
      notifications_enabled: person.notifications_enabled === 'true',
      notifications_slack_enabled: person.notifications_slack_enabled === 'true',
      notifications_slack_userid: person.notifications_slack_userid,
      notifications_mattermost_enabled: person.notifications_mattermost_enabled === 'true',
      notifications_mattermost_userid: person.notifications_mattermost_userid,
      departments: person.departments
    }
    return client.pput(`/api/data/persons/${person.id}`, data)
  },

  deletePerson (person, callback) {
    return client.pdel(`/api/data/persons/${person.id}?force=true`)
  },

  postCsv (formData, toUpdate) {
    let path = '/api/import/csv/persons'
    if (toUpdate) path += '?update=true'
    return client.ppost(path, formData)
  },

  postAvatar (userId, formData, callback) {
    client.post(
      `/api/pictures/thumbnails/persons/${userId}`,
      formData,
      callback
    )
  },

  changePassword (form, callback) {
    const data = {
      old_password: form.oldPassword,
      password: form.password,
      password_2: form.password2
    }
    client.post('/api/auth/change-password', data, callback)
  },

  loadTodos (callback) {
    client.get('/api/data/user/tasks', callback)
  },

  loadDone (callback) {
    client.get('/api/data/user/done-tasks', callback)
  },

  loadTimeSpents (date) {
    return client.pget(`/api/data/user/time-spents/${date}`)
  },

  getPersonTasks (personId, callback) {
    client.get(`/api/data/persons/${personId}/tasks`, callback)
  },

  getPersonDoneTasks (personId, callback) {
    client.get(`/api/data/persons/${personId}/done-tasks`, callback)
  },

  getUserSearchFilters (callback) {
    client.get('/api/data/user/filters', callback)
  },

  updateFilter (searchFilter) {
    const data = {
      name: searchFilter.name,
      search_query: searchFilter.search_query
    }
    return client.pput(`/api/data/user/filters/${searchFilter.id}`, data)
  },

  createFilter (listType, name, query, productionId, entityType, callback) {
    const data = {
      list_type: listType,
      name,
      query: query,
      entity_type: entityType,
      project_id: productionId
    }
    client.post('/api/data/user/filters', data, callback)
  },

  removeFilter (searchFilter, callback) {
    return client.pdel(`/api/data/user/filters/${searchFilter.id}`)
  },

  getTimeSpents (personId, date) {
    // Date is a string with following format: YYYYY-MM-DD.
    return client.pget(`/api/data/persons/${personId}/time-spents/${date}`)
  },

  setTimeSpent (taskId, personId, date, hours) {
    // Date is a string with following format: YYYYY-MM-DD.
    const data = {
      duration: hours * 60
    }
    return client.ppost(
      `/api/actions/tasks/${taskId}/time-spents/${date}/persons/${personId}`,
      data
    )
  },

  getDayOff (personId, date) {
    // Date is a string with following format: YYYYY-MM-DD.
    return client.pget(`/api/data/persons/${personId}/day-offs/${date}`)
  },

  setDayOff (personId, date) {
    // Date is a string with following format: YYYYY-MM-DD.
    return client.ppost('/api/data/day-offs', { person_id: personId, date })
  },

  getDayOffs (year, month) {
    const path = `/api/data/persons/day-offs/${year}/${month}`
    return client.pget(path)
  },

  unsetDayOff (dayOff) {
    return client.pdel(`/api/data/day-offs/${dayOff.id}`)
  },

  getAggregatedPersonDaysOff (
    personId,
    detailLevel,
    year,
    month,
    week
  ) {
    let path = `/api/data/persons/${personId}/day-offs/`

    if (detailLevel === 'year') {
      path += `year/${year}`
    } else if (detailLevel === 'month') {
      path += `month/${year}/${month}`
    } else if (detailLevel === 'week') {
      path += `week/${year}/${week}`
    }
    return client.pget(path)
  },

  getDayTable (year, month, productionId) {
    let path = `/api/data/persons/time-spents/day-table/${year}/${month}`
    if (productionId) path += `?project_id=${productionId}`
    return client.pget(path)
  },

  getWeekTable (year, month, productionId) {
    let path = `/api/data/persons/time-spents/week-table/${year}`
    if (productionId) path += `?project_id=${productionId}`
    return client.pget(path)
  },

  getMonthTable (year, month, productionId) {
    let path = `/api/data/persons/time-spents/month-table/${year}`
    if (productionId) path += `?project_id=${productionId}`
    return client.pget(path)
  },

  getYearTable (year, month, productionId) {
    let path = '/api/data/persons/time-spents/year-table'
    if (productionId) path += `?project_id=${productionId}`
    return client.pget(path)
  },

  getAggregatedPersonTimeSpents (
    personId,
    detailLevel,
    year,
    month,
    week,
    day,
    productionId
  ) {
    let path = `/api/data/persons/${personId}/time-spents/`

    if (detailLevel === 'year') {
      path += `year/${year}`
    } else if (detailLevel === 'month') {
      path += `month/${year}/${month}`
    } else if (detailLevel === 'week') {
      path += `week/${year}/${week}`
    } else {
      path += `day/${year}/${month}/${day}`
    }

    if (productionId) {
      path += `?project_id=${productionId}`
    }

    return client.pget(path)
  },

  getPersonQuotaShots (
    productionId,
    taskTypeId,
    personId,
    detailLevel,
    year,
    month,
    week,
    day
  ) {
    let path = `/api/data/persons/${personId}/quota-shots/`

    if (detailLevel === 'year') {
      path += `year/${year}`
    } else if (detailLevel === 'month') {
      path += `month/${year}/${month}`
    } else if (detailLevel === 'week') {
      path += `week/${year}/${week}`
    } else {
      path += `day/${year}/${month}/${day}`
    }

    if (productionId) {
      path += `?project_id=${productionId}`
    }

    if (taskTypeId) {
      if (!productionId) path += '?'
      else path += '&'
      path += `&task_type_id=${taskTypeId}`
    }

    return client.pget(path)
  },

  getContext () {
    return client.pget('/api/data/user/context')
  }
}

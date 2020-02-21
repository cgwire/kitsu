import client from './client'

export default {

  getOrganisation () {
    return new Promise((resolve, reject) => {
      client.get('/api/data/organisations', (err, organisations) => {
        if (err) reject(err)
        else {
          let organisation = {
            name: 'Kitsu',
            hours_by_day: 8,
            has_avatar: false,
            use_original_file_name: false,
            chat_token_slack: ''
          }
          if (organisations.length > 0) organisation = organisations[0]
          organisation.use_original_file_name =
            organisation.use_original_file_name ? 'true' : 'false'
          resolve(organisation)
        }
      })
    })
  },

  updateOrganisation (organisation) {
    return new Promise((resolve, reject) => {
      const data = {
        name: organisation.name,
        hours_by_day: organisation.hours_by_day,
        use_original_file_name: organisation.use_original_file_name === 'true',
        chat_token_slack: organisation.chat_token_slack
      }
      client.put(
        `/api/data/organisations/${organisation.id}`,
        data,
        (err, organisation) => {
          if (err) reject(err)
          else resolve(organisation)
        }
      )
    })
  },

  postOrganisationLogo (organisationId, formData) {
    return new Promise((resolve, reject) => {
      client.post(
        `/api/pictures/thumbnails/organisations/${organisationId}`,
        formData,
        (err, organisation) => {
          if (err) reject(err)
          else resolve(organisation)
        }
      )
    })
  },

  getPeople (callback) {
    client.get('/api/data/persons', callback)
  },

  getPerson (personId, callback) {
    client.get(`/api/data/persons/${personId}`, callback)
  },

  newPerson (person) {
    return new Promise((resolve, reject) => {
      const data = {
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email.trim(),
        phone: person.phone,
        role: person.role,
        active: person.active
      }
      client.post('/api/data/persons/new', data, (err, person) => {
        if (err) reject(err)
        else resolve(person)
      })
    })
  },

  invitePerson (person) {
    return new Promise((resolve, reject) => {
      client.get(`/api/actions/persons/${person.id}/invite`, (err) => {
        if (err) reject(err)
        else resolve(person)
      })
    })
  },

  updatePerson (person) {
    return new Promise((resolve, reject) => {
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
        notifications_slack_userid: person.notifications_slack_userid
      }
      client.put(`/api/data/persons/${person.id}`, data, (err, person) => {
        if (err) reject(err)
        else resolve(person)
      })
    })
  },

  deletePerson (personId, callback) {
    client.del(`/api/data/persons/${personId}?force=true`, callback)
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

  loadTimeSpents (date, callback) {
    client.get(`/api/data/user/time-spents/${date}`, callback)
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

  removeFilter (searchQuery, callback) {
    client.del(`/api/data/user/filters/${searchQuery.id}`, callback)
  },

  getTimeSpents (personId, date, callback) {
    // Date is a string with following format: YYYYY-MM-DD.
    client.get(`/api/data/persons/${personId}/time-spents/${date}`, callback)
  },

  setTimeSpent (taskId, personId, date, hours, callback) {
    // Date is a string with following format: YYYYY-MM-DD.
    const data = {
      duration: hours * 60
    }
    client.post(
      `/api/actions/tasks/${taskId}/time-spents/${date}/persons/${personId}`,
      data,
      callback
    )
  },

  getDayTable (year, month) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/persons/time-spents/day-table/${year}/${month}`,
        (err, table) => {
          if (err) reject(err)
          else resolve(table)
        }
      )
    })
  },

  getWeekTable (year) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/persons/time-spents/week-table/${year}`,
        (err, table) => {
          if (err) reject(err)
          else resolve(table)
        }
      )
    })
  },

  getMonthTable (year) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/persons/time-spents/month-table/${year}`,
        (err, table) => {
          if (err) reject(err)
          else resolve(table)
        }
      )
    })
  },

  getYearTable (year) {
    return client.pget('/api/data/persons/time-spents/year-table')
  },

  getAggregatedPersonTimeSpents (
    personId,
    detailLevel,
    year,
    month,
    week,
    day
  ) {
    return new Promise((resolve, reject) => {
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

      client.get(path, (err, tasks) => {
        if (err) reject(err)
        else resolve(tasks)
      })
    })
  },

  getContext () {
    return client.pget('/api/data/user/context')
  }
}

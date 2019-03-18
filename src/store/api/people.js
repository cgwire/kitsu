import client from './client'

export default {

  getPeople (callback) {
    client.get('/api/data/persons', callback)
  },

  getPerson (personId, callback) {
    client.get(`/api/data/persons/${personId}`, callback)
  },

  newPerson (person, callback) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email.trim(),
      phone: person.phone,
      role: person.role,
      active: person.active
    }
    client.post(`/api/data/persons/new`, data, callback)
  },

  updatePerson (person, callback) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email.trim(),
      phone: person.phone,
      timezone: person.timezone,
      locale: person.locale,
      role: person.role,
      active: person.active
    }
    client.put(`/api/data/persons/${person.id}`, data, callback)
  },

  deletePerson (personId, callback) {
    client.del(`/api/data/persons/${personId}`, callback)
  },

  postCsv (formData, callback) {
    client.post('/api/import/csv/persons', formData, callback)
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

      if (detailLevel === 'month') {
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
  }
}

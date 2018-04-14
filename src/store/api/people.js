import client from './client'

export default {

  getPeople (callback) {
    client.get('/api/data/persons', callback)
  },

  newPerson (person, callback) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      role: person.role
    }
    client.post(`/api/data/persons/new`, data, callback)
  },

  updatePerson (person, callback) {
    const data = {
      first_name: person.first_name,
      last_name: person.last_name,
      email: person.email,
      phone: person.phone,
      timezone: person.timezone,
      locale: person.locale,
      role: person.role
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

  getPersonTasks (personId, callback) {
    client.get(`/api/data/persons/${personId}/tasks`, callback)
  },

  getPersonDoneTasks (personId, callback) {
    client.get(`/api/data/persons/${personId}/done-tasks`, callback)
  },

  getUserSearchFilters (callback) {
    client.get('/api/data/user/filters', callback)
  },

  createFilter (listType, name, query, productionId, callback) {
    const data = {
      list_type: listType,
      name,
      query: query,
      project_id: productionId
    }
    client.post('/api/data/user/filters', data, callback)
  },

  removeFilter (searchQuery, callback) {
    client.del(`/api/data/user/filters/${searchQuery.id}`, callback)
  }
}

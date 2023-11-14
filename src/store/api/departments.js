import client from '@/store/api/client'

export default {
  getDepartments(callback) {
    client.get('/api/data/departments', callback)
  },

  newDepartement(department) {
    const data = {
      name: department.name,
      color: department.color,
      archived: department.archived === 'true'
    }
    return client.ppost('/api/data/departments', data)
  },

  editDepartement(department) {
    const data = {
      name: department.name,
      color: department.color,
      archived: department.archived === 'true'
    }
    return client.pput(`/api/data/departments/${department.id}`, data)
  },

  deleteDepartment(department) {
    return client.pdel(`/api/data/departments/${department.id}`)
  }
}

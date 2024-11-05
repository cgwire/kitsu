import client from '@/store/api/client'

export default {
  getDepartments() {
    return client.pget('/api/data/departments')
  },

  getDepartment(departmentId) {
    return client.pget(`/api/data/departments/${departmentId}`)
  },

  newDepartment(department) {
    const data = {
      name: department.name,
      color: department.color,
      archived: department.archived === 'true'
    }
    return client.ppost('/api/data/departments', data)
  },

  editDepartment(department) {
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

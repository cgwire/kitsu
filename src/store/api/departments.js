import client from '@/store/api/client'

export default {
  getDepartments (callback) {
    client.get('/api/data/departments', callback)
  },

  newDepartement (newDepartement) {
    return client.ppost('/api/data/departments', newDepartement)
  },

  editDepartement (editedDepartement) {
    return client.pput(
      `/api/data/departments/${editedDepartement.id}`, editedDepartement
    )
  },

  deleteDepartment (departementToDelete) {
    return client.pdel(`/api/data/departments/${departementToDelete.id}`)
  }
}

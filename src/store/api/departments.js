import client from './client'

export default {
  getDepartments (callback) {
    client.get('/api/data/departments', callback)
  }
}

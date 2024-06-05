import client from '@/store/api/client'

export default {
  getStudios() {
    return client.pget('/api/data/studios')
  },

  newStudio(studio) {
    const data = {
      name: studio.name,
      color: studio.color,
      archived: studio.archived === 'true'
    }
    return client.ppost('/api/data/studios', data)
  },

  editStudio(studio) {
    const data = {
      name: studio.name,
      color: studio.color,
      archived: studio.archived === 'true'
    }
    return client.pput(`/api/data/studios/${studio.id}`, data)
  },

  deleteStudio(studio) {
    return client.pdel(`/api/data/studios/${studio.id}`)
  }
}

import client from './client'

export default {
  getNotifications (callback) {
    client.get('/api/data/user/notifications', callback)
  },

  getNotification (notificationId, callback) {
    client.get(`/api/data/user/notifications/${notificationId}`, callback)
  }
}

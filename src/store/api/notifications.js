import client from './client'

export default {
  getNotifications (callback) {
    return client.pget('/api/data/user/notifications')
  },

  getNotification (notificationId) {
    return client.pget(`/api/data/user/notifications/${notificationId}`)
  }
}

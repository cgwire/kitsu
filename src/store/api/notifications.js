import client from '@/store/api/client'

export default {
  getNotifications (before) {
    let path = '/api/data/user/notifications'
    if (before) path += `?before=${before}`
    return client.pget(path)
  },

  getNotification (notificationId) {
    return client.pget(`/api/data/user/notifications/${notificationId}`)
  }
}

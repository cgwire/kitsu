import client from '@/store/api/client'
import { buildQueryString } from '@/lib/query'

export default {
  getNotifications(params) {
    const path = buildQueryString('/api/data/user/notifications', params)
    return client.pget(path)
  },

  getNotification(notificationId) {
    return client.pget(`/api/data/user/notifications/${notificationId}`)
  }
}

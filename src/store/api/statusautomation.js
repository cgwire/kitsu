import { formToPayload } from '@/lib/statusautomations'
import client from '@/store/api/client'

export default {
  getStatusAutomations() {
    return client.pget('/api/data/status-automations')
  },

  newStatusAutomation(statusAutomation) {
    return client.ppost(
      '/api/data/status-automations/',
      formToPayload(statusAutomation)
    )
  },

  updateStatusAutomation(statusAutomation) {
    return client.pput(
      `/api/data/status-automations/${statusAutomation.id}`,
      formToPayload(statusAutomation, { isEditing: true })
    )
  },

  deleteStatusAutomation(statusAutomation) {
    return client.pdel(`/api/data/status-automations/${statusAutomation.id}`)
  }
}

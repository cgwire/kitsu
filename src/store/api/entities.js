import client from '@/store/api/client'

export default {
  getEntityNews(entityId) {
    return client.pget(`/api/data/entities/${entityId}/news`)
  },

  getEntityPreviewFiles(entityId) {
    return client.pget(`/api/data/entities/${entityId}/preview-files`)
  },

  getEntityTimeLogs(entityId) {
    return client.pget(`/api/data/entities/${entityId}/time-spents`)
  },

  getEntityChats() {
    return client.pget(`/api/data/user/chats`)
  },

  getChat(entityId) {
    return client.pget(`/api/data/entities/${entityId}/chat`)
  },

  getChatMessages(entityId) {
    return client.pget(`/api/data/entities/${entityId}/chat/messages`)
  },

  getChatMessage(entityId, messageId) {
    return client.pget(
      `/api/data/entities/${entityId}/chat/messages/${messageId}`
    )
  },

  joinChat(entityId) {
    return client.ppost(`/api/actions/user/chats/${entityId}/join`, {})
  },

  leaveChat(entityId) {
    return client.pdel(`/api/actions/user/chats/${entityId}/join`)
  },

  sendMessage(entityId, message, attachments) {
    let data = { message }
    if (attachments?.length) {
      data = new FormData()
      attachments.forEach((attachment, index) => {
        data.append(`file-${index}`, attachment.get('file'))
      })
      data.set('message', message)
    }
    return client.ppost(`/api/data/entities/${entityId}/chat/messages`, data)
  },

  deleteMessage(entityId, messageId) {
    return client.pdel(
      `/api/data/entities/${entityId}/chat/messages/${messageId}`
    )
  }
}

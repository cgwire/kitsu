import entitiesApi from '@/store/api/entities'
import { RESET_ALL } from '@/store/mutation-types'

const initialState = {}

const state = { ...initialState }

const getters = {}

const actions = {
  async getEntityNews({ commit }, entityId) {
    return entitiesApi.getEntityNews(entityId)
  },

  async getEntityPreviewFiles({ commit }, entityId) {
    return entitiesApi.getEntityPreviewFiles(entityId)
  },

  async getEntityTimeLogs({ commit }, entityId) {
    return entitiesApi.getEntityTimeLogs(entityId)
  },

  async getEntityChats({ commit }) {
    return entitiesApi.getEntityChats()
  },

  async getEntityChat({ commit }, entityId) {
    return entitiesApi.getChat(entityId)
  },

  async joinEntityChat({ commit }, entityId) {
    return entitiesApi.joinChat(entityId)
  },

  async leaveEntityChat({ commit }, entityId) {
    return entitiesApi.leaveChat(entityId)
  },

  async sendChatMessage({ commit }, { entityId, message, attachments }) {
    return entitiesApi.sendMessage(entityId, message, attachments)
  },

  async getChatMessage({ commit }, { entityId, messageId }) {
    return entitiesApi.getChatMessage(entityId, messageId)
  },

  async deleteChatMessage({ commit }, { entityId, messageId }) {
    return entitiesApi.deleteMessage(entityId, messageId)
  },

  async getEntityChatMessages({ commit }, entityId) {
    return entitiesApi.getChatMessages(entityId)
  }
}

const mutations = {
  [RESET_ALL](state) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

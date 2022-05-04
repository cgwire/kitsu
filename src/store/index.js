import Vue from 'vue'
import Vuex from 'vuex'

import * as getters from './getters'

import assetTypes from './modules/assettypes'
import assets from './modules/assets'
import breakdown from './modules/breakdown'
import customActions from './modules/customactions'
import statusAutomations from './modules/statusautomation'
import departments from './modules/departments'
import edits from './modules/edits'
import entities from './modules/entities'
import login from './modules/login'
import main from './modules/main'
import news from './modules/news'
import notifications from './modules/notifications'
import people from './modules/people'
import user from './modules/user'
import playlists from './modules/playlists'
import productions from './modules/productions'
import schedule from './modules/schedule'
import shots from './modules/shots'
import taskTypes from './modules/tasktypes'
import taskStatus from './modules/taskstatus'
import tasks from './modules/tasks'

Vue.use(Vuex)

const modules = {
  assetTypes,
  assets,
  breakdown,
  customActions,
  statusAutomations,
  departments,
  edits,
  entities,
  login,
  main,
  people,
  playlists,
  productions,
  news,
  notifications,
  schedule,
  shots,
  tasks,
  taskTypes,
  taskStatus,
  user
}

export default new Vuex.Store({
  getters,
  strict: process.env.NODE_ENV !== 'production',
  modules: modules
})

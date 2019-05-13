import Vue from 'vue'
import Vuex from 'vuex'

import * as getters from './getters'

import assetTypes from './modules/assettypes'
import assets from './modules/assets'
import breakdown from './modules/breakdown'
import customActions from './modules/customactions'
import login from './modules/login'
import main from './modules/main'
import news from './modules/news'
import notifications from './modules/notifications'
import people from './modules/people'
import user from './modules/user'
import playlists from './modules/playlists'
import productions from './modules/productions'
import shots from './modules/shots'
import taskTypes from './modules/tasktypes'
import taskStatus from './modules/taskstatus'
import tasks from './modules/tasks'

Vue.use(Vuex)

let modules = {
  assetTypes,
  assets,
  breakdown,
  customActions,
  login,
  main,
  people,
  playlists,
  productions,
  news,
  notifications,
  shots,
  tasks,
  taskTypes,
  taskStatus,
  user
}

export default new Vuex.Store({
  getters,
  strict: true,
  modules: modules
})

import Vue from 'vue/dist/vue'
import Vuex from 'vuex'

import * as getters from '@/store/getters'

import assetTypes from '@/store/modules/assettypes'
import assets from '@/store/modules/assets'
import breakdown from '@/store/modules/breakdown'
import customActions from '@/store/modules/customactions'
import departments from '@/store/modules/departments'
import edits from '@/store/modules/edits'
import entities from '@/store/modules/entities'
import episodes from '@/store/modules/episodes'
import login from '@/store/modules/login'
import main from '@/store/modules/main'
import news from '@/store/modules/news'
import notifications from '@/store/modules/notifications'
import people from '@/store/modules/people'
import playlists from '@/store/modules/playlists'
import productions from '@/store/modules/productions'
import sequences from '@/store/modules/sequences'
import schedule from '@/store/modules/schedule'
import shots from '@/store/modules/shots'
import statusAutomations from '@/store/modules/statusautomation'
import taskTypes from '@/store/modules/tasktypes'
import taskStatus from '@/store/modules/taskstatus'
import tasks from '@/store/modules/tasks'
import user from '@/store/modules/user'

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
  episodes,
  sequences,
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

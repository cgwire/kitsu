import Vue from 'vue/dist/vue'
import Vuex from 'vuex'

import * as getters from '@/store/getters'

import assets from '@/store/modules/assets'
import assetTypes from '@/store/modules/assettypes'
import backgrounds from '@/store/modules/backgrounds'
import breakdown from '@/store/modules/breakdown'
import concepts from '@/store/modules/concepts'
import customActions from '@/store/modules/customactions'
import departments from '@/store/modules/departments'
import edits from '@/store/modules/edits'
import entities from '@/store/modules/entities'
import episodes from '@/store/modules/episodes'
import files from '@/store/modules/files'
import login from '@/store/modules/login'
import main from '@/store/modules/main'
import news from '@/store/modules/news'
import notifications from '@/store/modules/notifications'
import people from '@/store/modules/people'
import playlists from '@/store/modules/playlists'
import productions from '@/store/modules/productions'
import schedule from '@/store/modules/schedule'
import sequences from '@/store/modules/sequences'
import shots from '@/store/modules/shots'
import statusAutomations from '@/store/modules/statusautomation'
import studios from '@/store/modules/studios'
import taskStatus from '@/store/modules/taskstatus'
import taskTypes from '@/store/modules/tasktypes'
import tasks from '@/store/modules/tasks'
import user from '@/store/modules/user'

Vue.use(Vuex)

const modules = {
  assets,
  assetTypes,
  backgrounds,
  breakdown,
  concepts,
  customActions,
  departments,
  edits,
  entities,
  episodes,
  files,
  login,
  main,
  people,
  playlists,
  productions,
  news,
  notifications,
  schedule,
  sequences,
  shots,
  statusAutomations,
  studios,
  tasks,
  taskTypes,
  taskStatus,
  user
}

export default new Vuex.Store({
  getters,
  strict: process.env.NODE_ENV !== 'production',
  modules
})

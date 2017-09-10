import Vue from 'vue'
import Vuex from 'vuex'

import assetTypes from './modules/assettypes'
import assets from './modules/assets'
import shots from './modules/shots'
import login from './modules/login'
import main from './modules/main'
import people from './modules/people'
import user from './modules/user'
import productions from './modules/productions'
import taskTypes from './modules/tasktypes'
import tasks from './modules/tasks'

Vue.use(Vuex)

let modules = {
  assetTypes,
  assets,
  login,
  main,
  people,
  productions,
  shots,
  taskTypes,
  tasks,
  user
}

export default new Vuex.Store({
  strict: true,
  modules: modules
})

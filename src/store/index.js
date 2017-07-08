import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'

import assetTypes from './modules/assettypes'
import assets from './modules/assets'
import login from './modules/login'
import main from './modules/main'
import people from './modules/people'
import user from './modules/user'
import productions from './modules/productions'
import taskTypes from './modules/tasktypes'

Vue.use(Vuex)

let modules = {
  assetTypes,
  assets,
  login,
  main,
  people,
  productions,
  taskTypes,
  user
}

export default new Vuex.Store({
  actions,
  getters,
  strict: true,
  modules: modules
})

import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import router from './router'
import store from './store'
import App from './App'

Vue.config.productionTip = false

// Make the current route part of the main state.
sync(store, router)

// Global custom directive to enable automatic focus on field after page
// loading.
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

// Start application.
/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  router,
  store
})

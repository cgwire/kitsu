import Vue from 'vue'
import { sync } from 'vuex-router-sync'

Vue.config.productionTip = false

import i18n from './i18n'
import router from './router'
import store from './store'
import App from './App'

// Make the current route part of the main state.
sync(store, router)

// Global custom directive to enable automatic focus on field after page
// loading.
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

Vue.prototype.$locale = {
  change (language) {
    i18n.locale = language
  },
  current () {
    return i18n.locale
  }
}

// Start application.
/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  i18n,
  router,
  store
})

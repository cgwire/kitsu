import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import router from './router'
import i18n from './lib/i18n'
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

// Allow access to i18n object from vue instance.
Vue.prototype.$locale = {
  change (locale) {
    i18n.locale = locale
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

/*
// Realtime update conifguration.
const source = new EventSource('/events')
source.addEventListener('comment:new', function (event) {
  const data = JSON.parse(event.data)
  const commentId = data.data.id
  console.log(commentId)
}, false)
*/

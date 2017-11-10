import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import router from './router'
import vuescroll from 'vue-scroll'
import i18n from './lib/i18n'
import realtime from './lib/realtime'
import store from './store'
import App from './App'
import VueLazyload from 'vue-lazyload'

Vue.config.productionTip = false
Vue.use(vuescroll)
Vue.use(VueLazyload)

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

// Realtime update configuration.
const source = realtime.createNewSource()
realtime.init(source)

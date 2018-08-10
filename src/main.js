import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import router from './router'
import vuescroll from 'vue-scroll'
import i18n from './lib/i18n'
import store from './store'
import App from './App'
import VueLazyload from 'vue-lazyload'
import Meta from 'vue-meta'
import infiniteScroll from 'vue-infinite-scroll'
import VueChartkick from 'vue-chartkick'
import Chart from 'chart.js'
import VueWebsocket from 'vue-websocket'
import VTooltip from 'v-tooltip'
import VueCookie from 'vue-cookie'

Vue.config.productionTip = false
Vue.use(vuescroll)
Vue.use(VueLazyload)
Vue.use(Meta)
Vue.use(infiniteScroll)
Vue.use(VueChartkick, {adapter: Chart})
Vue.use(VueCookie)
Vue.use(VueWebsocket, '/events')
Vue.use(VTooltip)

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

// Catch escape command
document.addEventListener('keyup', (evt) => {
  if (evt.keyCode === 27) {
    store.commit('CLEAR_SELECTED_TASKS')
  }
})

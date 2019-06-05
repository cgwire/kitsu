import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import App from './App'
import i18n from './lib/i18n'
import router from './router'
import store from './store'

import Autocomplete from 'v-autocomplete'
import Chart from 'chart.js'
import Meta from 'vue-meta'
import VueChartkick from 'vue-chartkick'
import VueCookie from 'vue-cookie'
import VueDragDrop from 'vue-drag-drop'
import VueLazyload from 'vue-lazyload'
import vuescroll from 'vue-scroll'
import VueWebsocket from 'vue-websocket'
import VTooltip from 'v-tooltip'

import 'v-autocomplete/dist/v-autocomplete.css'

Vue.config.productionTip = false
Vue.use(Autocomplete)
Vue.use(Meta)
Vue.use(VueChartkick, { adapter: Chart })
Vue.use(VueCookie)
Vue.use(VueLazyload)
Vue.use(vuescroll)
Vue.use(VueDragDrop)
Vue.use(VueWebsocket, '/events')
Vue.use(VTooltip)

// Make the current route part of the main state.
sync(store, router)

// Global custom directive to enable automatic focus on field after page
// loading.
Vue.directive('focus', {
  inserted (el) {
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

Vue.config.keyCodes.backspace = 8

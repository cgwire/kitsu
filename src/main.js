import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import App from './App'
import i18n from './lib/i18n'
import resizableColumn from './lib/resizable-column'
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
import VueTextareaAutosize from 'vue-textarea-autosize'
import VueWebsocket from 'vue-websocket'
import VTooltip from 'v-tooltip'

import 'v-autocomplete/dist/v-autocomplete.css'

Vue.config.productionTip = false
Vue.use(Autocomplete)
Vue.use(Meta)
Vue.use(resizableColumn)
Vue.use(VTooltip)
Vue.use(VueChartkick, { adapter: Chart })
Vue.use(VueCookie)
Vue.use(VueLazyload)
Vue.use(vuescroll)
Vue.use(VueDragDrop)
Vue.use(VueTextareaAutosize)
Vue.use(VueWebsocket, '/events')

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

Vue.config.keyCodes.backspace = 8

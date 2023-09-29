import Vue from 'vue/dist/vue'
import { sync } from 'vuex-router-sync'
import App from '@/App'
import i18n from '@/lib/i18n'
import resizableColumn from '@/directives/resizable-column'
import router from '@/router'
import store from '@/store'
import Autocomplete from 'v-autocomplete'
import Chart from 'chart.js'
import Meta from 'vue-meta'
import VueChartkick from 'vue-chartkick'
import VueDragDrop from 'vue-drag-drop'
import vuescroll from 'vue-scroll'
import VueTextareaAutosize from 'vue-textarea-autosize'
import VueWebsocket from 'vue-websocket-next'
import IO from 'socket.io-client'
import 'v-autocomplete/dist/v-autocomplete.css'
import VueAnimXYZ from '@animxyz/vue'
import '@animxyz/core' // Import css here if you haven't elsewhere

Vue.use(VueWebsocket, IO, '/events')
Vue.config.productionTip = false
Vue.use(Autocomplete)
Vue.use(Meta)
Vue.use(resizableColumn)
Vue.use(VueChartkick, { adapter: Chart })
Vue.use(vuescroll)
Vue.use(VueDragDrop)
Vue.use(VueTextareaAutosize)
Vue.use(VueAnimXYZ)

// Make the current route part of the main state.
sync(store, router)

// Global custom directive to enable automatic focus on field after page
// loading.
Vue.directive('focus', {
  inserted(el, binding) {
    el.focus(binding.value)
  }
})

// Allow access to i18n object from vue instance.
Vue.prototype.$locale = {
  change(locale) {
    i18n.locale = locale
  },
  current() {
    return i18n.locale
  }
}

// Start application.
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  i18n,
  router,
  store
})

Vue.config.keyCodes.backspace = 8

import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import router from './router'
import vuescroll from 'vue-scroll'
import i18n from './lib/i18n'
import realtime from './lib/realtime'
import store from './store'
import App from './App'
import VueLazyload from 'vue-lazyload'
import Meta from 'vue-meta'
import infiniteScroll from 'vue-infinite-scroll'

/* eslint-disable no-unused-vars */
import videojs from 'video.js'
/* eslint-disable no-unused-vars */
import videojsPlaylist from 'videojs-playlist'

Vue.config.productionTip = false
Vue.use(vuescroll)
Vue.use(VueLazyload)
Vue.use(Meta)
Vue.use(infiniteScroll)

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

// Catch escape command
document.addEventListener('keyup', (evt) => {
  if (evt.keyCode === 27) {
    store.commit('CLEAR_SELECTED_TASKS')
  }
})

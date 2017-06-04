import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { sync } from 'vuex-router-sync'

import locales from './locales'
import router from './router'
import store from './store'
import App from './App'

Vue.use(VueI18n)
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

// Localisation
const i18n = new VueI18n({
  locale: 'fr',
  fallbackLocale: 'en',
  messages: locales
})

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

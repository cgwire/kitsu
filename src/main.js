import './polyfills'

import { createApp } from 'vue'
import { createHead, VueHeadMixin } from '@unhead/vue/client'
import { sync } from 'vuex-router-sync'

import 'bulma/css/bulma.css'

import App from '@/App'
import i18n from '@/lib/i18n'
import resizableColumn from '@/directives/resizable-column'
import router from '@/router'
import store from '@/store'

import Autosize from 'v-autosize/src/plugin.js'
import VueChartkick from 'vue-chartkick'
import 'chartkick/chart.js'
import VueWebsocket from 'vue-websocket-next'
import IO from 'socket.io-client'
import VueAnimXYZ from '@animxyz/vue3'
import '@animxyz/core'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const app = createApp({
  components: { App },
  template: '<App/>'
})
const head = createHead()

app.use(i18n)
app.use(head)
app.mixin(VueHeadMixin)
app.use(router)
app.use(store)
app.use(resizableColumn)
app.use(VueWebsocket, IO, '/events')
app.use(Autosize)
app.use(VueChartkick)
app.use(VueAnimXYZ)

app.component('vue-date-picker', VueDatePicker)

// Make the current route part of the main state.
sync(store, router)

// Global custom directive to enable automatic focus on field after page loading.
app.directive('focus', {
  mounted(el, binding) {
    el.focus(binding.value)
  }
})

// Inject the socket into the store.
store.$socket = app.config.globalProperties.$socket

app.config.compilerOptions.whitespace = 'preserve'

app.mount('#app')

import { createApp } from 'vue'
import { sync } from 'vuex-router-sync'

import App from '@/App'
import i18n from '@/lib/i18n'
import resizableColumn from '@/directives/resizable-column'
import router from '@/router'
import store from '@/store'

import Autocomplete from 'v-autocomplete'
import Chart from 'chart.js/auto'
import Meta from 'vue-meta'
import VueChartkick from 'vue-chartkick'
import VueDragDrop from 'vue-drag-drop'
import vuescroll from 'vue-scroll'
import VueTextareaAutosize from 'vue-textarea-autosize'
import VueWebsocket from 'vue-websocket-next'
import IO from 'socket.io-client'
import 'v-autocomplete/dist/v-autocomplete.css'
import VueAnimXYZ from '@animxyz/vue3'
import '@animxyz/core'

const app = createApp({
  components: { App },
  template: '<App/>'
})

app.use(i18n)
app.use(router)
app.use(store)
app.use(resizableColumn)
app.use(VueWebsocket, IO, '/events')
app.use(Autocomplete)
app.use(Meta)
app.use(VueChartkick, { adapter: Chart })
app.use(vuescroll)
app.use(VueDragDrop)
app.use(VueTextareaAutosize)
app.use(VueAnimXYZ)

// Make the current route part of the main state.
sync(store, router)

// Global custom directive to enable automatic focus on field after page loading.
app.directive('focus', {
  mounted(el, binding) {
    el.focus(binding.value)
  }
})

app.config.compilerOptions.whitespace = 'preserve'

app.mount('#app')

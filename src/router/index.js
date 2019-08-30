import Vue from 'vue'
import VueRouter from 'vue-router'
import { routes } from './routes'

Vue.use(VueRouter)

const loadSavedScrollPosition = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition
  } else {
    return { x: 0, y: 0 }
  }
}

export default new VueRouter({
  mode: 'history',
  scrollBehavior: loadSavedScrollPosition,
  routes
})

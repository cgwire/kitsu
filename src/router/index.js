import { createRouter, createWebHistory } from 'vue-router'

import { routes } from '@/router/routes'

const loadSavedScrollPosition = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition
  }
  return { left: 0, top: 0 }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: loadSavedScrollPosition,
  routes
})

export default router

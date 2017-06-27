import auth from './lib/auth'
import lang from './lib/lang'
import store from './store'

import Login from './components/Login'
import Main from './components/Main'
import People from './components/People'
import Productions from './components/Productions'
import Profile from './components/Profile'
import ServerDown from './components/ServerDown'

export const routes = [
  {
    path: '/',
    component: Main,
    beforeEnter: (to, from, next) => {
      auth.requireAuth(to, from, (nextPath) => {
        if (nextPath) {
          next(nextPath)
        } else {
          lang.setLocale(to, from)
          store.dispatch('loadProductionStatus', () => {
            next()
          })
        }
      })
    },
    children: [
      { path: '', component: People },
      { path: '/people', component: People },
      { path: '/people/delete/:person_id', component: People },
      { path: '/people/edit/:person_id', component: People },
      { path: '/people/new', component: People },
      { path: '/people/import', component: People },

      { path: '/productions', component: Productions },
      { path: '/productions/delete/:production_id', component: Productions },
      { path: '/productions/edit/:production_id', component: Productions },
      { path: '/productions/new', component: Productions },

      { path: '/profile', component: Profile }
    ]
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/server-down',
    component: ServerDown
  }
]

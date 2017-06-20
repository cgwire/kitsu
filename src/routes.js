import auth from './lib/auth'
import lang from './lib/lang'

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
          lang.setLocale(to, from, next)
        }
      })
    },
    children: [
      { path: '', component: People },
      { path: '/people', component: People },
      { path: '/people/delete/:person_id', component: People },
      { path: '/people/edit/:person_id', component: People },
      { path: '/people/new', component: People },
      { path: '/people/import', component: Productions },

      { path: '/productions', component: Productions },

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

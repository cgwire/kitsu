import auth from './lib/auth'

import Login from './components/Login'
import Main from './components/Main'
import People from './components/People'
import Profile from './components/Profile'
import ServerDown from './components/ServerDown'

export const routes = [
  {
    path: '/',
    component: Main,
    beforeEnter: auth.requireAuth,
    children: [
      { path: '', component: People },
      { path: '/people', component: People },
      { path: '/people/delete/:person_id', component: People },
      { path: '/people/edit/:person_id', component: People },
      { path: '/people/new', component: People },
      { path: '/people/import', component: People },

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

import auth from './lib/auth'
import lang from './lib/lang'
import store from './store'

import Login from './components/Login'
import Main from './components/Main'
import People from './components/People'
import Productions from './components/Productions'
import Profile from './components/Profile'
import TaskTypes from './components/TaskTypes'
import Assets from './components/Assets'
import AssetTypes from './components/AssetTypes'
import ServerDown from './components/ServerDown'
import NotFound from './components/NotFound'

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
            store.dispatch('loadAssetTypes', () => {
              store.dispatch('loadOpenProductions', () => {
                next()
              })
            })
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

      { path: '/tasks', component: TaskTypes },
      { path: '/tasks/delete/:task_type_id', component: TaskTypes },
      { path: '/tasks/edit/:task_type_id', component: TaskTypes },
      { path: '/tasks/new', component: TaskTypes },

      { path: '/assets', component: Assets },
      { path: '/assets/delete/:asset_id', component: Assets },
      { path: '/assets/edit/:asset_id', component: Assets },
      { path: '/assets/new', component: Assets },
      { path: '/assets/import', component: Assets },

      { path: '/asset-types', component: AssetTypes },
      { path: '/asset-types/delete/:asset_type_id', component: AssetTypes },
      { path: '/asset-types/edit/:asset_type_id', component: AssetTypes },
      { path: '/asset-types/new', component: AssetTypes },

      { path: '/task-types', component: TaskTypes },
      { path: '/task-types/delete/:task_type_id', component: TaskTypes },
      { path: '/task-types/edit/:task_type_id', component: TaskTypes },
      { path: '/task-types/new', component: TaskTypes },

      { path: '/profile', component: Profile }
    ]
  },
  {
    path: '/server-down',
    component: ServerDown
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/*',
    component: NotFound
  }
]

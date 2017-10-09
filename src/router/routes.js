import auth from '../lib/auth'
import lang from '../lib/lang'
import init from '../lib/init'

import Assets from '../components/Assets'
import AssetTypes from '../components/AssetTypes'
import Breakdown from '../components/Breakdown'
import Login from '../components/Login'
import Main from '../components/Main'
import NotFound from '../components/NotFound'
import People from '../components/People'
import Productions from '../components/Productions'
import OpenProductions from '../components/OpenProductions'
import Profile from '../components/Profile'
import Task from '../components/Task'
import TaskTypes from '../components/TaskTypes'
import ServerDown from '../components/ServerDown'
import Shots from '../components/Shots'

export const routes = [
  {
    path: '/',
    component: Main,

    beforeEnter: (to, from, next) => {
      auth.requireAuth(to, from, (nextPath) => {
        if (nextPath) {
          next(nextPath)
        } else {
          lang.setLocale()
          init(next)
        }
      })
    },

    children: [
      { path: '',
        component: OpenProductions,
        name: 'home'
      },
      { path: '/people', component: People },
      { path: '/people/new', component: People },
      { path: '/people/edit/:person_id', component: People },
      { path: '/people/delete/:person_id', component: People },
      { path: '/people/import', component: People },

      { path: '/productions', component: Productions },
      { path: '/productions/new', component: Productions },
      { path: '/productions/edit/:production_id', component: Productions },
      { path: '/productions/delete/:production_id', component: Productions },

      {
        path: '/productions/:production_id/breakdown',
        component: Breakdown,
        name: 'breakdown'
      },
      {
        path: '/productions/:production_id/assets',
        component: Assets,
        name: 'assets'
      },
      {
        path: '/productions/:production_id/assets/new',
        component: Assets,
        name: 'new-asset'
      },
      {
        path:
        '/productions/:production_id/assets/edit/:asset_id',
        component: Assets,
        name: 'edit-asset'
      },
      {
        path: '/productions/:production_id/assets/delete/:asset_id',
        component: Assets,
        name: 'delete-asset'
      },
      {
        path: '/productions/:production_id/assets/import',
        component: Assets,
        name: 'import-assets'
      },
      {
        path: '/productions/:production_id/assets/create-tasks',
        component: Assets,
        name: 'create-asset-tasks'
      },
      {
        path: '/productions/:production_id/shots',
        component: Shots,
        name: 'shots'
      },
      {
        path: '/productions/:production_id/shots/import',
        component: Shots,
        name: 'import-shots'
      },
      {
        path: '/productions/:production_id/shots/create-tasks',
        component: Shots,
        name: 'create-shot-tasks'
      },
      {
        path: '/productions/:production_id/shots/delete/:shot_id',
        component: Shots,
        name: 'delete-shots'
      },

      { path: '/tasks/:task_id', component: Task },
      { path: '/tasks/:task_id/delete', component: Task },
      {
        path: '/tasks/:task_id/comments/:comment_id/add-preview',
        component: Task
      },
      {
        path: '/tasks/:task_id/previews/:preview_id',
        component: Task
      },

      { path: '/asset-types', component: AssetTypes },
      { path: '/asset-types/new', component: AssetTypes },
      { path: '/asset-types/edit/:asset_type_id', component: AssetTypes },
      { path: '/asset-types/delete/:asset_type_id', component: AssetTypes },

      { path: '/task-types', component: TaskTypes },
      { path: '/task-types/new', component: TaskTypes },
      { path: '/task-types/edit/:task_type_id', component: TaskTypes },
      { path: '/task-types/delete/:task_type_id', component: TaskTypes },

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
  },
  {
    path: '/*',
    component: NotFound
  }
]

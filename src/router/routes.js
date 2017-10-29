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
import Todos from '../components/Todos'
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
      {
        name: 'edit-person',
        path: '/people/edit/:person_id',
        component: People
      },
      {
        name: 'delete-person',
        path: '/people/delete/:person_id',
        component: People
      },
      { path: '/people/import', component: People },

      { path: '/productions', component: Productions },
      { path: '/productions/new', component: Productions },
      {
        name: 'edit-production',
        path: '/productions/edit/:production_id',
        component: Productions
      },
      {
        name: 'delete-production',
        path: '/productions/delete/:production_id',
        component: Productions
      },

      {
        path: '/productions/:production_id/breakdown',
        component: Breakdown,
        name: 'breakdown'
      },
      {
        path: '/productions/:production_id/breakdown/shots/:shot_id',
        component: Breakdown,
        name: 'breakdown-shot'
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
        path: '/productions/:production_id/assets/restore/:asset_id',
        component: Assets,
        name: 'restore-asset'
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
        path: '/productions/:production_id/shots/edit/:shot_id',
        component: Shots,
        name: 'edit-shots'
      },
      {
        path: '/productions/:production_id/shots/delete/:shot_id',
        component: Shots,
        name: 'delete-shots'
      },
      {
        path: '/productions/:production_id/shots/restore/:shot_id',
        component: Shots,
        name: 'restore-shots'
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
      {
        name: 'edit-asset-type',
        path: '/asset-types/edit/:asset_type_id',
        component: AssetTypes
      },
      {
        name: 'delete-asset-type',
        path: '/asset-types/delete/:asset_type_id',
        component: AssetTypes
      },

      { path: '/task-types', component: TaskTypes },
      { path: '/task-types/new', component: TaskTypes },
      {
        name: 'edit-task-type',
        path: '/task-types/edit/:task_type_id',
        component: TaskTypes
      },
      {
        name: 'delete-task-type',
        path: '/task-types/delete/:task_type_id',
        component: TaskTypes
      },

      { path: '/todos', component: Todos, name: 'todos' },
      { path: '/profile', component: Profile, name: 'profile' }
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

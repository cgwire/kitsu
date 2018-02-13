import auth from '../lib/auth'
import lang from '../lib/lang'
import init from '../lib/init'

import userStore from '../store/modules/user'
import taskTypeStore from '../store/modules/tasktypes'

import Asset from '../components/Asset'
import Assets from '../components/Assets'
import AssetTypes from '../components/AssetTypes'
import Breakdown from '../components/Breakdown'
import CustomActions from '../components/CustomActions'
import Login from '../components/Login'
import Main from '../components/Main'
import NotFound from '../components/NotFound'
import People from '../components/People'
import Person from '../components/Person'
import Productions from '../components/Productions'
import OpenProductions from '../components/OpenProductions'
import Profile from '../components/Profile'
import Task from '../components/Task'
import TaskTypes from '../components/TaskTypes'
import TaskStatus from '../components/TaskStatus'
import Todos from '../components/Todos'
import ServerDown from '../components/ServerDown'
import Shot from '../components/Shot'
import Shots from '../components/Shots'

export const routes = [

  {
    path: '',
    component: Main,

    beforeEnter: (to, from, next) => {
      auth.requireAuth(to, from, (nextPath) => {
        if (nextPath) {
          next(nextPath)
        } else {
          lang.setLocale()
          init((err) => {
            if (err) {
              next({name: 'server-down'})
            } else {
              if (userStore.getters.isCurrentUserManager(userStore.state)) {
                next({name: 'open-productions'})
              } else {
                next({name: 'todos'})
              }
            }
          })
        }
      })
    }
  },

  {
    path: '/',
    component: Main,

    beforeEnter: (to, from, next) => {
      auth.requireAuth(to, from, (nextPath) => {
        if (nextPath) {
          next(nextPath)
        } else {
          lang.setLocale()
          if (taskTypeStore.state.taskTypes.length === 0) {
            init(next)
          } else {
            next()
          }
        }
      })
    },

    children: [
      {
        path: '',
        name: 'home'
      },
      {
        path: '/open-productions',
        component: OpenProductions,
        name: 'open-productions'
      },
      {
        path: '/open-productions/new',
        component: OpenProductions,
        name: 'open-productions-new'
      },

      { path: '/people', component: People },
      { path: '/people/new', component: People },
      {
        path: '/people/edit/:person_id',
        component: People,
        name: 'edit-person'
      },
      {
        name: 'delete-person',
        path: '/people/delete/:person_id',
        component: People
      },
      {
        path: '/people/import',
        component: People,
        name: 'people'
      },
      {
        path: '/people/:person_id',
        component: Person,
        name: 'person'
      },

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
        '/productions/:production_id/assets/:asset_id',
        component: Asset,
        name: 'asset'
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
        path: '/productions/:production_id/shots/:shot_id',
        component: Shot,
        name: 'shot'
      },
      {
        path: '/productions/:production_id/shots/manage',
        component: Shots,
        name: 'manage-shots'
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

      {
        name: 'task',
        path: '/tasks/:task_id',
        component: Task
      },
      {
        name: 'task-delete',
        path: '/tasks/:task_id/delete',
        component: Task
      },
      {
        name: 'task-add-preview',
        path: '/tasks/:task_id/comments/:comment_id/add-preview',
        component: Task
      },
      {
        name: 'task-preview',
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

      {
        name: 'task-status',
        path: '/task-status',
        component: TaskStatus
      },
      {
        name: 'new-task-status',
        path: '/task-status/new',
        component: TaskStatus
      },
      {
        name: 'edit-task-status',
        path: '/task-status/edit/:task_status_id',
        component: TaskStatus
      },
      {
        name: 'delete-task-status',
        path: '/task-status/delete/:task_status_id',
        component: TaskStatus
      },

      {
        name: 'custom-actions',
        path: '/custom-actions',
        component: CustomActions
      },
      {
        name: 'custom-actions-new',
        path: '/custom-actions/new',
        component: CustomActions
      },
      {
        name: 'edit-custom-action',
        path: '/custom-actions/edit/:custom_action_id',
        component: CustomActions
      },
      {
        name: 'delete-custom-action',
        path: '/custom-actions/delete/:custom_action_id',
        component: CustomActions
      },

      { path: '/todos', component: Todos, name: 'todos' },
      { path: '/profile', component: Profile, name: 'profile' },
      {
        path: '/profile/change-avatar',
        component: Profile,
        name: 'change-avatar'
      }
    ]
  },
  {
    path: '/login',
    component: Login,
    name: 'login'
  },
  {
    path: '/server-down',
    component: ServerDown,
    name: 'server-down'
  },
  {
    path: '/*',
    component: NotFound,
    name: 'not-found'
  }
]

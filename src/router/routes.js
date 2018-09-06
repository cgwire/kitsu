import auth from '../lib/auth'
import lang from '../lib/lang'
import timezone from '../lib/timezone'
import init from '../lib/init'

import userStore from '../store/modules/user'
import taskTypeStore from '../store/modules/tasktypes'
import store from '../store/'

import Asset from '../components/Asset'
import Assets from '../components/Assets'
import AssetTypes from '../components/AssetTypes'
import Breakdown from '../components/Breakdown'
import CustomActions from '../components/CustomActions'
import Episodes from '../components/Episodes'
import Login from '../components/Login'
import Main from '../components/Main'
import NotFound from '../components/NotFound'
import Notifications from '../components/Notifications'
import OpenProductions from '../components/OpenProductions'
import People from '../components/People'
import Person from '../components/Person'
import Productions from '../components/Productions'
import ProductionAssetTypes from '../components/ProductionAssetTypes'
import Playlist from '../components/Playlist'
import Profile from '../components/Profile'
import ResetPassword from '../components/ResetPassword'
import ResetChangePassword from '../components/ResetChangePassword'
import ServerDown from '../components/ServerDown'
import Sequences from '../components/Sequences'
import Shot from '../components/Shot'
import Shots from '../components/Shots'
import TaskType from '../components/TaskType'
import Task from '../components/Task'
import TaskTypes from '../components/TaskTypes'
import TaskStatus from '../components/TaskStatus'
import Timesheets from '../components/Timesheets'
import Todos from '../components/Todos'

export const routes = [

  {
    path: '',
    component: Main,

    beforeEnter: (to, from, next) => {
      auth.requireAuth(to, from, (nextPath) => {
        if (nextPath) {
          next(nextPath)
        } else {
          timezone.setTimezone()
          lang.setLocale()
          if (store.state.productions.openProductions.length === 0) {
            init((err) => {
              if (err) {
                next({name: 'server-down'})
              } else {
                if (!userStore.getters.isCurrentUserCGArtist(userStore.state)) {
                  next({name: 'open-productions'})
                } else {
                  next({name: 'todos'})
                }
              }
            })
          } else {
            if (!userStore.getters.isCurrentUserCGArtist(userStore.state)) {
              next({name: 'open-productions'})
            } else {
              next({name: 'todos'})
            }
          }
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
          timezone.setTimezone()
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

      { path: '/people', component: People, name: 'people' },
      { path: '/people/new', component: People, name: 'new-people' },
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
        name: 'import-people'
      },
      {
        path: '/people/:person_id',
        component: Person,
        name: 'person'
      },
      {
        path: '/people/:person_id/:tab',
        component: Person,
        name: 'person-tab'
      },

      {
        path: '/timesheets',
        component: Timesheets,
        name: 'timesheets'
      },
      {
        path: '/timesheets/month/:year',
        component: Timesheets,
        name: 'timesheets-month'
      },
      {
        path: '/timesheets/month/:year/:month/persons/:person_id',
        component: Timesheets,
        name: 'timesheets-month-person'
      },
      {
        path: '/timesheets/week/:year',
        component: Timesheets,
        name: 'timesheets-week'
      },
      {
        path: '/timesheets/week/:year/:week/persons/:person_id',
        component: Timesheets,
        name: 'timesheets-week-person'
      },
      {
        path: '/timesheets/day/:year/:month',
        component: Timesheets,
        name: 'timesheets-day'
      },
      {
        path: '/timesheets/day/:year/:month/:day/persons/:person_id',
        component: Timesheets,
        name: 'timesheets-day-person'
      },

      {
        path: '/productions',
        component: Productions,
        name: 'productions'
      },
      {
        path: '/productions/new',
        component: Productions,
        name: 'productions-new'
      },
      {
        path: '/productions/edit/:production_id',
        component: Productions,
        name: 'edit-production'
      },
      {
        path: '/productions/delete/:production_id',
        component: Productions,
        name: 'delete-production'
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
        path: '/productions/:production_id/asset-types',
        component: ProductionAssetTypes,
        name: 'production-asset-types'
      },

      {
        path: '/productions/:production_id/shots',
        component: Shots,
        name: 'shots'
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
        path: '/productions/:production_id/shots/:shot_id',
        component: Shot,
        name: 'shot'
      },

      {
        path: '/productions/:production_id/sequences',
        component: Sequences,
        name: 'sequences'
      },
      {
        path: '/productions/:production_id/sequences/edit/:sequence_id',
        component: Sequences,
        name: 'edit-sequence'
      },
      {
        path: '/productions/:production_id/sequences/delete/:sequence_id',
        component: Sequences,
        name: 'delete-sequence'
      },

      {
        path: '/productions/:production_id/episodes',
        component: Episodes,
        name: 'episodes'
      },
      {
        path: '/productions/:production_id/episodes/edit/:episode_id',
        component: Episodes,
        name: 'edit-episode'
      },
      {
        path: '/productions/:production_id/episodes/delete/:episode_id',
        component: Episodes,
        name: 'delete-episode'
      },

      {
        path: '/productions/:production_id/task-types/:task_type_id',
        component: TaskType,
        name: 'task-type'
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
        name: 'task-change-preview',
        path: '/tasks/:task_id/comments/:comment_id/change-preview',
        component: Task
      },
      {
        name: 'task-preview',
        path: '/tasks/:task_id/previews/:preview_id',
        component: Task
      },
      {
        name: 'comment-edit',
        path: '/tasks/:task_id/comments/:comment_id/edit',
        component: Task
      },
      {
        name: 'comment-delete',
        path: '/tasks/:task_id/comments/:comment_id/delete',
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
        name: 'task-types',
        path: '/task-types',
        component: TaskTypes
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
      { path: '/todos/:tab', component: Todos, name: 'todos-tab' },

      { path: '/profile', component: Profile, name: 'profile' },
      {
        path: '/profile/change-avatar',
        component: Profile,
        name: 'change-avatar'
      },

      {
        name: 'playlists',
        path: '/productions/:production_id/playlists',
        component: Playlist
      },
      {
        name: 'playlist',
        path: '/productions/:production_id/playlists/:playlist_id',
        component: Playlist
      },
      {
        name: 'delete-playlist',
        path: '/productions/:production_id/playlists/:playlist_id/delete',
        component: Playlist
      },
      {
        name: 'edit-playlist',
        path: '/productions/:production_id/playlists/:playlist_id/edit',
        component: Playlist
      },

      {
        name: 'notifications',
        path: '/notifications',
        component: Notifications
      }
    ]
  },
  {
    path: '/login',
    component: Login,
    name: 'login'
  },
  {
    path: '/reset-password',
    component: ResetPassword,
    name: 'reset-password'
  },
  {
    path: '/reset-change-password/:token',
    component: ResetChangePassword,
    name: 'reset-change-password'
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

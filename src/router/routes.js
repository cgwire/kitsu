import Bowser from 'bowser'

import auth from '@/lib/auth'
import errors from '@/lib/errors'
import init from '@/lib/init'
import lang from '@/lib/lang'
import sentry from '@/lib/sentry'
import timezone from '@/lib/timezone'

import peopleStore from '@/store/modules/people'
import productionsStore from '@/store/modules/productions'
import taskTypeStore from '@/store/modules/tasktypes'
import userStore from '@/store/modules/user'
import store from '@/store'

import Login from '@/components/pages/Login.vue'
import Main from '@/components/Main.vue'

const AllTasks = () => import('@/components/pages/AllTasks.vue')
const AppLogin = () => import('@/components/pages/AppLogin.vue')
const SharedPlaylist = () => import('@/components/pages/SharedPlaylist.vue')
const Asset = () => import('@/components/pages/Asset.vue')
const AssetLibrary = () => import('@/components/pages/AssetLibrary.vue')
const Assets = () => import('@/components/pages/Assets.vue')
const AssetTypes = () => import('@/components/pages/AssetTypes.vue')
const Backgrounds = () => import('@/components/pages/Backgrounds.vue')
const Bots = () => import('@/components/pages/Bots.vue')
const Breakdown = () => import('@/components/pages/Breakdown.vue')
const Brief = () => import('@/components/pages/Brief.vue')
const Budget = () => import('@/components/pages/budget/Budget.vue')
const Concepts = () => import('@/components/pages/Concepts.vue')
const CustomActions = () => import('@/components/pages/CustomActions.vue')
const Departments = () => import('@/components/pages/Departments.vue')
const Edit = () => import('@/components/pages/Edit.vue')
const Edits = () => import('@/components/pages/Edits.vue')
const EntityChats = () => import('@/components/pages/EntityChats.vue')
const EntitySearch = () => import('@/components/pages/EntitySearch.vue')
const Episode = () => import('@/components/pages/Episode.vue')
const Episodes = () => import('@/components/pages/Episodes.vue')
const EpisodeStats = () => import('@/components/pages/EpisodeStats.vue')
const FirstConnection = () => import('@/components/pages/FirstConnection.vue')
const HardwareItems = () => import('@/components/pages/HardwareItems.vue')
const Login2FA = () => import('@/components/pages/Login2FA.vue')
const Logs = () => import('@/components/pages/Logs.vue')
const MainSchedule = () => import('@/components/pages/MainSchedule.vue')
const MyChecks = () => import('@/components/pages/MyChecks.vue')
const NewProduction = () =>
  import('@/components/pages/production/NewProduction.vue')
const NotFound = () => import('@/components/pages/NotFound.vue')
const Notifications = () => import('@/components/pages/Notifications.vue')
const OpenProductions = () => import('@/components/pages/OpenProductions.vue')
const People = () => import('@/components/pages/People.vue')
const Person = () => import('@/components/pages/Person.vue')
const Playlist = () => import('@/components/pages/Playlist.vue')
const Plugin = () => import('@/components/pages/Plugin.vue')
const ProductionAssetTypes = () =>
  import('@/components/pages/ProductionAssetTypes.vue')
const ProductionNewsFeed = () =>
  import('@/components/pages/ProductionNewsFeed.vue')
const ProductionQuota = () => import('@/components/pages/ProductionQuota.vue')
const Productions = () => import('@/components/pages/Productions.vue')
const ProjectTemplates = () => import('@/components/pages/ProjectTemplates.vue')
const ProjectTemplateSettings = () =>
  import('@/components/pages/ProjectTemplateSettings.vue')
const ProductionSchedule = () =>
  import('@/components/pages/ProductionSchedule.vue')
const ProductionSettings = () =>
  import('@/components/pages/ProductionSettings.vue')
const Profile = () => import('@/components/pages/Profile.vue')
const ResetChangePassword = () =>
  import('@/components/pages/ResetChangePassword.vue')
const ResetPassword = () => import('@/components/pages/ResetPassword.vue')
const SalaryScale = () => import('@/components/pages/budget/SalaryScale.vue')
const Sequence = () => import('@/components/pages/Sequence.vue')
const Sequences = () => import('@/components/pages/Sequences.vue')
const SequenceStats = () => import('@/components/pages/SequenceStats.vue')
const ServerDown = () => import('@/components/pages/ServerDown.vue')
const Settings = () => import('@/components/pages/Settings.vue')
const Shot = () => import('@/components/pages/Shot.vue')
const Shots = () => import('@/components/pages/Shots.vue')
const SoftwareLicenses = () => import('@/components/pages/SoftwareLicenses.vue')
const StatusAutomations = () =>
  import('@/components/pages/StatusAutomations.vue')
const Studios = () => import('@/components/pages/Studios.vue')
const Task = () => import('@/components/pages/Task.vue')
const TaskStatus = () => import('@/components/pages/TaskStatus.vue')
const TaskType = () => import('@/components/pages/TaskType.vue')
const TaskTypes = () => import('@/components/pages/TaskTypes.vue')
const Team = () => import('@/components/pages/Team.vue')
const TeamSchedule = () => import('@/components/pages/TeamSchedule.vue')
const Timesheets = () => import('@/components/pages/Timesheets.vue')
const Todos = () => import('@/components/pages/Todos.vue')
const WrongBrowser = () => import('@/components/pages/WrongBrowser.vue')

// The route state still holds the previous page during a navigation: the
// role is read on the target one.
const isTargetClient = to =>
  userStore.getters.isCurrentUserClient(userStore.state, {}, { route: to })

// Runs on every navigation, as the guard of the main route skips moves
// between its children, such as a production switch.
export const checkClientAccess = to => {
  const isClient = isTargetClient(to)
  if (isClient && to?.matched.some(({ meta }) => meta.forbiddenForClient)) {
    return { name: 'not-found' }
  }
  const { production_id: productionId, episode_id: episodeId } =
    to?.params || {}
  const clientAccess = productionsStore.getters.getClientAccess(
    productionsStore.state,
    {},
    {},
    { isCurrentUserClient: isClient }
  )(productionId)
  const isHidden = to?.matched.some(
    ({ meta }) =>
      (meta.clientAccess === 'stats' && !clientAccess.isStatsVisible) ||
      (meta.clientAccess === 'taskList' && !clientAccess.isTaskListVisible)
  )
  // The production switcher keeps the section: the playlists are always
  // open to clients.
  if (isHidden && episodeId) {
    return {
      name: 'episode-playlists',
      params: { production_id: productionId, episode_id: episodeId }
    }
  } else if (isHidden) {
    return { name: 'playlists', params: { production_id: productionId } }
  }
}

export const routes = [
  {
    path: '',
    name: 'home',
    component: Main,

    beforeEnter: async (to, from) => {
      const browser = Bowser.getParser(window.navigator.userAgent)
      const isValidBrowser = browser.satisfies({
        // see https://vitejs.dev/guide/build.html#browser-compatibility + ES2020 support
        chrome: '>=87',
        firefox: '>=79',
        edge: '>=91',
        vivaldi: '>=3.5',
        opera: '>=73',
        safari: '>=14'
      })
      if (!isValidBrowser) {
        return { name: 'wrong-browser' }
      }

      const redirect = await auth.requireAuth(to, from)
      if (redirect) return redirect

      const ssoRedirect = auth.popSSORedirect()
      if (ssoRedirect) return ssoRedirect

      timezone.setTimezone()
      lang.setLocale(userStore.state.user.locale)
      sentry.setContext(peopleStore.state.organisation, userStore.state.user)

      if (store.state.productions.openProductions.length === 0) {
        try {
          const ready = await init()
          if (!ready) return false
        } catch (err) {
          // The server-down page loads the app again once the server answers,
          // where a bug would fail again on each check: it fails the
          // navigation instead, which Sentry reports.
          if (!errors.isRequestFailure(err)) throw err
          return { name: 'server-down' }
        }
      } else {
        store.commit('DATA_LOADING_END')
      }

      return userStore.getters.isCurrentUserArtist(userStore.state)
        ? { name: 'todos' }
        : { name: 'open-productions' }
    }
  },

  {
    path: '/',
    component: Main,

    beforeEnter: async (to, from) => {
      const redirect = await auth.requireAuth(to, from)
      if (redirect) return redirect

      timezone.setTimezone()
      lang.setLocale(userStore.state.user.locale)
      sentry.setContext(peopleStore.state.organisation, userStore.state.user)

      if (taskTypeStore.state.taskTypes.length === 0) {
        try {
          const ready = await init()
          store.commit('DATA_LOADING_END')
          if (!ready) return false
        } catch (err) {
          store.commit('DATA_LOADING_END')
          // As in the home guard: a bug fails the navigation.
          if (!errors.isRequestFailure(err)) throw err
          return { name: 'server-down', query: { redirect: to.fullPath } }
        }
      } else {
        store.commit('DATA_LOADING_END')
      }

      // After init: it loads the project roles and the production flags.
      const isSupervisorOrManager =
        userStore.getters.isCurrentUserManager(userStore.state) ||
        userStore.getters.isCurrentUserSupervisor(userStore.state)
      const isProhibited =
        (!userStore.getters.isCurrentUserAdmin(userStore.state) &&
          to?.matched.some(record => record.meta.requiresAdmin)) ||
        (!isSupervisorOrManager &&
          to?.matched.some(record => record.meta.requiresSupervisorOrManager))

      if (isProhibited) return { name: 'not-found' }
      return checkClientAccess(to)
    },

    children: [
      {
        path: 'asset-library',
        component: AssetLibrary,
        name: 'asset-library',
        meta: { title: 'library.asset_library', forbiddenForClient: true }
      },

      {
        path: 'asset-types',
        name: 'asset-types',
        meta: { title: 'asset_types.title', requiresAdmin: true },
        component: AssetTypes
      },

      {
        path: 'backgrounds',
        component: Backgrounds,
        name: 'backgrounds',
        meta: { title: 'backgrounds.title', requiresAdmin: true }
      },

      {
        path: 'bots',
        component: Bots,
        name: 'bots',
        meta: { title: 'bots.title', requiresAdmin: true }
      },

      {
        path: 'departments',
        name: 'departments',
        meta: { title: 'departments.title', requiresAdmin: true },
        component: Departments
      },

      {
        path: 'studios',
        name: 'studios',
        meta: { title: 'studios.title', requiresAdmin: true },
        component: Studios
      },

      {
        path: 'project-templates',
        name: 'project-templates',
        meta: { title: 'project_templates.title', requiresAdmin: true },
        component: ProjectTemplates
      },
      {
        path: 'project-templates/:template_id',
        name: 'project-template-settings',
        meta: { title: 'project_templates.title', requiresAdmin: true },
        component: ProjectTemplateSettings
      },

      {
        path: 'salary-scale',
        name: 'salary-scale',
        meta: { title: 'budget.salary_scale_title', requiresAdmin: true },
        component: SalaryScale
      },

      {
        name: 'custom-actions',
        meta: { title: 'custom_actions.title', requiresAdmin: true },
        path: 'custom-actions',
        component: CustomActions
      },

      {
        name: 'status-automations',
        meta: { title: 'status_automations.title', requiresAdmin: true },
        path: 'status-automations',
        component: StatusAutomations
      },

      {
        name: 'software-licenses',
        path: 'software-licenses',
        meta: { title: 'software_licenses.title', requiresAdmin: true },
        component: SoftwareLicenses
      },

      {
        name: 'hardware-items',
        path: 'hardware-items',
        meta: { title: 'hardware_items.title', requiresAdmin: true },
        component: HardwareItems
      },

      {
        name: 'notifications',
        meta: { title: 'notifications.title' },
        path: 'notifications',
        component: Notifications
      },

      {
        path: 'all-tasks',
        component: AllTasks,
        name: 'all-tasks',
        meta: { title: 'tasks.all_tasks', forbiddenForClient: true }
      },

      {
        path: 'open-productions',
        component: OpenProductions,
        name: 'open-productions'
      },

      {
        path: 'new-production',
        component: NewProduction,
        name: 'new-production',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'entity-search',
        component: EntitySearch,
        name: 'entity-search',
        meta: { title: 'search.title', forbiddenForClient: true }
      },

      {
        path: 'entity-chats',
        component: EntityChats,
        name: 'entity-chats',
        meta: { title: 'chats.title', forbiddenForClient: true }
      },

      {
        path: 'people',
        component: People,
        name: 'people',
        meta: { title: 'people.title', requiresAdmin: true }
      },

      {
        path: 'people/:person_id',
        component: Person,
        name: 'person',
        meta: { title: 'people.title', forbiddenForClient: true }
      },

      {
        path: '/main-schedule',
        component: MainSchedule,
        name: 'main-schedule',
        meta: { title: 'schedule.title_main', requiresAdmin: true }
      },

      {
        path: '/team-schedule',
        component: TeamSchedule,
        name: 'team-schedule',
        meta: {
          title: 'team_schedule.title_main',
          requiresSupervisorOrManager: true
        }
      },

      {
        path: '/timesheets',
        component: Timesheets,
        name: 'timesheets',
        meta: { title: 'timesheets.title', forbiddenForClient: true },
        children: [
          {
            path: 'year/:year',
            component: Timesheets,
            name: 'timesheets-year'
          },
          {
            path: 'year/:year/persons/:person_id',
            component: Timesheets,
            name: 'timesheets-year-person'
          },
          {
            path: 'month/:year',
            component: Timesheets,
            name: 'timesheets-month'
          },
          {
            path: 'month/:year/:month/persons/:person_id',
            component: Timesheets,
            name: 'timesheets-month-person'
          },
          {
            path: 'week/:year',
            component: Timesheets,
            name: 'timesheets-week'
          },
          {
            path: 'week/:year/:week/persons/:person_id',
            component: Timesheets,
            name: 'timesheets-week-person'
          },
          {
            path: 'day/:year/:month',
            component: Timesheets,
            name: 'timesheets-day'
          },
          {
            path: 'day/:year/:month/:day/persons/:person_id',
            component: Timesheets,
            name: 'timesheets-day-person'
          }
        ]
      },

      {
        path: '/logs',
        component: Logs,
        name: 'logs',
        meta: { title: 'logs.title', requiresAdmin: true }
      },

      {
        path: 'profile',
        component: Profile,
        name: 'profile',
        meta: { title: 'profile.title' }
      },

      {
        path: '/plugins/:plugin_id',
        component: Plugin,
        name: 'plugin',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'settings',
        component: Settings,
        name: 'settings',
        meta: { title: 'settings.title', requiresAdmin: true }
      },

      {
        name: 'task-types',
        meta: { title: 'task_types.title', requiresAdmin: true },
        path: 'task-types',
        component: TaskTypes
      },

      {
        name: 'task-status',
        meta: { title: 'task_status.title', requiresAdmin: true },
        path: 'task-status',
        component: TaskStatus
      },
      {
        path: 'my-tasks',
        component: Todos,
        name: 'todos',
        meta: { title: 'tasks.my_tasks', forbiddenForClient: true }
      },

      {
        path: 'my-checks',
        component: MyChecks,
        name: 'checks',
        meta: { title: 'tasks.my_checks', forbiddenForClient: true }
      },

      {
        path: 'productions',
        component: Productions,
        name: 'productions',
        meta: { title: 'productions.title', requiresAdmin: true }
      },

      {
        path: 'productions/:production_id/team',
        component: Team,
        name: 'team',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/budget',
        component: Budget,
        name: 'budget',
        meta: { requiresAdmin: true }
      },

      {
        path: 'news-feed',
        component: ProductionNewsFeed,
        name: 'newsfeed',
        meta: { title: 'news.title', requiresAdmin: true }
      },

      {
        path: 'productions/:production_id/news-feed',
        component: ProductionNewsFeed,
        name: 'news-feed',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/schedule',
        component: ProductionSchedule,
        name: 'schedule',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/schedule',
        component: ProductionSchedule,
        name: 'episode-schedule',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/production-settings',
        component: ProductionSettings,
        name: 'production-settings',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/brief',
        component: Brief,
        name: 'brief',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/plugins/:plugin_id',
        component: Plugin,
        name: 'production-plugin',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/plugins/:plugin_id',
        component: Plugin,
        name: 'episode-production-plugin',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/quota',
        component: ProductionQuota,
        name: 'quota',
        meta: { forbiddenForClient: true },
        children: [
          {
            path: 'month/:year',
            component: ProductionQuota,
            name: 'quota-month'
          },
          {
            path: 'month/:year/:month/persons/:person_id',
            component: ProductionQuota,
            name: 'quota-month-person'
          },
          {
            path: 'week/:year',
            component: ProductionQuota,
            name: 'quota-week'
          },
          {
            path: 'week/:year/:week/persons/:person_id',
            component: ProductionQuota,
            name: 'quota-week-person'
          },
          {
            path: 'day/:year/:month',
            component: ProductionQuota,
            name: 'quota-day'
          },
          {
            path: 'day/:year/:month/:day/persons/:person_id',
            component: ProductionQuota,
            name: 'quota-day-person'
          }
        ]
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/quota',
        component: ProductionQuota,
        name: 'episode-quota',
        meta: { forbiddenForClient: true },
        children: [
          {
            path: 'month/:year',
            component: ProductionQuota,
            name: 'episode-quota-month'
          },
          {
            path: 'month/:year/:month/persons/:person_id',
            component: ProductionQuota,
            name: 'episode-quota-month-person'
          },
          {
            path: 'week/:year',
            component: ProductionQuota,
            name: 'episode-quota-week'
          },
          {
            path: 'week/:year/:week/persons/:person_id',
            component: ProductionQuota,
            name: 'episode-quota-week-person'
          },
          {
            path: 'day/:year/:month',
            component: ProductionQuota,
            name: 'episode-quota-day'
          },
          {
            path: 'day/:year/:month/:day/persons/:person_id',
            component: ProductionQuota,
            name: 'episode-quota-day-person'
          }
        ]
      },

      {
        path: 'productions/:production_id/playlists',
        component: Playlist,
        name: 'playlists',
        children: [
          {
            name: 'playlist',
            path: ':playlist_id',
            component: Playlist
          }
        ]
      },

      {
        path: 'productions/:production_id/breakdown',
        component: Breakdown,
        name: 'breakdown',
        meta: { forbiddenForClient: true },
        children: [
          {
            path: 'sequences/:sequence_id',
            component: Breakdown,
            name: 'breakdown-sequence'
          },
          {
            path: 'asset-types/:asset_type_id',
            component: Breakdown,
            name: 'breakdown-asset-type'
          }
        ]
      },

      {
        path: 'productions/:production_id/concepts',
        component: Concepts,
        name: 'concepts',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/assets',
        component: Assets,
        name: 'assets',
        meta: { clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/assets/:asset_id',
        component: Asset,
        name: 'asset',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/shots',
        component: Shots,
        name: 'shots',
        meta: { clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/shots/:shot_id',
        component: Shot,
        name: 'shot',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/edits',
        component: Edits,
        name: 'edits',
        meta: { clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/edits/:edit_id',
        component: Edit,
        name: 'edit',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/episodes',
        component: Episodes,
        name: 'episodes',
        meta: { forbiddenForClient: true },
        children: []
      },
      {
        path: 'productions/:production_id/episodes/:episode_id',
        component: Episode,
        name: 'episode',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/sequences/:sequence_id',
        component: Sequence,
        name: 'sequence',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/sequences',
        component: Sequences,
        name: 'sequences',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/sequence-stats',
        component: SequenceStats,
        name: 'sequence-stats',
        meta: { clientAccess: 'stats' }
      },

      {
        path: 'productions/:production_id/asset-types',
        component: ProductionAssetTypes,
        name: 'production-asset-types',
        meta: { clientAccess: 'stats' }
      },

      {
        path: 'productions/:production_id/:type/task-types/:task_type_id',
        component: TaskType,
        name: 'task-type',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' },
        children: [
          {
            name: 'task-type-schedule',
            path: 'schedule',
            component: TaskType
          },
          {
            name: 'task-type-estimation',
            path: 'estimation',
            component: TaskType
          }
        ]
      },

      {
        name: 'episode-task',
        meta: { clientAccess: 'taskList' },
        path: 'productions/:production_id/episodes/:episode_id/:type/tasks/:task_id',
        component: Task,
        children: [
          {
            name: 'episode-task-preview',
            path: 'previews/:preview_id',
            component: Task
          }
        ]
      },

      {
        name: 'task',
        meta: { clientAccess: 'taskList' },
        path: 'productions/:production_id/:type/tasks/:task_id',
        component: Task,
        children: [
          {
            name: 'task-preview',
            path: 'previews/:preview_id',
            component: Task
          }
        ]
      },

      {
        path: 'productions/:production_id/episode-stats',
        component: EpisodeStats,
        name: 'episode-stats',
        meta: { clientAccess: 'stats' },
        children: []
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/playlists',
        component: Playlist,
        name: 'episode-playlists',
        children: [
          {
            name: 'episode-playlist',
            path: ':playlist_id',
            component: Playlist
          }
        ]
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/breakdown',
        component: Breakdown,
        name: 'episode-breakdown',
        meta: { forbiddenForClient: true },
        children: [
          {
            path: 'sequences/:sequence_id',
            component: Breakdown,
            name: 'episode-breakdown-sequence'
          },
          {
            path: 'asset-types/:asset_type_id',
            component: Breakdown,
            name: 'episode-breakdown-asset-type'
          }
        ]
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/assets',
        component: Assets,
        name: 'episode-assets',
        meta: { clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/assets/:asset_id',
        component: Asset,
        name: 'episode-asset',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/shots',
        component: Shots,
        name: 'episode-shots',
        meta: { clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/shots/:shot_id',
        component: Shot,
        name: 'episode-shot',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/edits',
        component: Edits,
        name: 'episode-edits',
        meta: { clientAccess: 'taskList' },
        children: []
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/edits/:edit_id',
        component: Edit,
        name: 'episode-edit',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/asset-types',
        component: ProductionAssetTypes,
        name: 'episode-production-asset-types',
        meta: { clientAccess: 'stats' }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/sequences',
        component: Sequences,
        name: 'episode-sequences',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/sequences/:sequence_id',
        component: Sequence,
        name: 'episode-sequence',
        meta: { forbiddenForClient: true }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/sequence-stats',
        component: SequenceStats,
        name: 'episode-sequence-stats',
        meta: { clientAccess: 'stats' }
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/:type/task-types/:task_type_id',
        component: TaskType,
        name: 'episode-task-type',
        meta: { forbiddenForClient: true, clientAccess: 'taskList' },
        children: [
          {
            name: 'episode-task-type-schedule',
            path: 'schedule',
            component: TaskType
          },
          {
            name: 'episode-task-type-estimation',
            path: 'estimation',
            component: TaskType
          }
        ]
      },

      {
        path: 'productions/:production_id/episodes/task-types/:task_type_id',
        component: TaskType,
        name: 'episodes-task-type',
        meta: {
          clientAccess: 'taskList',
          section: 'episodes',
          forbiddenForClient: true
        },
        children: [
          {
            name: 'episodes-task-type-schedule',
            path: 'schedule',
            component: TaskType
          },
          {
            name: 'episodes-task-type-estimation',
            path: 'estimation',
            component: TaskType
          }
        ]
      },

      {
        path: 'productions/:production_id/episodes/:episode_id/tasks/:task_id',
        name: 'episode-episode-task',
        meta: { clientAccess: 'taskList' },
        component: Task,
        children: [
          {
            name: 'episode-episode-task-preview',
            path: 'previews/:preview_id',
            component: Task
          }
        ]
      }
    ]
  },

  {
    path: '/login',
    component: Login,
    name: 'login'
  },
  {
    path: '/login/2fa',
    component: Login2FA,
    name: 'login-2fa',
    beforeEnter: (to, from) => {
      if (!store.getters.user) return { name: 'login' }
    }
  },
  {
    path: '/app-login',
    component: AppLogin,
    name: 'app-login',
    beforeEnter: async (to, from) => {
      const redirect = await auth.requireAuth(to, from)
      if (redirect) return redirect
      lang.setLocale(userStore.state.user.locale)
      store.commit('DATA_LOADING_END')
    }
  },
  {
    path: '/first-connection',
    component: FirstConnection,
    name: 'first-connection'
  },
  {
    path: '/reset-password',
    component: ResetPassword,
    name: 'reset-password'
  },
  {
    path: '/reset-change-password',
    component: ResetChangePassword,
    name: 'reset-change-password'
  },
  {
    path: '/server-down',
    component: ServerDown,
    name: 'server-down'
  },
  {
    path: '/wrong-browser',
    component: WrongBrowser,
    name: 'wrong-browser'
  },

  {
    path: '/playlists/shared/:token',
    component: SharedPlaylist,
    name: 'shared-playlist'
  },

  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
    name: 'not-found'
  }
]

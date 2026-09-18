<template>
  <div class="topbar">
    <nav class="nav">
      <div class="nav-left">
        <a
          class="studio-logo-wrapper nav-item"
          role="button"
          tabindex="0"
          @click="toggleSidebar()"
          @keydown.enter.prevent="toggleSidebar()"
          @keydown.space.prevent="toggleSidebar()"
          v-if="!isCurrentUserClient"
        >
          <img
            class="studio-logo"
            :src="organisationLogoPath"
            :alt="organisation.name"
            v-if="organisation?.has_avatar"
          />
          <img
            class="studio-logo"
            src="@/assets/kitsu.png"
            alt="Kitsu"
            v-else
          />
        </a>

        <router-link
          class="studio-logo-wrapper nav-item"
          :to="{ name: 'open-productions' }"
          v-else
        >
          <img
            class="studio-logo"
            :src="organisationLogoPath"
            :alt="organisation.name"
            v-if="organisation?.has_avatar"
          />
          <img
            class="studio-logo"
            src="@/assets/kitsu.png"
            alt="Kitsu"
            v-else
          />
        </router-link>

        <div class="flexrow topbar-menu" v-if="isProductionContext">
          <div class="flexrow-item subitem">
            <topbar-production-list
              :episode-id="currentEpisodeId"
              :production-list="openProductions"
              :section="currentSectionOption"
            />
          </div>
          <div class="flexrow-item">
            <chevron-right-icon class="align-middle" :size="20" />
          </div>
          <div class="flexrow-item subitem">
            <topbar-section-list
              :episode-id="currentEpisodeId"
              :section-list="sectionOptions"
              :section="currentSectionOption"
            />
          </div>
          <div class="flexrow-item" v-if="isEpisodeContext">
            <chevron-right-icon class="align-middle" :size="20" />
          </div>
          <div class="flexrow-item subitem" v-if="isEpisodeContext">
            <topbar-episode-list
              :episode-groups="currentEpisodeOptionGroups || []"
              :episode-id="currentEpisodeId"
              :section="currentSectionOption"
            />
          </div>
        </div>
        <div
          class="nav-item"
          v-else-if="lastProduction && $route.path !== '/open-productions'"
        >
          <router-link
            :to="lastProductionRoute"
            :title="$t('main.go_productions')"
            class="flexrow mr0"
          >
            <chevron-left-icon />
          </router-link>
        </div>
        <div class="nav-item page-title pl0 ml0" v-if="pageTitle">
          {{ pageTitle }}
        </div>
      </div>

      <div class="nav-right">
        <router-link
          class="nav-item"
          :to="{
            name: 'checks'
          }"
          v-if="isCurrentUserSupervisor"
        >
          {{ $t('tasks.my_checks') }}
        </router-link>

        <router-link
          class="nav-item"
          :to="{
            name: 'todos',
            query: { section: 'todos' }
          }"
          v-if="!isCurrentUserAdmin && !isCurrentUserClient"
        >
          {{ $t('tasks.my_tasks') }}
        </router-link>

        <router-link
          class="nav-item mr05"
          :to="{
            name: 'todos',
            query: { section: 'timesheets' }
          }"
          v-if="!isCurrentUserAdmin && !isCurrentUserClient"
        >
          {{ $t('timesheets.timelog_title') }}
        </router-link>
        <global-search-field
          class="flexrow-item mr0 global-search"
          v-if="mainConfig.indexer_configured && !isCurrentUserClient"
        />
        <div class="nav-item">
          <a
            class="changelog-button"
            target="_blank"
            href="https://cgwire.canny.io/changelog"
          >
            <zap-icon />
          </a>
        </div>
        <notification-bell class="nav-item notification-bell" />
        <div class="nav-item">
          <a
            class="help-button"
            href="https://kitsu.cg-wire.com/"
            target="_blank"
          >
            <help-circle-icon />
          </a>
        </div>
        <div
          class="nav-item pointer"
          role="button"
          tabindex="0"
          @click="toggleUserMenu"
          @keydown.enter.prevent="toggleUserMenu"
          @keydown.space.prevent="toggleUserMenu"
        >
          <people-avatar
            class="avatar"
            :is-lazy="false"
            :is-link="false"
            :person="user"
            v-if="user"
          />
        </div>
      </div>
    </nav>

    <div
      class="c-mask-user-menu"
      @click="toggleUserMenu()"
      v-if="!isUserMenuHidden"
    ></div>

    <nav class="user-menu" v-if="!isUserMenuHidden">
      <ul>
        <li>
          <router-link :to="{ name: 'profile' }" @click="toggleUserMenu()">
            {{ $t('main.profile') }}
          </router-link>
        </li>
        <li
          role="button"
          tabindex="0"
          @click="toggleDarkTheme"
          @keydown.enter.prevent="toggleDarkTheme"
          @keydown.space.prevent="toggleDarkTheme"
        >
          {{ !isDarkTheme ? $t('main.dark_theme') : $t('main.white_theme') }}
        </li>
        <li
          role="button"
          tabindex="0"
          @click="toggleDesktopNotifications"
          @keydown.enter.prevent="toggleDesktopNotifications"
          @keydown.space.prevent="toggleDesktopNotifications"
          :class="{ disabled: isDesktopNotificationsDenied }"
          :title="
            isDesktopNotificationsDenied
              ? $t('notifications.desktop.banner_blocked_text')
              : null
          "
          :aria-disabled="isDesktopNotificationsDenied"
          :aria-label="
            isDesktopNotificationsDenied
              ? $t('notifications.desktop.banner_blocked_text')
              : isDesktopNotificationsActive
                ? $t('main.disable_desktop_notifications')
                : $t('main.enable_desktop_notifications')
          "
          v-if="isDesktopNotificationsSupported"
        >
          <span class="label-stack">
            <span :class="{ ghost: isDesktopNotificationsActive }">
              {{ $t('main.enable_desktop_notifications') }}
            </span>
            <span :class="{ ghost: !isDesktopNotificationsActive }">
              {{ $t('main.disable_desktop_notifications') }}
            </span>
          </span>
        </li>
        <li
          role="button"
          tabindex="0"
          @click="setSupportChat(!isSupportChat)"
          @keydown.enter.prevent="setSupportChat(!isSupportChat)"
          @keydown.space.prevent="setSupportChat(!isSupportChat)"
        >
          {{
            isSupportChat
              ? $t('main.hide_support_chat')
              : $t('main.show_support_chat')
          }}
        </li>
        <hr />
        <li>
          <a
            href="https://www.youtube.com/playlist?list=PLp_1gB5ZBHXqnQgZ4TCrAt7smxesaDo29"
            target="_blank"
          >
            {{ $t('main.tutorials') }}
          </a>
        </li>
        <li>
          <a
            role="button"
            tabindex="0"
            @click="display.shortcutModal = true"
            @keydown.enter.prevent="display.shortcutModal = true"
            @keydown.space.prevent="display.shortcutModal = true"
          >
            {{ $t('keyboard.shortcuts') }}
          </a>
        </li>
        <hr />
        <li>
          <a href="https://discord.gg/VbCxtKN" target="_blank"> Discord </a>
        </li>
        <li>
          <a href="https://linkedin.com/company/cgwire/" target="_blank">
            LinkedIn
          </a>
        </li>
        <li>
          <a href="https://x.com/cgwirekitsu" target="_blank"> X </a>
        </li>
        <li>
          <a href="https://cgwire.canny.io" target="_blank">
            {{ $t('main.feedback') }}
          </a>
        </li>
        <li>
          <a href="https://dev.kitsu.cloud" target="_blank">
            {{ $t('main.developer_documentation') }}
          </a>
        </li>
        <hr />
        <li>
          <a href="https://cg-wire.com/about" target="_blank">
            {{ $t('main.about') }}
          </a>
        </li>
        <li class="version">Kitsu {{ kitsuVersion }}</li>
        <hr />
        <li>
          <a
            class="flexrow"
            role="button"
            tabindex="0"
            @click="onLogout"
            @keydown.enter.prevent="onLogout"
            @keydown.space.prevent="onLogout"
          >
            <log-out-icon class="flexrow-item icon-1x" />
            <span class="flexrow-item">{{ $t('main.logout') }}</span>
          </a>
        </li>
      </ul>
    </nav>

    <shortcut-modal
      active
      @cancel="display.shortcutModal = false"
      v-if="display.shortcutModal"
    />
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  LogOutIcon,
  ZapIcon
} from 'lucide-vue-next'
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

import { version as kitsuVersion } from '@/../package.json'
import { useDesktopNotifications } from '@/composables/desktopNotifications'
import {
  buildDesktopNotificationPayload,
  buildTestNotificationPayload
} from '@/lib/notifications'
import localPreferences from '@/lib/preferences'

import ShortcutModal from '@/components/modals/ShortcutModal.vue'
import GlobalSearchField from '@/components/tops/GlobalSearchField.vue'
import TopbarEpisodeList from '@/components/tops/TopbarEpisodeList.vue'
import TopbarProductionList from '@/components/tops/TopbarProductionList.vue'
import TopbarSectionList from '@/components/tops/TopbarSectionList.vue'
import NotificationBell from '@/components/widgets/NotificationBell.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
/* eslint-enable no-unused-vars */

// Pages about one episode: no other episode can stand in for a missing one.
const EPISODE_PAGE_ROUTES = [
  'episode',
  'episode-episode-task',
  'episode-episode-task-preview'
]

const ASSET_SECTIONS = ['assets', 'assetTypes', 'playlists']
const BREAKDOWN_SECTIONS = ['breakdown']
const EDIT_SECTIONS = ['edits']
const SCHEDULE_SECTIONS = ['schedule']
const SHOT_SECTIONS = ['shots']

const SEPARATOR = { label: 'separator', value: 'separator' }

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useStore()
const socket = getCurrentInstance().appContext.config.globalProperties.$socket

const {
  isSupported: isDesktopNotificationsSupported,
  isActive: isDesktopNotificationsActive,
  permission: desktopNotificationsPermission,
  preferenceEnabled: desktopNotificationsPreferenceEnabled,
  setPreferenceEnabled: setDesktopNotificationsEnabled,
  showNotification: showDesktopNotification,
  withDesktopNotificationLock
} = useDesktopNotifications()

const getDefaultSection = () =>
  store.getters.isCurrentUserClient ? 'playlists' : 'assets'

// State
// --------------------------------------------------------------------------

const currentEpisodeId = ref(route.params.episode_id)
const currentProductionId = ref(route.params.production_id)
const currentProjectSection = ref(getDefaultSection())
const hasConfiguredProduction = ref(false)

const display = reactive({
  shortcutModal: false
})

// Computed
// --------------------------------------------------------------------------

const currentEpisode = computed(() => store.getters.currentEpisode)
const currentProduction = computed(() => store.getters.currentProduction)
const episodeOptionGroups = computed(() => store.getters.episodeOptionGroups)
const episodes = computed(() => store.getters.episodes)
const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const isCurrentUserVendor = computed(() => store.getters.isCurrentUserVendor)
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const isEpisodeListLoaded = computed(() => store.getters.isEpisodeListLoaded)
const isSupportChat = computed(() => store.getters.isSupportChat)
const isTVShow = computed(() => store.getters.isTVShow)
const isUserMenuHidden = computed(() => store.getters.isUserMenuHidden)
const lastProductionRoute = computed(() => store.getters.lastProductionRoute)
const lastProductionViewed = computed(() => store.getters.lastProductionViewed)
const mainConfig = computed(() => store.getters.mainConfig)
const notifications = computed(() => store.getters.notifications)
const openProductions = computed(() => store.getters.openProductions)
const organisation = computed(() => store.getters.organisation)
const organisationLogoPath = computed(() => store.getters.organisationLogoPath)
const productionEditTaskTypes = computed(
  () => store.getters.productionEditTaskTypes
)
const productionMap = computed(() => store.getters.productionMap)
const projectPlugins = computed(() => store.getters.projectPlugins)
const user = computed(() => store.getters.user)

const isDesktopNotificationsDenied = computed(
  () => desktopNotificationsPermission.value === 'denied'
)

// A video-game production has no main pack: its assets all belong to a
// chapter, so the selector never offers the pseudo-episode.
const hasMainPack = computed(
  () => currentProduction.value?.production_style !== 'video-game'
)

// Asset pages require a all section and a main pack section.
const currentEpisodeOptionGroups = computed(() => {
  const section = currentProjectSection.value || getDefaultSection()
  const withPseudoEpisodes = episodeList => [
    { name: '', episodeList },
    ...episodeOptionGroups.value
  ]
  // Plugin pages accept the all / main pseudo-episodes (forwarded to
  // the plugin iframe as episode_id): without these options the
  // combobox silently displays the first episode while the route
  // says "all".
  if (route.params.plugin_id !== undefined) {
    return withPseudoEpisodes(getBaseEpisodeOptions('episodes.all_episodes'))
  }
  if (ASSET_SECTIONS.includes(section)) {
    const [allAssets, ...others] = getBaseEpisodeOptions('main.all_assets')
    // Same all pseudo-episode, split by entity type through the query.
    const allShots = {
      label: t('main.all_shots'),
      value: 'all',
      query: { for_entity: 'shot' }
    }
    return withPseudoEpisodes(
      section === 'playlists'
        ? [allAssets, allShots, ...others]
        : [allAssets, ...others]
    )
  }
  if (EDIT_SECTIONS.includes(section)) {
    return withPseudoEpisodes([{ label: t('main.all_edits'), value: 'all' }])
  }
  if (BREAKDOWN_SECTIONS.includes(section)) {
    return withPseudoEpisodes(getBaseEpisodeOptions('shots.episodes'))
  }
  if (SHOT_SECTIONS.includes(section)) {
    // No main pack for shots: every shot of a TV show belongs to an
    // episode, so the only pseudo-episode is "all".
    return withPseudoEpisodes([{ label: t('main.all_shots'), value: 'all' }])
  }
  if (SCHEDULE_SECTIONS.includes(section)) {
    return withPseudoEpisodes(getBaseEpisodeOptions('episodes.all_episodes'))
  }
  return episodeOptionGroups.value
})

const isProductionContext = computed(
  () =>
    route.params.production_id !== undefined ||
    route.path.indexOf('my-tasks') === 0
)

const pageTitle = computed(() => {
  if (isProductionContext.value) return ''
  const titleKey = route.meta?.title
  return titleKey ? t(titleKey) : ''
})

const lastProduction = computed(
  () =>
    productionMap.value.get(lastProductionViewed.value) ||
    currentProduction.value
)

const sectionOptions = computed(() => {
  if (!currentProduction.value) return []

  const option = (labelKey, value) => ({ label: t(labelKey), value })
  const editOptions =
    // Show only if there are task types for Edit in this production.
    productionEditTaskTypes.value.length > 0
      ? [option('edits.title', 'edits')]
      : []

  if (isCurrentUserVendor.value) {
    return [
      option('assets.title', 'assets'),
      option('shots.title', 'shots'),
      option('sequences.title', 'sequences'),
      ...editOptions,
      ...(isTVShow.value ? [option('episodes.title', 'episodes')] : []),
      option('asset_types.production_title', 'assetTypes')
    ]
  }

  const isClient = isCurrentUserClient.value
  const isNotOnlyAssets = currentProduction.value.production_type !== 'assets'
  const isNotOnlyShots = currentProduction.value.production_type !== 'shots'

  const entityOptions = [
    isNotOnlyShots && option('assets.title', 'assets'),
    isNotOnlyAssets && option('shots.title', 'shots'),
    !isClient && isNotOnlyAssets && option('sequences.title', 'sequences'),
    ...editOptions,
    isTVShow.value && !isClient && option('episodes.title', 'episodes'),
    SEPARATOR
  ]
  const playlists = option('playlists.title', 'playlists')
  const statOptions = [
    isNotOnlyAssets && option('sequences.stats_title', 'sequence-stats'),
    isTVShow.value && option('episodes.stats_title', 'episode-stats'),
    isNotOnlyShots && option('asset_types.production_title', 'assetTypes')
  ]

  if (isClient) {
    return [playlists, ...entityOptions, ...statOptions].filter(Boolean)
  }

  // The sections below are shown to studio members only.
  const pluginOptions = projectPlugins.value.map(plugin => ({
    label: plugin.name,
    value: plugin.plugin_id,
    icon: plugin.icon,
    plugin_id: plugin.plugin_id,
    type: 'plugin'
  }))
  return [
    ...entityOptions,
    option('concepts.title', 'concepts'),
    isNotOnlyShots && option('breakdown.title', 'breakdown'),
    playlists,
    option('news.title', 'newsFeed'),
    SEPARATOR,
    ...statOptions,
    SEPARATOR,
    option('schedule.title', 'schedule'),
    isNotOnlyAssets && option('quota.title', 'quota'),
    isCurrentUserAdmin.value && option('budget.title', 'budget'),
    option('people.team', 'team'),
    ...pluginOptions,
    SEPARATOR,
    isCurrentUserManager.value
      ? option('settings.title', 'production-settings')
      : option('productions.brief.title', 'brief')
  ].filter(Boolean)
})

const currentSectionOption = computed(
  () =>
    sectionOptions.value.find(
      option => option.value === currentProjectSection.value
    )?.value
)

const isEpisodeContext = computed(
  () =>
    isTVShow.value &&
    route.params.episode_id &&
    (!['episodes', 'episode-stats'].includes(currentSectionOption.value) ||
      route.params.plugin_id !== undefined) &&
    // Do not display combobox if there is no episode
    episodes.value.length > 0
)

// Functions
// --------------------------------------------------------------------------

const toggleSidebar = () => store.dispatch('toggleSidebar')
const toggleUserMenu = () => store.dispatch('toggleUserMenu')
const toggleDarkTheme = () => store.dispatch('toggleDarkTheme')
const setSupportChat = isShown => store.dispatch('setSupportChat', isShown)

const onLogout = async () => {
  // The push resolves before the render flush unmounts the current
  // page: wait for the next tick so the session purge cannot race
  // against watchers still reading the store.
  await router.push({ name: 'login' })
  await nextTick()
  try {
    await store.dispatch('logout')
  } catch (error) {
    console.error('An error occurred while logout', error)
  }
}

const toggleDesktopNotifications = async () => {
  if (isDesktopNotificationsDenied.value) return
  try {
    const payload = buildTestNotificationPayload(t, organisationLogoPath.value)
    await setDesktopNotificationsEnabled(
      !desktopNotificationsPreferenceEnabled.value,
      {
        ...payload,
        onClick: () => router.push(payload.route).catch(() => {})
      }
    )
  } catch (err) {
    console.error(err)
  }
}

const showDesktopNotificationForNew = async notificationId => {
  if (!isDesktopNotificationsActive.value) return
  // Multi-tab lock: skips fetch + popup in non-leader tabs.
  await withDesktopNotificationLock(notificationId, async () => {
    try {
      const notification = await store.dispatch(
        'loadNotification',
        notificationId
      )
      if (!notification) return
      // State may have changed during the fetch (user toggled off, permission revoked).
      if (!isDesktopNotificationsActive.value) return
      const payload = buildDesktopNotificationPayload(notification, {
        t,
        personMap: store.getters.personMap,
        productionMap: productionMap.value,
        taskTypeMap: store.getters.taskTypeMap,
        organisationLogoPath: organisationLogoPath.value
      })
      showDesktopNotification({
        ...payload,
        onClick: () => router.push(payload.route).catch(() => {})
      })
    } catch (err) {
      console.error(err)
    }
  })
}

const getCurrentSectionFromRoute = () => {
  if (route.name.includes('production-plugin')) return route.params.plugin_id
  if (route.name === 'person') return 'person'
  const segments = route.path.split('/')
  let name = isTVShow.value ? segments[5] : ''
  if (isTVShow.value && name && name.length === 36) name = 'episodes'
  if (!name) {
    name = segments[3]
    if (name === 'episodes' && segments.length === 6) name = segments[5]
  }
  return { 'asset-types': 'assetTypes', 'news-feed': 'newsFeed' }[name] || name
}

const getBaseEpisodeOptions = allLabel => [
  { label: t(allLabel), value: 'all' },
  ...(hasMainPack.value ? [{ label: t('main.main_pack'), value: 'main' }] : [])
]

const leaveToOpenProductions = () =>
  router.replace({ name: 'open-productions' }).catch(console.error)

const loadProductionFromRoute = async productionId => {
  try {
    await store.dispatch('loadProduction', productionId)
  } catch (err) {
    // Deleted, or not shared with the user.
    console.error(err)
    leaveToOpenProductions()
    return
  }
  if (route.params.production_id === productionId) {
    if (productionMap.value.get(productionId)) {
      setProductionFromRoute()
    } else {
      leaveToOpenProductions()
    }
  }
}

const setProductionFromRoute = () => {
  const routeProductionId = route.params.production_id
  const routeEpisodeId = route.params.episode_id
  // A production outside the open ones, a closed one reached by a link or
  // a reload, is missing from the map: the store would stand the first
  // open production in for it.
  if (routeProductionId && !productionMap.value.get(routeProductionId)) {
    loadProductionFromRoute(routeProductionId)
    return
  }
  if (isProductionChanged(routeProductionId)) {
    configureProduction(routeProductionId)
    return
  }
  // Already the production of the store, its fallback one on a first
  // load: a later switch must not pass for a first load.
  hasConfiguredProduction.value = true
  if (isEpisodeChanged(routeEpisodeId)) {
    configureEpisode(routeEpisodeId)
  } else {
    updateCombosFromRoute()
  }
}

// Episode a freshly configured production opens on, resolved from the route
// at the time the episode list lands.
const resolveConfiguredEpisodeId = (loadedEpisodes, isInitialLoad) => {
  const routeEpisodeId = route.params.episode_id
  const pluginId = route.params.plugin_id
  const section = currentProjectSection.value
  if (section === 'assets') {
    // An episode of this production is kept on any load: a switch
    // through the production list carries an episode of the one
    // left. That switch carries pseudo-episodes too, which only a
    // first load keeps.
    const isOwnEpisode = episodes.value.some(({ id }) => id === routeEpisodeId)
    const isKeptPseudoEpisode =
      isInitialLoad && keepsPseudoEpisode('assets', routeEpisodeId, pluginId)
    return isOwnEpisode || isKeptPseudoEpisode ? routeEpisodeId : 'all'
  }
  if (keepsPseudoEpisode(section, routeEpisodeId, pluginId)) {
    return routeEpisodeId
  }
  const episode = loadedEpisodes.find(({ id }) => id === routeEpisodeId)
  // Only a direct link with an id the production does not know
  // resolves like a stale in-session link. A production switch
  // carries the episode of the production left and a
  // pseudo-episode the section does not keep needs an episode:
  // both open the running one.
  const isStaleLink =
    isInitialLoad && routeEpisodeId && !['all', 'main'].includes(routeEpisodeId)
  return (
    episode?.id ||
    (isStaleLink ? fallbackEpisodeId(section, pluginId) : runningEpisodeId())
  )
}

const configureProduction = async routeProductionId => {
  // Initial app load (e.g. F5 / direct link) has no previous production:
  // honor the URL episode. Production switch defaults to 'all' for assets.
  const isInitialLoad = !hasConfiguredProduction.value
  hasConfiguredProduction.value = true
  store.dispatch('setProduction', routeProductionId)
  currentProductionId.value = routeProductionId
  currentEpisodeId.value = null
  store.dispatch('clearEpisodes')
  if (!isTVShow.value || currentProjectSection.value === 'person') {
    updateCombosFromRoute()
    return
  }
  try {
    const loadedEpisodes = await store.dispatch('loadEpisodes')
    // The fetch may outlive a navigation: resolve from the route at
    // response time, and give up if the production moved.
    if (route.params.production_id !== routeProductionId) return
    const query = route.query
    currentProjectSection.value = getCurrentSectionFromRoute()
    if (
      EPISODE_PAGE_ROUTES.includes(route.name) &&
      !isKnownEpisode(route.params.episode_id)
    ) {
      redirectToKnownEpisode()
      return
    }
    currentEpisodeId.value = resolveConfiguredEpisodeId(
      loadedEpisodes,
      isInitialLoad
    )
    // Replace: this corrects the landing URL, it is no navigation of
    // the user's. A push would keep the rejected URL in the history
    // and Back would land on it, to be corrected again. A page without
    // episode param is left alone: the router keeps a param its route
    // does not declare, and the episode selector would show there.
    if (route.params.episode_id !== undefined) {
      router.replace({
        params: {
          production_id: routeProductionId,
          episode_id: currentEpisodeId.value
        },
        query
      })
    }
    // The navigation is confirmed asynchronously: pass the episode
    // just resolved, or the route still names the one being left and
    // the coercion navigates a second time, over this very one.
    updateCombosFromRoute(currentEpisodeId.value)
  } catch (err) {
    console.error(err)
  }
}

const configureEpisode = async () => {
  if (!isEpisodeListLoaded.value) {
    // The fetch may outlive a production switch: its response must not
    // resolve the route against the list of the production left.
    const routeProductionId = route.params.production_id
    try {
      await store.dispatch('loadEpisodes')
    } catch (err) {
      console.error(err)
      return
    }
    if (route.params.production_id !== routeProductionId) return
  }
  setEpisodeFromRoute()
  updateCombosFromRoute()
}

const isProductionChanged = productionId =>
  !currentProduction.value ||
  currentProductionId.value !== productionId ||
  currentProduction.value.id !== productionId

const isEpisodeChanged = episodeId =>
  isTVShow.value &&
  (!currentEpisode.value ||
    currentEpisodeId.value !== episodeId ||
    currentEpisode.value.id !== episodeId ||
    // Deleted while no page of the production was shown: the route and
    // the store still name it, it must be resolved again.
    (Boolean(episodeId) &&
      isEpisodeListLoaded.value &&
      !isKnownEpisode(episodeId)))

const setEpisodeFromRoute = () => {
  const routeEpisodeId = route.params.episode_id
  if (isEpisodeChanged(routeEpisodeId)) {
    if (routeEpisodeId && isTVShow.value) {
      if (isKnownEpisode(routeEpisodeId)) {
        store.dispatch('setCurrentEpisode', routeEpisodeId)
      } else {
        redirectToKnownEpisode()
      }
    }
  } else if (!routeEpisodeId) {
    store.dispatch('clearEpisodes')
    currentEpisodeId.value = null
  }
}

const isKnownEpisode = episodeId =>
  ['all', 'main'].includes(episodeId) ||
  episodes.value.some(({ id }) => id === episodeId)

// A stale link (deleted episode, URL copied from another production)
// must not reach the store: SET_CURRENT_EPISODE cannot resolve the id,
// the combobox goes blank and a mounted page keeps the list it had.
const redirectToKnownEpisode = () => {
  // The pages of an episode the production lost, its detail page and its
  // own tasks, have no stand-in: another episode under the same URL shape
  // would mislead.
  const target = EPISODE_PAGE_ROUTES.includes(route.name)
    ? {
        name: 'episodes',
        params: { production_id: route.params.production_id }
      }
    : {
        name: route.name,
        params: {
          ...route.params,
          episode_id: fallbackEpisodeId(
            getCurrentSectionFromRoute(),
            route.params.plugin_id
          )
        },
        query: route.query
      }
  router.replace(target).catch(console.error)
}

const runningEpisodeId = () => {
  const episode =
    episodes.value.find(({ status }) => status === 'running') ||
    episodes.value[0]
  return episode?.id || 'all'
}

// Episode shown instead of one the route names but the production does
// not have: 'all' where the section offers it, the running episode
// elsewhere. Shared by the direct link and the in-session paths.
const fallbackEpisodeId = (section, pluginId) =>
  offersAllEpisodes(section, pluginId) ? 'all' : runningEpisodeId()

// Sections whose episode selector offers the all pseudo-episode. Plugin
// pages forward it to their iframe; the Shots page lists every shot of
// the production under it but has no main pack.
const offersAllEpisodes = (section, pluginId) =>
  pluginId !== undefined ||
  [
    ...ASSET_SECTIONS,
    ...EDIT_SECTIONS,
    ...BREAKDOWN_SECTIONS,
    ...SCHEDULE_SECTIONS,
    ...SHOT_SECTIONS
  ].includes(section)

// Sections whose episode selector offers the main pack: the Edits and
// Shots pages list episode-bound entities only.
const offersMainPack = (section, pluginId) =>
  hasMainPack.value &&
  (pluginId !== undefined ||
    [...ASSET_SECTIONS, ...BREAKDOWN_SECTIONS, ...SCHEDULE_SECTIONS].includes(
      section
    ))

// Whether the route keeps the pseudo-episode it names: only where the
// selector of the section offers it.
const keepsPseudoEpisode = (section, episodeId, pluginId) => {
  if (episodeId === 'all') return offersAllEpisodes(section, pluginId)
  if (episodeId === 'main') return offersMainPack(section, pluginId)
  return false
}

const updateCombosFromRoute = (resolvedEpisodeId = null) => {
  const pluginId = route.params.plugin_id
  const section = getCurrentSectionFromRoute()
  const routeEpisodeId = resolvedEpisodeId ?? route.params.episode_id
  // A page without episode keeps the one of the store, which the section
  // links reopen.
  const episodeId = routeEpisodeId ?? currentEpisode.value?.id
  currentProductionId.value = route.params.production_id
  currentProjectSection.value = section
  // A pseudo-episode the section does not offer opens the running
  // episode, the same fallback as a direct link: Back from a corrected
  // link must not land on a third episode.
  if (
    routeEpisodeId &&
    ['all', 'main'].includes(episodeId) &&
    !keepsPseudoEpisode(section, episodeId, pluginId) &&
    episodes.value.length > 0
  ) {
    currentEpisodeId.value = runningEpisodeId()
    replaceContextRoute(section, pluginId)
  } else {
    currentEpisodeId.value = episodeId
  }
}

// Replace, not push: the URL just rejected must not stay in the history, or
// the back button lands on it and is coerced here again.
const replaceContextRoute = (section, pluginId) => {
  const production = productionMap.value.get(currentProductionId.value)
  const isProductionTVShow = production?.production_type === 'tvshow'
  // The router names the asset types, news feed and plugin pages
  // differently from the sections the topbar reads off the path: a
  // plugin page is a section named after the plugin itself.
  const routeSection = pluginId
    ? 'production-plugin'
    : { assetTypes: 'production-asset-types', newsFeed: 'news-feed' }[
        section
      ] || section
  const isEpisodeRoute =
    isProductionTVShow &&
    ![
      'team',
      'news-feed',
      'production-settings',
      'brief',
      'budget',
      'episodes'
    ].includes(routeSection)
  let name = routeSection
  if (isEpisodeRoute) {
    name = `episode-${routeSection}`
  } else if (routeSection === 'episodes' && !isProductionTVShow) {
    name = getDefaultSection()
  }
  if (currentProductionId.value) {
    router
      .replace({
        name,
        params: {
          production_id: currentProductionId.value,
          plugin_id: pluginId,
          ...(isEpisodeRoute ? { episode_id: currentEpisodeId.value } : {})
        },
        ...(['assets', 'shots'].includes(section)
          ? { query: { search: '' } }
          : {})
      })
      .catch(console.error)
  }
}

// A live deletion of the displayed episode leaves the route, the store
// and the selector on an id the production no longer has: move to the
// same fallback as a stale link. A production switch also rewrites the
// list, but the store resolves another episode from the new list then.
const onEpisodesChanged = () => {
  const routeEpisodeId = route.params.episode_id
  const isDisplayedEpisodeGone =
    routeEpisodeId &&
    currentEpisode.value?.id === routeEpisodeId &&
    !isKnownEpisode(routeEpisodeId)
  if (isDisplayedEpisodeGone) redirectToKnownEpisode()
}

const isForCurrentUser = eventData => user.value.id === eventData.person_id

const onNotificationNew = eventData => {
  if (!isForCurrentUser(eventData)) return
  const onNotificationsPage = route.name === 'notifications'
  // The bell badge is irrelevant on /notifications (list shown directly,
  // refreshes on return for background tabs).
  if (!onNotificationsPage) store.dispatch('incrementNotificationCounter')
  if (!eventData.notification_id) return
  // Desktop popup is redundant only when /notifications is foregrounded;
  // background tab can't see the list so the OS popup is still needed.
  const pageIsVisible =
    typeof document === 'undefined' || document.visibilityState === 'visible'
  if (onNotificationsPage && pageIsVisible) return
  showDesktopNotificationForNew(eventData.notification_id)
}

const onNotificationAllRead = eventData => {
  if (isForCurrentUser(eventData)) {
    store.dispatch('resetNotificationCounter')
    store.dispatch('markAllNotificationsAsReadLocal')
  }
}

// On the notifications page the list itself reflects the change, elsewhere
// only the bell counter does.
const onNotificationReadStatus = (eventData, isRead) => {
  if (!isForCurrentUser(eventData)) return
  if (route.name === 'notifications') {
    const notification = notifications.value.find(
      ({ id }) => id === eventData.notification_id
    )
    if (notification && Boolean(notification.read) !== isRead) {
      store.dispatch('toggleNotificationReadStatusLocal', notification)
    }
  } else {
    store.dispatch(
      isRead ? 'decrementNotificationCounter' : 'incrementNotificationCounter'
    )
  }
}

const onNotificationRead = eventData =>
  onNotificationReadStatus(eventData, true)

const onNotificationUnread = eventData =>
  onNotificationReadStatus(eventData, false)

const SOCKET_EVENTS = {
  'notification:new': onNotificationNew,
  'notification:all-read': onNotificationAllRead,
  'notification:read': onNotificationRead,
  'notification:unread': onNotificationUnread
}

// Watchers
// --------------------------------------------------------------------------

// Most changes occur through the route modification. We need to update
// the context when the route changes.
watch(route, () => {
  if (route.params.production_id) {
    // The store keeps the object: hand it the route of this navigation, not
    // the reactive one, which follows every later navigation.
    store.dispatch('saveLastProductionRoute', router.currentRoute.value)
    setProductionFromRoute()
  }
})

watch(currentEpisode, () => {
  currentEpisodeId.value = currentEpisode.value?.id ?? null
})

watch(episodes, onEpisodesChanged)

watch(currentSectionOption, () => {
  store.dispatch('clearSelectedTasks')
})

watch(isSupportChat, () => {
  localPreferences.setPreference('support:show', isSupportChat.value)
})

// Lifecycle
// --------------------------------------------------------------------------

onMounted(() => {
  Object.entries(SOCKET_EVENTS).forEach(([eventName, handler]) => {
    socket.on(eventName, handler)
  })
  currentProjectSection.value = getCurrentSectionFromRoute()
  // A page without production has nothing to configure: the fallback
  // production of the store would get its episodes fetched for nothing.
  if (route.params.production_id) setProductionFromRoute()
})

onBeforeUnmount(() => {
  Object.entries(SOCKET_EVENTS).forEach(([eventName, handler]) => {
    socket.off(eventName, handler)
  })
})
</script>

<style lang="scss" scoped>
.dark {
  a,
  .user-menu ul a {
    color: $white-grey;
  }

  .topbar .nav,
  .user-menu {
    background-color: $black;
    color: $white-grey;
    border-left: 1px solid #2f3136;
    border-bottom: 1px solid #2f3136;
  }

  .changelog-button,
  .help-button {
    color: $grey;

    &:hover {
      color: $white;
    }
  }

  hr {
    background-color: $grey-strong;
  }
}

.nav {
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
  left: 0;
  max-height: 60px;
  min-height: 60px;
  position: fixed;
  right: 0;
  z-index: 204;
  border-bottom: 1px solid transparent;
}

.user-menu {
  animation: slide-down 0.5s ease;
  background-color: $white;
  box-shadow: 2px 3px 3px rgba(0, 0, 0, 0.2);
  border-left: 1px solid $white-grey;
  border-bottom: 1px solid $white-grey;
  border-bottom-left-radius: 10px;
  max-width: 360px;
  min-width: 220px;
  padding: 10px;
  position: fixed;
  right: 0;
  top: 60px;
  z-index: 203;
}

.user-menu li.disabled {
  cursor: not-allowed;
  opacity: 0.5;

  // Keep hover on the <li> so the title tooltip still surfaces.
  > * {
    pointer-events: none;
  }
}

// Stack both label states in one cell so the menu doesn't jump width
// on toggle (i18n: labels can differ in length).
.label-stack {
  display: grid;
  grid-template-areas: 'stack';

  > span {
    grid-area: stack;
  }

  > .ghost {
    visibility: hidden;
  }
}

@keyframes slide-down {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.user-menu ul {
  margin-left: 0;
}

.user-menu li {
  cursor: default;
  padding: 0.2em;
  padding-left: 0.4em;
  font-size: 1.1em;
  list-style-type: none;

  &:not(.version):hover {
    cursor: pointer;
    background: var(--background-hover);
    border-radius: 5px;
  }
}

.user-menu ul a {
  display: flex;
  color: #333;
}

.c-mask-user-menu {
  position: fixed;
  z-index: 202;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.page-title {
  color: var(--text);
  font-size: 1.4em;
  font-weight: 800;
  margin-top: -2px;
}

.version {
  color: $grey;
}

.changelog-button,
.help-button {
  color: $light-grey;

  &:hover {
    color: var(--text);
  }
}

.help-button {
  margin-top: 3px;
}

@media screen and (max-width: 768px) {
  .nav-item:has(.changelog-button),
  .nav-item:has(.help-button) {
    display: none;
  }

  .nav-right .nav-item {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }

  .studio-logo-wrapper {
    margin-right: 0;
  }

  .global-search {
    display: none;
  }

  .nav-left {
    flex: 1 1 auto;
    min-width: 0;
  }

  .nav-right {
    display: flex;
    flex: 0 0 auto;
  }
}

.studio-logo-wrapper {
  margin: 8px 8px;
  margin-right: 1em;
  overflow: hidden;
  padding: 0;

  .studio-logo {
    border-radius: 5px;
    min-height: 36px;
    width: 36px;
  }
}

.notification-bell {
  margin-top: 9px;
}
</style>

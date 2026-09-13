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
          :class="{ disabled: desktopNotificationsPermission === 'denied' }"
          :title="
            desktopNotificationsPermission === 'denied'
              ? $t('notifications.desktop.banner_blocked_text')
              : null
          "
          :aria-disabled="desktopNotificationsPermission === 'denied'"
          :aria-label="
            desktopNotificationsPermission === 'denied'
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

<script>
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  LogOutIcon,
  ZapIcon
} from 'lucide-vue-next'
import { mapGetters, mapActions } from 'vuex'

import { version } from '@/../package.json'
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

// Pages about one episode: no other episode can stand in for a missing one.
const EPISODE_PAGE_ROUTES = [
  'episode',
  'episode-episode-task',
  'episode-episode-task-preview'
]

export default {
  name: 'topbar',

  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    GlobalSearchField,
    HelpCircleIcon,
    LogOutIcon,
    NotificationBell,
    PeopleAvatar,
    TopbarEpisodeList,
    TopbarProductionList,
    TopbarSectionList,
    ShortcutModal,
    ZapIcon
  },

  setup() {
    const {
      isSupported,
      isActive,
      permission,
      preferenceEnabled,
      setPreferenceEnabled,
      showNotification,
      withDesktopNotificationLock
    } = useDesktopNotifications()
    return {
      isDesktopNotificationsSupported: isSupported,
      isDesktopNotificationsActive: isActive,
      desktopNotificationsPermission: permission,
      desktopNotificationsPreferenceEnabled: preferenceEnabled,
      setDesktopNotificationsEnabled: setPreferenceEnabled,
      showDesktopNotification: showNotification,
      withDesktopNotificationLock
    }
  },

  data() {
    return {
      currentProductionId: this.$route.params.production_id,
      currentEpisodeId: this.$route.params.episode_id,
      currentProjectSection: this.isCurrentUserClient ? 'playlists' : 'assets',
      kitsuVersion: version,
      silent: true,
      hasConfiguredProduction: false,
      display: {
        shortcutModal: false
      }
    }
  },

  mounted() {
    this.currentProjectSection = this.getCurrentSectionFromRoute()
    // A page without production has nothing to configure: the fallback
    // production of the store would get its episodes fetched for nothing.
    if (this.$route.params.production_id) this.setProductionFromRoute()
  },

  computed: {
    ...mapGetters([
      'currentEpisode',
      'currentProduction',
      'episodes',
      'episodeOptionGroups',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isCurrentUserVendor',
      'isDarkTheme',
      'isEpisodeListLoaded',
      'isSupportChat',
      'isUserMenuHidden',
      'isTVShow',
      'lastProductionRoute',
      'lastProductionViewed',
      'mainConfig',
      'notifications',
      'openProductions',
      'organisation',
      'organisationLogoPath',
      'productionEditTaskTypes',
      'productionMap',
      'projectPlugins',
      'user'
    ]),

    // A video-game production has no main pack: its assets all belong to a
    // chapter, so the selector never offers the pseudo-episode.
    hasMainPack() {
      return this.currentProduction?.production_style !== 'video-game'
    },

    assetSections() {
      return ['assets', 'assetTypes', 'playlists']
    },

    editSections() {
      return ['edits']
    },

    shotSections() {
      return ['shots']
    },

    breakdownSections() {
      return ['breakdown']
    },

    scheduleSections() {
      return ['schedule']
    },

    // Asset pages require a all section and a main pack section.
    currentEpisodeOptionGroups() {
      let section = this.isCurrentUserClient ? 'playlists' : 'assets'
      if (this.currentProjectSection) {
        section = this.currentProjectSection
      }
      // Plugin pages accept the all / main pseudo-episodes (forwarded to
      // the plugin iframe as episode_id): without these options the
      // combobox silently displays the first episode while the route
      // says "all".
      if (this.$route.params.plugin_id !== undefined) {
        const episodeList = this.getBaseEpisodeOptionGroups(
          'episodes.all_episodes'
        )
        return [{ name: '', episodeList }].concat(this.episodeOptionGroups)
      }
      if (this.assetSections.includes(section)) {
        const episodeList = this.getBaseEpisodeOptionGroups('main.all_assets')
        if (section === 'playlists') {
          // Same all pseudo-episode, split by entity type through the query.
          episodeList.splice(1, 0, {
            label: this.$t('main.all_shots'),
            value: 'all',
            query: { for_entity: 'shot' }
          })
        }
        return [{ name: '', episodeList }].concat(this.episodeOptionGroups)
      } else if (['edits'].includes(section)) {
        return [
          {
            name: '',
            episodeList: [{ label: this.$t('main.all_edits'), value: 'all' }]
          }
        ].concat(this.episodeOptionGroups)
      } else if (['breakdown'].includes(section)) {
        const episodeList = this.getBaseEpisodeOptionGroups('shots.episodes')
        return [{ name: '', episodeList }].concat(this.episodeOptionGroups)
      } else if (this.shotSections.includes(section)) {
        // No main pack for shots: every shot of a TV show belongs to an
        // episode, so the only pseudo-episode is "all".
        return [
          {
            name: '',
            episodeList: [{ label: this.$t('main.all_shots'), value: 'all' }]
          }
        ].concat(this.episodeOptionGroups)
      } else if (this.scheduleSections.includes(section)) {
        const episodeList = this.getBaseEpisodeOptionGroups(
          'episodes.all_episodes'
        )
        return [{ name: '', episodeList }].concat(this.episodeOptionGroups)
      } else {
        return this.episodeOptionGroups
      }
    },

    hasEpisodeId() {
      return this.$route.params.episode_id
    },

    isProductionContext() {
      return (
        this.$route.params.production_id !== undefined ||
        this.$route.path.indexOf('my-tasks') === 0
      )
    },

    pageTitle() {
      if (this.isProductionContext) return ''
      const titleKey = this.$route.meta?.title
      return titleKey ? this.$t(titleKey) : ''
    },

    isEpisodeContext() {
      const isPlugin = this.$route.params.plugin_id !== undefined
      return (
        this.isTVShow &&
        this.hasEpisodeId &&
        (!['episodes', 'episode-stats'].includes(this.currentSectionOption) ||
          isPlugin) &&
        // Do not display combobox if there is no episode
        this.episodes.length > 0
      )
    },

    lastProduction() {
      let production = this.productionMap.get(this.lastProductionViewed)
      if (!production) {
        production = this.currentProduction
      }
      return production
    },

    sectionOptions() {
      if (!this.currentProduction) return []

      let options = []
      const isNotOnlyAssets =
        this.currentProduction.production_type !== 'assets'
      const isNotOnlyShots = this.currentProduction.production_type !== 'shots'

      if (isNotOnlyShots) {
        options.push({ label: this.$t('assets.title'), value: 'assets' })
      }
      if (isNotOnlyAssets) {
        options.push({ label: this.$t('shots.title'), value: 'shots' })
      }
      if (!this.isCurrentUserClient && isNotOnlyAssets) {
        options.push({ label: this.$t('sequences.title'), value: 'sequences' })
      }

      // Show only if there are task types for Edit in this production.
      if (this.productionEditTaskTypes.length > 0) {
        options.push({ label: this.$t('edits.title'), value: 'edits' })
      }

      if (this.isTVShow && !this.isCurrentUserClient) {
        options.push({ label: this.$t('episodes.title'), value: 'episodes' })
      }

      options = options.concat([{ label: 'separator', value: 'separator' }])

      if (!this.isCurrentUserClient) {
        options = options.concat([
          { label: this.$t('concepts.title'), value: 'concepts' }
        ])
      }

      if (!this.isCurrentUserClient && isNotOnlyShots) {
        options = options.concat([
          { label: this.$t('breakdown.title'), value: 'breakdown' }
        ])
      }
      options = options.concat([
        { label: this.$t('playlists.title'), value: 'playlists' }
      ])

      if (this.isCurrentUserClient) {
        const playlistSection = options.pop()
        options = [playlistSection].concat(options)
      }

      if (!this.isCurrentUserClient) {
        options.push({ label: this.$t('news.title'), value: 'newsFeed' })
      }

      if (!this.isCurrentUserClient) {
        options.push({ label: 'separator', value: 'separator' })
      }

      // Add sequences
      if (isNotOnlyAssets) {
        options.push({
          label: this.$t('sequences.stats_title'),
          value: 'sequence-stats'
        })
      }

      // Add episodes for tv show only
      if (this.isTVShow) {
        options = options.concat([
          { label: this.$t('episodes.stats_title'), value: 'episode-stats' }
        ])
      }

      // Add asset types stats
      if (isNotOnlyShots) {
        options = options.concat([
          {
            label: this.$t('asset_types.production_title'),
            value: 'assetTypes'
          }
        ])
      }

      // Show these sections to studio members only.
      if (!this.isCurrentUserClient) {
        if (!this.isCurrentUserVendor) {
          options = options.concat([
            { label: 'separator', value: 'separator' },
            { label: this.$t('schedule.title'), value: 'schedule' }
          ])
        }
        if (isNotOnlyAssets) {
          options.push({ label: this.$t('quota.title'), value: 'quota' })
        }
        if (this.isCurrentUserAdmin) {
          options.push({ label: this.$t('budget.title'), value: 'budget' })
        }
        options.push({ label: this.$t('people.team'), value: 'team' })

        this.projectPlugins.forEach(plugin => {
          options.push({
            label: plugin.name,
            value: plugin.plugin_id,
            icon: plugin.icon,
            plugin_id: plugin.plugin_id,
            type: 'plugin'
          })
        })

        if (this.isCurrentUserManager) {
          options = options.concat([
            { label: 'separator', value: 'separator' },
            { label: this.$t('settings.title'), value: 'production-settings' }
          ])
        } else {
          options = options.concat([
            { label: 'separator', value: 'separator' },
            {
              label: this.$t('productions.brief.title'),
              value: 'brief'
            }
          ])
        }
      }

      if (this.isCurrentUserVendor) {
        options = [
          { label: this.$t('assets.title'), value: 'assets' },
          { label: this.$t('shots.title'), value: 'shots' },
          { label: this.$t('sequences.title'), value: 'sequences' }
        ]

        // Show only if there are task types for Edit in this production.
        if (this.productionEditTaskTypes.length > 0) {
          options.push({ label: this.$t('edits.title'), value: 'edits' })
        }

        if (this.isTVShow) {
          options.push({ label: this.$t('episodes.title'), value: 'episodes' })
        }
        options.push({
          label: this.$t('asset_types.production_title'),
          value: 'assetTypes'
        })
      }

      return options
    },

    currentSectionOption() {
      return this.sectionOptions.find(
        option => option.value === this.currentProjectSection
      )?.value
    }
  },

  methods: {
    ...mapActions([
      'clearEpisodes',
      'logout',
      'clearSelectedTasks',
      'decrementNotificationCounter',
      'loadEpisodes',
      'incrementNotificationCounter',
      'markAllNotificationsAsReadLocal',
      'resetNotificationCounter',
      'saveLastProductionRoute',
      'setProduction',
      'setCurrentEpisode',
      'setSupportChat',
      'toggleDarkTheme',
      'toggleNotificationReadStatusLocal',
      'toggleSidebar',
      'toggleUserMenu'
    ]),

    async onLogout() {
      // The push resolves before the render flush unmounts the current
      // page: wait for the next tick so the session purge cannot race
      // against watchers still reading the store.
      await this.$router.push({ name: 'login' })
      await this.$nextTick()
      try {
        await this.logout()
      } catch (error) {
        console.error('An error occurred while logout', error)
      }
    },

    async toggleDesktopNotifications() {
      if (this.desktopNotificationsPermission === 'denied') return
      try {
        const payload = buildTestNotificationPayload(
          this.$t,
          this.organisationLogoPath
        )
        await this.setDesktopNotificationsEnabled(
          !this.desktopNotificationsPreferenceEnabled,
          {
            ...payload,
            onClick: () => this.$router.push(payload.route).catch(() => {})
          }
        )
      } catch (err) {
        console.error(err)
      }
    },

    async showDesktopNotificationForNew(notificationId) {
      if (!this.isDesktopNotificationsActive) return
      // Multi-tab lock: skips fetch + popup in non-leader tabs.
      await this.withDesktopNotificationLock(notificationId, async () => {
        try {
          const notification = await this.$store.dispatch(
            'loadNotification',
            notificationId
          )
          if (!notification) return
          // State may have changed during the fetch (user toggled off, permission revoked).
          if (!this.isDesktopNotificationsActive) return
          const payload = buildDesktopNotificationPayload(notification, {
            t: this.$t,
            personMap: this.$store.getters.personMap,
            productionMap: this.$store.getters.productionMap,
            taskTypeMap: this.$store.getters.taskTypeMap,
            organisationLogoPath: this.organisationLogoPath
          })
          this.showDesktopNotification({
            ...payload,
            onClick: () => this.$router.push(payload.route).catch(() => {})
          })
        } catch (err) {
          console.error(err)
        }
      })
    },

    getCurrentSectionFromRoute() {
      if (this.$route.name.includes('production-plugin')) {
        return this.$route.params.plugin_id
      }
      if (this.$route.name === 'person') {
        return 'person'
      }
      let name = ''
      const segments = this.$route.path.split('/')
      if (this.isTVShow) name = segments[5]
      if (this.isTVShow && name && name.length === 36) name = 'episodes'
      if (!name) {
        name = segments[3]
        if (name === 'episodes' && segments.length === 6) {
          name = segments[5]
        }
      }
      if (name === 'asset-types') name = 'assetTypes'
      if (name === 'news-feed') name = 'newsFeed'
      return name
    },

    getBaseEpisodeOptionGroups(allLabel) {
      const episodeList = [{ label: this.$t(allLabel), value: 'all' }]
      if (this.hasMainPack) {
        episodeList.push({ label: this.$t('main.main_pack'), value: 'main' })
      }
      return episodeList
    },

    updateContext(productionId) {
      if (!productionId) {
        this.clearContext()
      } else {
        this.setProductionFromRoute()
      }
    },

    clearContext() {
      this.silent = true
      this.currentProductionId = null
      this.currentProjectSection = this.isCurrentUserClient
        ? 'playlists'
        : 'assets'
      if (!this.isTVShow) {
        this.setCurrentEpisode(null)
        this.currentEpisodeId = null
      }
      this.setProduction(null)
      this.silent = false
    },

    setProductionFromRoute() {
      const routeProductionId = this.$route.params.production_id
      const routeEpisodeId = this.$route.params.episode_id
      if (this.isProductionChanged(routeProductionId)) {
        this.configureProduction(routeProductionId)
        return
      }
      // Already the production of the store, its fallback one on a first
      // load: a later switch must not pass for a first load.
      this.hasConfiguredProduction = true
      if (this.isEpisodeChanged(routeEpisodeId)) {
        this.configureEpisode(routeEpisodeId)
      } else {
        this.updateCombosFromRoute()
      }
    },

    configureProduction(routeProductionId) {
      // Initial app load (e.g. F5 / direct link) has no previous production:
      // honor the URL episode. Production switch defaults to 'all' for assets.
      const isInitialLoad = !this.hasConfiguredProduction
      this.hasConfiguredProduction = true
      this.setProduction(routeProductionId)
      this.currentProductionId = routeProductionId
      this.currentEpisodeId = null
      this.clearEpisodes()
      if (this.isTVShow && this.currentProjectSection !== 'person') {
        this.loadEpisodes()
          .then(episodes => {
            // The fetch may outlive a navigation: resolve from the route at
            // response time, and give up if the production moved.
            if (this.$route.params.production_id !== routeProductionId) return
            const routeEpisodeId = this.$route.params.episode_id
            const query = this.$route.query
            this.currentProjectSection = this.getCurrentSectionFromRoute()
            if (
              EPISODE_PAGE_ROUTES.includes(this.$route.name) &&
              !this.isKnownEpisode(routeEpisodeId)
            ) {
              this.redirectToKnownEpisode()
              return
            }
            if (this.currentProjectSection === 'assets') {
              // An episode of this production is kept on any load: a switch
              // through the production list carries an episode of the one
              // left. That switch carries pseudo-episodes too, which only a
              // first load keeps.
              const isOwnEpisode = this.episodes.some(
                ({ id }) => id === routeEpisodeId
              )
              const isKeptPseudoEpisode =
                isInitialLoad &&
                this.keepsPseudoEpisode(
                  'assets',
                  routeEpisodeId,
                  this.$route.params.plugin_id
                )
              this.currentEpisodeId =
                isOwnEpisode || isKeptPseudoEpisode ? routeEpisodeId : 'all'
            } else if (
              this.keepsPseudoEpisode(
                this.currentProjectSection,
                routeEpisodeId,
                this.$route.params.plugin_id
              )
            ) {
              this.currentEpisodeId = routeEpisodeId
            } else {
              const episode = episodes.find(({ id }) => id === routeEpisodeId)
              // Only a direct link with an id the production does not know
              // resolves like a stale in-session link. A production switch
              // carries the episode of the production left and a
              // pseudo-episode the section does not keep needs an episode:
              // both open the running one.
              const isStaleLink =
                isInitialLoad &&
                routeEpisodeId &&
                !['all', 'main'].includes(routeEpisodeId)
              this.currentEpisodeId =
                episode?.id ||
                (isStaleLink
                  ? this.fallbackEpisodeId(
                      this.currentProjectSection,
                      this.$route.params.plugin_id
                    )
                  : this.runningEpisodeId())
            }
            // Replace: this corrects the landing URL, it is no navigation of
            // the user's. A push would keep the rejected URL in the history
            // and Back would land on it, to be corrected again.
            this.$router.replace({
              params: {
                production_id: routeProductionId,
                episode_id: this.currentEpisodeId
              },
              query
            })
            // The navigation is confirmed asynchronously: pass the episode
            // just resolved, or the route still names the one being left and
            // the coercion navigates a second time, over this very one.
            this.updateCombosFromRoute(this.currentEpisodeId)
          })
          .catch(console.error)
      } else {
        this.updateCombosFromRoute()
      }
    },

    configureEpisode(routeEpisodeId) {
      if (!this.isEpisodeListLoaded) {
        // The fetch may outlive a production switch: its response must not
        // resolve the route against the list of the production left.
        const routeProductionId = this.$route.params.production_id
        this.loadEpisodes()
          .then(() => {
            if (this.$route.params.production_id !== routeProductionId) return
            this.setEpisodeFromRoute()
            this.updateCombosFromRoute()
          })
          .catch(console.error)
      } else {
        this.setEpisodeFromRoute()
        this.updateCombosFromRoute()
      }
    },

    isProductionChanged(productionId) {
      return (
        !this.currentProduction ||
        this.currentProductionId !== productionId ||
        this.currentProduction.id !== productionId
      )
    },

    isEpisodeChanged(episodeId) {
      return (
        this.isTVShow &&
        (!this.currentEpisode ||
          this.currentEpisodeId !== episodeId ||
          this.currentEpisode.id !== episodeId ||
          // Deleted while no page of the production was shown: the route and
          // the store still name it, it must be resolved again.
          (Boolean(episodeId) &&
            this.isEpisodeListLoaded &&
            !this.isKnownEpisode(episodeId)))
      )
    },

    setEpisodeFromRoute() {
      const routeEpisodeId = this.$route.params.episode_id
      if (this.isEpisodeChanged(routeEpisodeId)) {
        if (routeEpisodeId && this.isTVShow) {
          if (this.isKnownEpisode(routeEpisodeId)) {
            this.setCurrentEpisode(routeEpisodeId)
          } else {
            this.redirectToKnownEpisode()
          }
        }
      } else if (!routeEpisodeId) {
        this.silent = true
        this.clearEpisodes()
        this.currentEpisodeId = null
        this.silent = false
      }
    },

    isKnownEpisode(episodeId) {
      return (
        ['all', 'main'].includes(episodeId) ||
        this.episodes.some(({ id }) => id === episodeId)
      )
    },

    // A stale link (deleted episode, URL copied from another production)
    // must not reach the store: SET_CURRENT_EPISODE cannot resolve the id,
    // the combobox goes blank and a mounted page keeps the list it had.
    redirectToKnownEpisode() {
      // The pages of an episode the production lost, its detail page and its
      // own tasks, have no stand-in: another episode under the same URL shape
      // would mislead.
      if (EPISODE_PAGE_ROUTES.includes(this.$route.name)) {
        this.$router
          .replace({
            name: 'episodes',
            params: { production_id: this.$route.params.production_id }
          })
          .catch(console.error)
        return
      }
      const episodeId = this.fallbackEpisodeId(
        this.getCurrentSectionFromRoute(),
        this.$route.params.plugin_id
      )
      this.$router
        .replace({
          name: this.$route.name,
          params: { ...this.$route.params, episode_id: episodeId },
          query: this.$route.query
        })
        .catch(console.error)
    },

    runningEpisodeId() {
      const episode =
        this.episodes.find(({ status }) => status === 'running') ||
        this.episodes[0]
      return episode?.id || 'all'
    },

    // Episode shown instead of one the route names but the production does
    // not have: 'all' where the section offers it, the running episode
    // elsewhere. Shared by the direct link and the in-session paths.
    fallbackEpisodeId(section, pluginId) {
      return this.offersAllEpisodes(section, pluginId)
        ? 'all'
        : this.runningEpisodeId()
    },

    // Sections whose episode selector offers the all pseudo-episode. Plugin
    // pages forward it to their iframe; the Shots page lists every shot of
    // the production under it but has no main pack.
    offersAllEpisodes(section, pluginId) {
      return (
        pluginId !== undefined ||
        this.assetSections.includes(section) ||
        this.editSections.includes(section) ||
        this.breakdownSections.includes(section) ||
        this.scheduleSections.includes(section) ||
        this.shotSections.includes(section)
      )
    },

    // Sections whose episode selector offers the main pack: the Edits and
    // Shots pages list episode-bound entities only.
    offersMainPack(section, pluginId) {
      return (
        this.hasMainPack &&
        (pluginId !== undefined ||
          this.assetSections.includes(section) ||
          this.breakdownSections.includes(section) ||
          this.scheduleSections.includes(section))
      )
    },

    // Whether the route keeps the pseudo-episode it names: only where the
    // selector of the section offers it.
    keepsPseudoEpisode(section, episodeId, pluginId) {
      if (episodeId === 'all') return this.offersAllEpisodes(section, pluginId)
      if (episodeId === 'main') return this.offersMainPack(section, pluginId)
      return false
    },

    updateCombosFromRoute(resolvedEpisodeId = null) {
      const productionId = this.$route.params.production_id
      const pluginId = this.$route.params.plugin_id
      const section = this.getCurrentSectionFromRoute()
      const routeEpisodeId = resolvedEpisodeId ?? this.$route.params.episode_id
      // A page without episode keeps the one of the store, which the section
      // links reopen.
      let episodeId = routeEpisodeId ?? this.currentEpisode?.id
      this.silent = true
      this.currentProductionId = productionId
      this.currentProjectSection = section
      this.currentPluginId = pluginId
      // A pseudo-episode the section does not offer opens the running
      // episode, the same fallback as a direct link: Back from a corrected
      // link must not land on a third episode.
      if (
        routeEpisodeId &&
        ['all', 'main'].includes(episodeId) &&
        !this.keepsPseudoEpisode(section, episodeId, pluginId) &&
        this.episodes.length > 0
      ) {
        episodeId = this.runningEpisodeId()
        this.currentEpisodeId = episodeId
        // Replace: the URL just rejected must not stay in the history, or
        // the back button lands on it and is coerced here again.
        this.pushContextRoute(section, pluginId, true)
      } else {
        this.currentEpisodeId = episodeId
      }
    },

    pushContextRoute(section, pluginId = null, replace = false) {
      const isAssetSection = this.assetSections.includes(section)
      const production = this.productionMap.get(this.currentProductionId)
      const isTVShow = production?.production_type === 'tvshow'
      let episodeId = this.currentEpisodeId
      if (!episodeId && isTVShow) {
        if (isAssetSection) {
          episodeId = 'all'
        } else if (this.episodes.length > 0) {
          episodeId = this.episodes[0].id
        } else {
          episodeId = production?.first_episode_id
        }
      }
      // The router names the asset types, news feed and plugin pages
      // differently from the sections the topbar reads off the path: a
      // plugin page is a section named after the plugin itself.
      const routeSection = pluginId
        ? 'production-plugin'
        : { assetTypes: 'production-asset-types', newsFeed: 'news-feed' }[
            section
          ] || section
      let route = {
        name: routeSection,
        params: {
          production_id: this.currentProductionId,
          plugin_id: pluginId
        }
      }
      route = this.episodifyRoute(route, routeSection, episodeId, isTVShow)
      if (['assets', 'shots'].includes(section)) {
        route.query = { search: '' }
      }
      if (route && route.params.production_id) {
        const navigate = replace ? this.$router.replace : this.$router.push
        navigate.call(this.$router, route).catch(err => {
          console.error(err)
        })
      }
    },

    episodifyRoute(route, section, episodeId, isTVShow) {
      const isEpisodeContext =
        isTVShow &&
        section !== 'team' &&
        section !== 'news-feed' &&
        section !== 'production-settings' &&
        section !== 'brief' &&
        section !== 'budget' &&
        section !== 'episodes'
      if (isEpisodeContext) {
        route.name = `episode-${section}`
        route.params.episode_id = episodeId
      } else if (section === 'episodes' && !isTVShow) {
        route.name = this.isCurrentUserClient ? 'playlists' : 'assets'
      }
      return route
    }
  },

  watch: {
    // Most changes occur through the route modification. We need to update
    // the context when the route changes.
    $route() {
      const productionId = this.$route.params.production_id
      if (productionId) {
        const route = this.$route
        this.saveLastProductionRoute(route)
        this.updateContext(productionId)
      }
    },

    currentEpisode() {
      this.silent = true
      if (!this.currentEpisode) {
        this.currentEpisodeId = null
      } else if (this.currentEpisodeId !== this.currentEpisode.id) {
        this.currentEpisodeId = this.currentEpisode.id
      }
      this.$nextTick(() => {
        this.silent = false
      })
    },

    // A live deletion of the displayed episode leaves the route, the store
    // and the selector on an id the production no longer has: move to the
    // same fallback as a stale link. A production switch also rewrites the
    // list, but the store resolves another episode from the new list then.
    episodes() {
      const routeEpisodeId = this.$route.params.episode_id
      const isDisplayedEpisodeGone =
        routeEpisodeId &&
        this.currentEpisode?.id === routeEpisodeId &&
        !this.isKnownEpisode(routeEpisodeId)
      if (isDisplayedEpisodeGone) this.redirectToKnownEpisode()
    },

    currentSectionOption() {
      this.clearSelectedTasks()
    },

    isSupportChat() {
      localPreferences.setPreference('support:show', this.isSupportChat)
    }
  },

  socket: {
    events: {
      'notification:new'(eventData) {
        if (this.user.id !== eventData.person_id) return
        const onNotificationsPage = this.$route.name === 'notifications'
        // The bell badge is irrelevant on /notifications (list shown directly,
        // refreshes on return for background tabs).
        if (!onNotificationsPage) {
          this.incrementNotificationCounter()
        }
        if (!eventData.notification_id) return
        // Desktop popup is redundant only when /notifications is foregrounded;
        // background tab can't see the list so the OS popup is still needed.
        const pageIsVisible =
          typeof document === 'undefined' ||
          document.visibilityState === 'visible'
        if (onNotificationsPage && pageIsVisible) return
        this.showDesktopNotificationForNew(eventData.notification_id)
      },

      'notification:all-read'(eventData) {
        if (this.user.id === eventData.person_id) {
          this.resetNotificationCounter()
          this.markAllNotificationsAsReadLocal()
        }
      },

      'notification:read'(eventData) {
        if (this.user.id === eventData.person_id) {
          if (this.$route.name === 'notifications') {
            const notification = this.notifications.find(
              notification => notification.id === eventData.notification_id
            )
            if (notification && !notification.read) {
              this.toggleNotificationReadStatusLocal(notification)
            }
          } else {
            this.decrementNotificationCounter()
          }
        }
      },

      'notification:unread'(eventData) {
        if (this.user.id === eventData.person_id) {
          if (this.$route.name === 'notifications') {
            const notification = this.notifications.find(
              notification => notification.id === eventData.notification_id
            )
            if (notification && notification.read) {
              this.toggleNotificationReadStatusLocal(notification)
            }
          } else {
            this.incrementNotificationCounter()
          }
        }
      }
    }
  }
}
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

  .go-productions-label {
    display: none;
  }

  .nav-right .nav-item {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }

  .studio-logo-wrapper {
    margin-right: 0;
  }

  .nav-left .nav-item:has(.go-productions-label) {
    padding-left: 0;
  }

  .global-search {
    display: none;
  }

  .nav-left {
    flex: 1 1 auto;
    min-width: 0;
  }

  .nav-right {
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

@media screen and (max-width: 768px) {
  .nav-right {
    display: flex;
  }
}
</style>

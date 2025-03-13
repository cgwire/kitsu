<template>
  <div class="topbar">
    <nav class="nav">
      <div class="nav-left">
        <a
          class="studio-logo-wrapper nav-item"
          @click="toggleSidebar()"
          v-if="!isCurrentUserClient"
        >
          <img
            class="studio-logo"
            :src="logoPath"
            v-if="organisation?.has_avatar"
          />
          <img class="studio-logo" src="@/assets/kitsu.png" v-else />
        </a>

        <router-link
          class="studio-logo-wrapper nav-item"
          :to="{ name: 'open-productions' }"
          v-else
        >
          <img
            class="studio-logo"
            :src="logoPath"
            v-if="organisation?.has_avatar"
          />
          <img class="studio-logo" src="@/assets/kitsu.png" v-else />
        </router-link>

        <div class="flexrow topbar-menu" v-if="isProductionContext">
          <div class="flexrow-item subitem">
            <topbar-production-list
              :episode-id="currentEpisodeId"
              :production-list="openProductions"
              :production="currentProduction"
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
          <router-link :to="lastProductionRoute" class="flexrow">
            <chevron-left-icon />
            {{ $t('main.go_productions') }}
          </router-link>
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
          {{ $t('timesheets.title') }}
        </router-link>
        <global-search-field
          class="flexrow-item mr0"
          v-if="mainConfig.indexer_configured"
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
        <div class="nav-item pointer" @click="toggleUserMenu">
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
        <li @click="toggleDarkTheme">
          {{ !isDarkTheme ? $t('main.dark_theme') : $t('main.white_theme') }}
        </li>
        <li @click="setSupportChat(!isSupportChat)">
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
          <a @click="display.shortcutModal = true">
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
          <a href="https://twitter.com/cgwirekitsu" target="_blank"> X </a>
        </li>
        <li>
          <a href="https://cgwire.canny.io" target="_blank">
            Roadmap / Feedback
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
        <li class="flexrow" @click="onLogoutClicked">
          <log-out-icon class="flexrow-item icon-1x" />
          <span class="flexrow-item">{{ $t('main.logout') }}</span>
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
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  LogOutIcon,
  ZapIcon
} from 'lucide-vue-next'

import localPreferences from '@/lib/preferences'

import GlobalSearchField from '@/components/tops/GlobalSearchField.vue'
import NotificationBell from '@/components/widgets/NotificationBell.vue'
import PeopleAvatar from '@/components/widgets/PeopleAvatar.vue'
import ShortcutModal from '@/components/modals/ShortcutModal.vue'
import TopbarEpisodeList from '@/components/tops/TopbarEpisodeList.vue'
import TopbarProductionList from '@/components/tops/TopbarProductionList.vue'
import TopbarSectionList from '@/components/tops/TopbarSectionList.vue'

import { version } from '@/../package.json'

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

  data() {
    return {
      currentProductionId: this.$route.params.production_id,
      currentEpisodeId: this.$route.params.episode_id,
      currentProjectSection: this.isCurrentUserClient ? 'playlists' : 'assets',
      kitsuVersion: version,
      silent: true,
      display: {
        shortcutModal: false
      }
    }
  },

  mounted() {
    this.currentProjectSection = this.getCurrentSectionFromRoute()
    this.setProductionFromRoute()
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
      'isSupportChat',
      'isUserMenuHidden',
      'isTVShow',
      'lastProductionRoute',
      'lastProductionViewed',
      'mainConfig',
      'openProductions',
      'organisation',
      'productionMap',
      'productionEditTaskTypes',
      'user'
    ]),

    logoPath() {
      return (
        '/api/pictures/thumbnails/' +
        `organisations/${this.organisation.id}.png`
      )
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

    // Asset pages require a all section and a main pack section.
    currentEpisodeOptionGroups() {
      let section = this.isCurrentUserClient ? 'playlists' : 'assets'
      if (this.currentProjectSection) {
        section = this.currentProjectSection
      }
      if (this.assetSections.includes(section)) {
        return [
          {
            name: '',
            episodeList: [
              { label: this.$t('main.all_assets'), value: 'all' },
              { label: this.$t('main.main_pack'), value: 'main' }
            ]
          }
        ].concat(this.episodeOptionGroups)
      } else if (['playlists'].includes(section)) {
        return [
          {
            name: '',
            episodeList: [
              { label: this.$t('main.all_assets'), value: 'all' },
              { label: this.$t('main.main_pack'), value: 'main' }
            ]
          }
        ].concat(this.episodeOptionGroups)
      } else if (['edits'].includes(section)) {
        return [
          {
            name: '',
            episodeList: [{ label: this.$t('main.all_edits'), value: 'all' }]
          }
        ].concat(this.episodeOptionGroups)
      } else if (['breakdown'].includes(section)) {
        return [
          {
            name: '',
            episodeList: [
              { label: this.$t('shots.episodes'), value: 'all' },
              { label: this.$t('main.main_pack'), value: 'main' }
            ]
          }
        ].concat(this.episodeOptionGroups)
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

    isEpisodeContext() {
      return (
        this.isTVShow &&
        this.hasEpisodeId &&
        !['episodes', 'episode-stats'].includes(this.currentSectionOption) &&
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
        options = options.concat([
          { label: 'separator', value: 'separator' },
          { label: this.$t('schedule.title'), value: 'schedule' }
        ])
        if (isNotOnlyAssets) {
          options.push({ label: this.$t('quota.title'), value: 'quota' })
        }
        options.push({ label: this.$t('people.team'), value: 'team' })

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
      'clearSelectedTasks',
      'loadEpisodes',
      'incrementNotificationCounter',
      'logout',
      'saveLastProductionRoute',
      'setProduction',
      'setCurrentEpisode',
      'setSupportChat',
      'toggleDarkTheme',
      'toggleSidebar',
      'toggleUserMenu'
    ]),

    onLogoutClicked() {
      this.logout((err, success) => {
        this.$socket.disconnect()
        if (err) console.error(err)
        this.toggleUserMenu()
        if (success) this.$router.push('/login')
      })
    },

    getCurrentSectionFromRoute() {
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
        this.configureProduction(routeProductionId, routeEpisodeId)
      } else if (this.isEpisodeChanged(routeEpisodeId)) {
        this.configureEpisode(routeEpisodeId)
      } else {
        this.updateCombosFromRoute()
      }
    },

    configureProduction(routeProductionId, routeEpisodeId = undefined) {
      this.setProduction(routeProductionId)
      this.currentProductionId = routeProductionId
      this.currentEpisodeId = null
      this.clearEpisodes()
      if (this.isTVShow && this.currentProjectSection !== 'person') {
        this.loadEpisodes()
          .then(episodes => {
            const query = this.$route.query
            if (this.currentProjectSection === 'assets') {
              this.currentEpisodeId = 'all'
            } else {
              let episode = episodes.find(({ id }) => id === routeEpisodeId)
              if (!episode) {
                episode = episodes.find(({ status }) => status === 'running')
                query.search = ''
              }
              this.currentEpisodeId = episode?.id || 'all'
            }
            this.$router.push({
              params: {
                production_id: routeProductionId,
                episode_id: this.currentEpisodeId
              },
              query
            })
          })
          .catch(console.error)
      } else {
        this.updateCombosFromRoute()
      }
    },

    configureEpisode(routeEpisodeId) {
      if (this.episodes.length < 2) {
        this.loadEpisodes()
          .then(episodes => {
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
          this.currentEpisode.id !== episodeId)
      )
    },

    setEpisodeFromRoute() {
      const routeEpisodeId = this.$route.params.episode_id
      if (this.isEpisodeChanged(routeEpisodeId)) {
        if (routeEpisodeId && this.isTVShow) {
          this.setCurrentEpisode(routeEpisodeId)
        }
      } else if (!routeEpisodeId) {
        this.silent = true
        this.clearEpisodes()
        this.currentEpisodeId = null
        this.silent = false
      }
    },

    updateCombosFromRoute() {
      const productionId = this.$route.params.production_id
      const section = this.getCurrentSectionFromRoute()
      let episodeId = this.$route.params.episode_id
      this.silent = true
      this.currentProductionId = productionId
      this.currentProjectSection = section
      const isAssetSection = this.assetSections.includes(section)
      const isEditSection = this.editSections.includes(section)
      const isBreakdownSection = this.breakdownSections.includes(section)
      if (
        !isAssetSection &&
        !isEditSection &&
        !isBreakdownSection &&
        ['all', 'main'].includes(episodeId)
      ) {
        episodeId = this.episodes[0].id
        this.currentEpisodeId = episodeId
        this.pushContextRoute(section)
      } else {
        this.currentEpisodeId = episodeId
      }
    },

    pushContextRoute(section) {
      const isAssetSection = this.assetSections.includes(section)
      const production = this.productionMap.get(this.currentProductionId)
      const isTVShow = production.production_type === 'tvshow'
      let episodeId = this.currentEpisodeId
      if (!episodeId && isTVShow) {
        if (isAssetSection) {
          episodeId = 'all'
        } else if (this.episodes.length > 0) {
          episodeId = this.episodes[0].id
        } else {
          episodeId = production.first_episode_id
        }
      }
      let route = {
        name: section,
        params: {
          production_id: this.currentProductionId
        }
      }
      route = this.episodifyRoute(route, section, episodeId, isTVShow)
      if (['assets', 'shots'].includes(section)) {
        route.query = { search: '' }
      }
      if (route && route.params.production_id) {
        this.$router.push(route).catch(err => {
          console.error(err)
        })
      }
    },

    episodifyRoute(route, section, episodeId, isTVShow) {
      const isEpisodeContext =
        isTVShow &&
        section !== 'team' &&
        section !== 'news-feed' &&
        section !== 'schedule' &&
        section !== 'production-settings' &&
        section !== 'brief' &&
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
        if (
          this.user.id === eventData.person_id &&
          this.$route.name !== 'notifications'
        ) {
          this.incrementNotificationCounter()
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
  min-width: 220px;
  padding: 10px;
  position: fixed;
  right: 0;
  top: 60px;
  width: 220px;
  z-index: 203;
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
  display: block;
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

.studio-logo-wrapper {
  margin: 8px 8px;
  margin-right: 1em;
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

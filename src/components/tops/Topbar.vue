<template>
  <div class="topbar">
    <div id="c-mask-user-menu" @click="toggleUserMenu()"
         v-bind:class="{'is-active': !isUserMenuHidden}"
    >
    </div>

    <nav class="nav">
      <div class="nav-left">
        <a
           class="nav-item sidebar-button"
           id="toggle-menu-button"
           @click='toggleSidebar()'
           :class="{'selected': !isSidebarHidden}"
           v-if="!isCurrentUserClient"

        >
          ≡
        </a>

        <div
          class="flexrow topbar-menu"
          v-if="isProductionContext"
        >
          <div class="flexrow-item subitem">
            <topbar-production-list
              :episode-id="currentEpisodeId"
              :production-list="openProductions"
              :production="currentProduction"
              :section="currentSectionOption"
            />
          </div>
          <div class="flexrow-item">
            <chevron-right-icon class="mt05" size="1.4x" />
          </div>
          <div class="flexrow-item subitem">
            <topbar-section-list
              :episode-id="currentEpisodeId"
              :section-list="sectionOptions"
              :section="currentSectionOption"
            />
          </div>
          <div class="flexrow-item" v-if="isEpisodeContext">
            <chevron-right-icon class="mt05" size="1.4x" />
          </div>
          <div class="flexrow-item subitem">
            <topbar-episode-list
              :episode-list="currentEpisodeOptions"
              :episode-id="currentEpisodeId"
              :section="currentSectionOption"
              v-if="isEpisodeContext"
            />
          </div>
        </div>
        <div
          class="nav-item"
          v-else-if="lastProduction && $route.path !== '/open-productions'"
        >
          <router-link
            :to="lastSectionPath"
            class="flexrow"
          >
            <chevron-left-icon />
            {{ $t('main.go_productions') }}
          </router-link>
        </div>
      </div>

      <div class="nav-right">
        <router-link
          class="nav-item"
          :to="{
            name: 'todos-tab',
            params: { tab: 'todos' }
          }"
          v-if="!isCurrentUserAdmin"
        >
          {{ $t('tasks.my_tasks') }}
        </router-link>

        <router-link
          class="nav-item"
          :to="{
            name: 'todos-tab',
            params: { tab: 'timesheets' }
          }"
          v-if="!isCurrentUserAdmin"
        >
          {{ $t('timesheets.title') }}
        </router-link>
        <div class="nav-item">
          <button  data-canny-changelog class="changelog-button" >
            <zap-icon />
          </button>
        </div>
        <notification-bell />
        <div
          :class="{
            'nav-item': true,
            'user-nav': true,
            active: !isUserMenuHidden
          }"
          ref="user-name"
          @click="toggleUserMenu"
        >
          <people-avatar
            ref="avatar"
            class="avatar"
            :no-cache="true"
            :person="user"
            :is-link="false"
          />
        </div>
      </div>
    </nav>

    <nav
      class="user-menu"
      ref="user-menu"
      :style="{
        top: isUserMenuHidden ? '-460px' : '60px'
      }"
    >
      <ul>
        <router-link to="/profile" @click.native="toggleUserMenu()">
          <li>
              {{ $t("main.profile") }}
          </li>
        </router-link>
        <li @click="toggleDarkTheme">
          <span v-if="!isDarkTheme">
            {{ $t("main.dark_theme")}}
          </span>
          <span v-else>
            {{ $t("main.white_theme")}}
          </span>
        </li>
        <hr />
        <a href="https://kitsu.cg-wire.com" target="_blank">
          <li>
            {{ $t("main.documentation")}}
          </li>
        </a>
        <a
          href="https://www.youtube.com/playlist?list=PLp_1gB5ZBHXqnQgZ4TCrAt7smxesaDo29"
          target="_blank"
        >
          <li>
            {{ $t('main.tutorials') }}
          </li>
        </a>
        <a
          @click="display.shortcutModal = true"
        >
          <li>
            {{ $t('keyboard.shortcuts') }}
          </li>
        </a>
        <hr />
        <a href="https://discord.gg/VbCxtKN" target="_blank">
          <li>
            Discord
          </li>
        </a>
        <a href="https://cgwire.canny.io" target="_blank">
          <li>
            Roadmap / Feedback
          </li>
        </a>
        <hr />
        <a href="https://cg-wire.com/en/about.html" target="_blank">
          <li>
            {{ $t("main.about") }}
          </li>
        </a>
        <li class="version">
          Kitsu {{ kitsuVersion }}
        </li>
        <hr />
        <li class="flexrow" @click="onLogoutClicked">
          <log-out-icon class="flexrow-item" size="1x" />
          <span class="flexrow-item">{{ $t("main.logout") }}</span>
        </li>
      </ul>
    </nav>

    <shortcut-modal
      :active="display.shortcutModal"
      @cancel="display.shortcutModal = false"
    />

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
  ZapIcon
} from 'vue-feather-icons'

import TopbarEpisodeList from '@/components/tops/TopbarEpisodeList'
import TopbarProductionList from '@/components/tops/TopbarProductionList'
import TopbarSectionList from '@/components/tops/TopbarSectionList'
import NotificationBell from '@/components/widgets/NotificationBell'
import PeopleAvatar from '@/components/widgets/PeopleAvatar'
import ShortcutModal from '@/components/modals/ShortcutModal'

import { version } from '@/../package.json'

export default {
  name: 'topbar',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    LogOutIcon,
    NotificationBell,
    PeopleAvatar,
    TopbarEpisodeList,
    TopbarProductionList,
    TopbarSectionList,
    ShortcutModal,
    ZapIcon
  },

  data () {
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

  mounted () {
    Canny('initChangelog', { // eslint-disable-line
      appID: '5db968118d1a9c132c168d54',
      position: 'bottom',
      align: 'right'
    })
    this.currentProjectSection = this.getCurrentSectionFromRoute()
    this.setProductionFromRoute()
  },

  computed: {
    ...mapGetters([
      'assetsPath',
      'currentEpisode',
      'currentProduction',
      'episodes',
      'episodeOptions',
      'isCurrentUserArtist',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserVendor',
      'isDarkTheme',
      'isSidebarHidden',
      'isUserMenuHidden',
      'isTVShow',
      'isNewNotification',
      'lastProductionScreen',
      'lastProductionViewed',
      'openProductions',
      'openProductionOptions',
      'productionMap',
      'productionEditTaskTypes',
      'user'
    ]),

    assetSections () {
      return ['assets', 'assetTypes', 'playlists']
    },

    editSections () {
      return ['edits']
    },

    shotSections () {
      return ['shots']
    },

    breakdownSections () {
      return ['breakdown']
    },

    // Asset pages require a all section and a main pack section.
    currentEpisodeOptions () {
      if (this.assetSections.includes(this.currentProjectSection)) {
        return [
          { label: this.$t('main.all_assets'), value: 'all' },
          { label: 'Main Pack', value: 'main' }
        ].concat(this.episodeOptions)
      } else if (['playlists'].includes(this.currentProjectSection)) {
        return [
          { label: this.$t('main.all_assets'), value: 'all' },
          { label: 'Main Pack', value: 'main' }
        ].concat(this.episodeOptions)
      } else if (['edits'].includes(this.currentProjectSection)) {
        return [
          { label: this.$t('main.all_edits'), value: 'all' }
        ].concat(this.episodeOptions)
      } else if (['breakdown'].includes(this.currentProjectSection)) {
        return [
          { label: this.$t('shots.episodes'), value: 'all' },
          { label: 'Main Pack', value: 'main' }
        ].concat(this.episodeOptions)
      } else {
        return this.episodeOptions
      }
    },

    hasEpisodeId () {
      return this.$route.params.episode_id
    },

    isProductionContext () {
      return this.$route.params.production_id !== undefined ||
        this.$route.path.indexOf('tasks') > 0
    },

    isEpisodeContext () {
      return this.isTVShow &&
             this.hasEpisodeId &&
             // Do not display combobox if there is no episode
             this.episodes.length > 0
    },

    lastProduction () {
      let production = this.productionMap.get(this.lastProductionViewed)
      if (!production) {
        production = this.currentProduction
      }
      return production
    },

    lastSectionPath () {
      const production = this.lastProduction
      const section = this.lastProductionScreen
      const route = {
        name: section,
        params: {
          production_id: production.id
        }
      }
      if (production.production_type === 'tvshow') {
        route.name = `episode-${section}`
        route.params.episode_id = production.first_episode_id
      }
      return route
    },

    sectionOptions () {
      let options = [
        { label: this.$t('assets.title'), value: 'assets' },
        { label: this.$t('shots.title'), value: 'shots' }
      ]

      // Show only if there are task types for Edit in this production.
      if (this.productionEditTaskTypes.length > 0) {
        options.push(
          { label: this.$t('edits.title'), value: 'edits' }
        )
      }

      options = options.concat([
        { label: this.$t('breakdown.title'), value: 'breakdown' },
        { label: this.$t('playlists.title'), value: 'playlists' },
        { label: this.$t('news.title'), value: 'newsFeed' },
        { label: 'separator', value: 'separator' }
      ])

      // Add sequences
      options.push(
        { label: this.$t('sequences.title'), value: 'sequences' }
      )

      // Add episodes for tv show only
      if (this.isTVShow) {
        options.push(
          { label: this.$t('episodes.title'), value: 'episodes' }
        )
      }

      // Add asset types stats and playlists
      options = options.concat([
        {
          label: this.$t('asset_types.production_title'), value: 'assetTypes'
        }
      ])

      // Show these sections to studio members only.
      if (!this.isCurrentUserClient) {
        options = options.concat([
          { label: 'separator', value: 'separator' },
          { label: this.$t('schedule.title'), value: 'schedule' },
          { label: this.$t('quota.title'), value: 'quota' },
          { label: this.$t('people.team'), value: 'team' }
        ])

        if (this.isCurrentUserAdmin) {
          options = options.concat([
            { label: 'separator', value: 'separator' },
            { label: this.$t('settings.title'), value: 'production-settings' }
          ])
        }
      } else {
        const playlistSection = options.pop()
        options = [playlistSection].concat(options)
      }

      if (this.isCurrentUserVendor) {
        options = [
          { label: this.$t('assets.title'), value: 'assets' },
          { label: this.$t('shots.title'), value: 'shots' },
          { label: this.$t('sequences.title'), value: 'sequences' }
        ]

        if (this.isTVShow) {
          options.push(
            { label: this.$t('episodes.title'), value: 'episodes' }
          )
        }
        options.push({
          label: this.$t('asset_types.production_title'), value: 'assetTypes'
        })
      }

      return options
    },

    currentSectionOption () {
      return (
        this.sectionOptions.find(
          o => o.value === this.currentProjectSection) || {}
      ).value
    }
  },

  methods: {
    ...mapActions([
      'clearEpisodes',
      'loadEpisodes',
      'loadMilestones',
      'incrementNotificationCounter',
      'logout',
      'setProduction',
      'setCurrentEpisode',
      'toggleDarkTheme',
      'toggleSidebar',
      'toggleUserMenu'
    ]),

    onLogoutClicked () {
      this.logout((err, success) => {
        this.$socket.disconnect()
        if (err) console.error(err)
        this.toggleUserMenu()
        if (success) this.$router.push('/login')
      })
    },

    getCurrentSectionFromRoute () {
      let name = ''
      const segments = this.$route.path.split('/')
      if (this.isTVShow) name = segments[5]
      if (!name) {
        name = segments[3]
        if (name === 'episodes' && segments.length === 6) name = segments[5]
      }
      if (name === 'asset-types') name = 'assetTypes'
      if (name === 'news-feed') name = 'newsFeed'
      return name
    },

    updateContext (productionId) {
      if (!productionId) {
        this.clearContext()
      } else {
        this.setProductionFromRoute()
      }
    },

    clearContext () {
      this.silent = true
      this.currentProductionId = null
      this.currentProjectSection = null
      if (!this.isTVShow) {
        this.setCurrentEpisode(null)
        this.currentEpisodeId = null
      }
      this.setProduction(null)
      this.silent = false
    },

    setProductionFromRoute () {
      const routeProductionId = this.$route.params.production_id
      const routeEpisodeId = this.$route.params.episode_id
      if (this.isProductionChanged(routeProductionId)) {
        this.configureProduction(routeProductionId)
      } else if (this.isEpisodeChanged(routeEpisodeId)) {
        this.configureEpisode(routeEpisodeId)
      } else {
        this.updateCombosFromRoute()
      }
    },

    configureProduction (routeProductionId) {
      this.setProduction(routeProductionId)
      if (this.isTVShow) {
        this.loadEpisodes()
          .then((episodes) => {
            this.updateCombosFromRoute()
          })
          .catch(console.error)
      } else {
        this.clearEpisodes()
        this.updateCombosFromRoute()
      }
    },

    configureEpisode (routeEpisodeId) {
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

    isProductionChanged (productionId) {
      return (
        !this.currentProduction ||
        this.currentProductionId !== productionId ||
        this.currentProduction.id !== productionId
      )
    },

    isEpisodeChanged (episodeId) {
      return (
        this.isTVShow &&
        (
          !this.currentEpisode ||
          this.currentEpisodeId !== episodeId ||
          this.currentEpisode.id !== episodeId
        )
      )
    },

    setEpisodeFromRoute () {
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

    updateCombosFromRoute () {
      const productionId = this.$route.params.production_id
      const section = this.getCurrentSectionFromRoute()
      let episodeId = this.$route.params.episode_id
      this.silent = true
      this.currentProductionId = productionId
      this.currentProjectSection = section
      const isAssetSection = this.assetSections.includes(section)
      const isEditSection = this.editSections.includes(section)
      const isBreakdownSection = this.breakdownSections.includes(section)
      if (!isAssetSection && !isEditSection && !isBreakdownSection && ['all', 'main'].includes(episodeId)) {
        episodeId = this.episodes[0].id
        this.currentEpisodeId = episodeId
        this.pushContextRoute(section)
      } else {
        this.currentEpisodeId = episodeId
      }
    },

    pushContextRoute (section) {
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

    episodifyRoute (route, section, episodeId, isTVShow) {
      const isEpisodeContext =
        isTVShow &&
        section !== 'team' &&
        section !== 'news-feed' &&
        section !== 'schedule' &&
        section !== 'production-settings' &&
        section !== 'episodes'
      if (isEpisodeContext) {
        route.name = `episode-${section}`
        route.params.episode_id = episodeId
      } else if (section === 'episodes' && !isTVShow) {
        route.name = this.isCurrentUserClient ? 'playlists' : 'assets'
      }
      return route
    },

    resetEpisodeForTVShow (soft = false) { // TODO seems deprecated
      const section =
        this.currentProjectSection || this.getCurrentSectionFromRoute()
      const isAssetSection = this.assetSections.includes(section)
      const isEditSection = this.editSections.includes(section)
      const isShotSection = this.shotSections.includes(section)
      const isAssetEpisode =
        ['all', 'main'].includes(this.currentEpisodeId)
      const production = this.productionMap.get(this.currentProductionId)
      if (!production) return
      const isTVShow = production.production_type === 'tvshow'

      if (isAssetEpisode) {
        // It's an asset episode. We have to switch if we are in a shot
        // section.
        if (isShotSection) {
          // Set current episode to first episode if it's a shot section.
          this.currentEpisodeId =
            this.episodes.length > 0 ? this.episodes[0].id : null
        }
      }

      // If no episode is set and we are in a tv show, select the first one.
      if (isTVShow) {
        // It's an asset section, and episode is not set, we chose all
        if ((isAssetSection || isEditSection) && !this.currentEpisodeId) {
          this.currentEpisodeId = 'all'
          this.setCurrentEpisode(this.currentEpisodeId)
          // It's a shot section, and episode is not set, we chose the first
          // one.
        } else if (!this.currentEpisode) {
          if (!this.currentEpisodeId) {
            if (this.episodes.length > 0) {
              this.currentEpisodeId = this.episodes[0].id
            } else {
              this.currentEpisodeId = production.first_episode_id
            }
          }
          this.setCurrentEpisode(this.currentEpisodeId)
        } else if (!this.currentEpisodeId && this.currentEpisode) {
          this.currentEpisodeId = this.currentEpisode.id
        }
      } else {
        this.currentEpisodeId = null
      }
    }
  },

  watch: {
    $route () {
      const productionId = this.$route.params.production_id
      if (productionId) {
        this.updateContext(productionId)
      }
    },

    currentProduction () {
      this.$nextTick(() => {
        this.loadMilestones()
      })
    },

    currentEpisode () {
      this.silent = true
      if (!this.currentEpisode) {
        this.currentEpisodeId = null
      } else if (this.currentEpisodeId !== this.currentEpisode.id) {
        this.currentEpisodeId = this.currentEpisode.id
      }
      this.$nextTick(() => {
        this.silent = false
      })
    }
  },

  socket: {
    events: {
      'notification:new' (eventData) {
        if (this.user.id === eventData.person_id &&
            this.$route.name !== 'notifications') {
          this.incrementNotificationCounter()
        }
      },

      'person:update' (eventData) {
        if (this.user.id === eventData.person_id) {
          this.$refs.avatar.reloadAvatar()
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

  #toggle-menu-button:hover {
    color: $white-grey;
  }

  .topbar .nav,
  .user-menu {
    background-color: $black;
    color: $white-grey;
    border-left: 1px solid #2F3136;
    border-bottom: 1px solid #2F3136;
  }

  .changelog-button {
    color: $grey;
  }

  hr {
    background-color: $grey-strong;
  }

  .user-menu li {
    &:not(.version):hover {
      background: $dark-grey-light;
    }
  }
}

.nav {
  box-shadow: 0px 0px 6px rgba(0,0,0,0.2);
  max-height: 60px;
  min-height: 60px;
  z-index: 204;
  position: fixed;
  left: 0;
  right: 0;
}

#toggle-menu-button {
  font-size: 2em;
}

.avatar {
  margin-right: 10px;
  min-width: 40px;
}

.user-nav {
  cursor: pointer;
}

.user-nav.active {
}

.user-menu {
  position: fixed;
  width: 220px;
  min-width: 220px;
  right: 0;
  background-color: white;
  padding: 1em 1em 1em 1em;
  z-index: 203;
  box-shadow: 2px 3px 3px rgba(0,0,0,0.2);
  border-left: 1px solid $white-grey;
  border-bottom: 1px solid $white-grey;
  transition: top .5s ease;
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
    background: $white-grey;
    border-radius: 5px;
  }
}

.user-menu ul a {
  color: #333;
}

#c-mask-user-menu {
  position: fixed;
  z-index: 202;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  background-color: #000;
  opacity: 0;
}

#c-mask-user-menu.is-active {
  width: 100%;
  height: 100%;
}

.nav-right {
  padding-right: 0;
  flex-grow: 0;
}

.context-selector-label {
  margin-right: 1em;
}

.context-selector {
  margin-top: 23px;
  margin-right: 1em;
}

.icon-link {
  margin: 0 0.5em;
}

strong {
  margin-right: 1em;
}

.version {
  color: $grey;
}

.changelog-button {
  background: transparent;
  color: $light-grey;
  cursor: pointer;
}

.topbar-menu {
  padding: 10px;
}

@media screen and (max-width: 768px) {
  .home-button {
    display: none;
  }

  .nav-right {
    display: flex;
    flex:0;
  }

  .nav-item {
    justify-content: right;
  }

  .user-name {
    display: none;
  }

  .avatar {
    margin-right: 0;
  }

  .user-menu {
    right: -160;
  }

  .icon-link,
  .context-selector-label {
    display: none;
  }

  .field.context-selector {
    padding: 0;
    margin-top: 2em;
  }
}
</style>

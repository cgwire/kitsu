<template>
  <div class="topbar">
    <div id="c-mask-user-menu" @click="toggleUserMenu()"
         v-bind:class="{'is-active': !isUserMenuHidden}"
    >
    </div>

    <nav class="nav">
      <div class="nav-left">
        <a class="nav-item sidebar-button" id="toggle-menu-button"
           @click='toggleSidebar()'
           v-bind:class="{'selected': !isSidebarHidden}">
          ≡
        </a>

        <router-link
          class="nav-item home-button"
          to="/"
        >
          <img src="../assets/logo.png" />
        </router-link>

        <div :class="{
          'nav-item': true,
        }" v-if="isProductionContext">
          <div class="level">
            <div class="level-item">
              <combobox
                class="context-selector"
                :options="openProductionOptions"
                :is-top="true"
                v-model="currentProductionId"
              />
              <strong>
              >
              </strong>
              <combobox
                class="context-selector"
                :options="navigationOptions"
                :is-top="true"
                v-model="currentProjectSection"
              />
              <strong
                v-if="isEpisodeContext"
              >
              >
              </strong>
              <combobox
                class="context-selector"
                :options="episodeOptions"
                :is-top="true"
                v-model="currentEpisodeId"
                v-if="isEpisodeContext"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="nav-right">
        <div
          class="nav-item"
        >
          <router-link :to="{name: 'notifications'}">
            <bell-icon
              :class="notificationBellClass"
            />
          </router-link>
        </div>

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
            class="avatar"
            :person="user"
            :is-link="false"
          />
          <people-name
            class="user-name"
            :person="user"
          />
        </div>
      </div>
    </nav>

    <nav
      class="user-menu"
      ref="user-menu"
      v-show="!isUserMenuHidden"
    >
      <ul>
        <li>
          <router-link to="/profile" @click.native="toggleUserMenu()">
            {{ $t("main.profile") }}
          </router-link>
        </li>
        <li>
          <a href="https://kitsu.cg-wire.com" target="_blank">
            {{ $t("main.documentation ")}}
          </a>
        </li>
        <li @click="logout">
          {{ $t("main.logout") }}
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { BellIcon } from 'vue-feather-icons'

import Combobox from './widgets/Combobox'
import PeopleAvatar from './widgets/PeopleAvatar'
import PeopleName from './widgets/PeopleName'

export default {
  name: 'topbar',
  components: {
    BellIcon,
    Combobox,
    PeopleName,
    PeopleAvatar
  },

  data () {
    return {
      currentProductionId: null,
      currentEpisodeId: null,
      currentProjectSection: 'assets'
    }
  },

  mounted () {
    const userMenu = this.$refs['user-menu']
    const userName = this.$refs['user-name']
    if (userName) {
      const userNameWidth = userName.clientWidth

      if (userNameWidth > 100) {
        userMenu.style.width = `${userNameWidth}px`
        userName.style.width = `${userNameWidth}px`
      }
    }

    this.currentProductionId = this.$route.params.production_id
  },

  computed: {
    ...mapGetters([
      'assetsPath',
      'assetTypesPath',
      'episodesPath',
      'breakdownPath',
      'playlistsPath',
      'sequencesPath',
      'shotsPath',
      'teamPath',

      'currentEpisode',
      'currentProduction',
      'episodes',
      'episodeOptions',
      'isSidebarHidden',
      'isUserMenuHidden',
      'isTVShow',
      'isNewNotification',
      'openProductions',
      'openProductionOptions',
      'user'
    ]),

    notificationBellClass () {
      if (this.isNewNotification) {
        return 'has-notifications'
      } else {
        return 'has-no-notifications'
      }
    },

    isShotPage () {
      return this.$route.params.episode_id
    },

    isProductionContext () {
      return this.$route.params.production_id !== undefined ||
        this.$route.path.indexOf('tasks') > 0
    },

    isEpisodeContext () {
      return this.isTVShow &&
             this.isShotPage &&
             // Do not display combobox if there is no episode
             this.episodes.length > 0
    },

    navigationOptions () {
      const options = [
        {label: this.$t('assets.title'), value: 'assets'},
        {label: this.$t('shots.title'), value: 'shots'},
        {label: this.$t('sequences.title'), value: 'sequences'},
        {label: this.$t('episodes.title'), value: 'episodes'},
        {label: this.$t('asset_types.title'), value: 'assetTypes'},
        {label: this.$t('breakdown.title'), value: 'breakdown'},
        {label: this.$t('playlists.title'), value: 'playlists'},
        {label: this.$t('people.team'), value: 'team'}
      ]
      if (!this.isTVShow) { // Remove episode Section from the list.
        options.splice(3, 1)
      }
      return options
    }
  },

  methods: {
    ...mapActions([
      'clearEpisodes',
      'loadEpisodes',
      'loadNotification',
      'setProduction',
      'setCurrentEpisode',
      'toggleSidebar',
      'toggleUserMenu',
      'logout'
    ]),

    logout () {
      this.$store.dispatch('logout', (err, success) => {
        if (err) console.log(err)
        this.toggleUserMenu()
        if (success) this.$router.push('/login')
      })
    },

    getCurrentSectionFromRoute () {
      let name = ''
      const segments = this.$route.path.split('/')
      if (this.isTVShow) {
        name = segments[5]
      }
      if (!name) {
        name = segments[3]

        if (name === 'episodes' && segments.length === 6) {
          name = segments[5]
        }
      }

      if (name === 'asset-types') name = 'assetTypes'
      return name
    },

    updateRoute () {
      const currentSection = this.getCurrentSectionFromRoute()
      let section = this.currentProjectSection
      if (section === 'asset-types') section = 'assetTypes'

      // Edge case: manage shots modal

      const isListPage =
        (this.$route.params.episode_id && this.$route.params.length === 2) ||
        (!this.$route.params.episode_id && this.$route.params.length === 1)

      const isContextChanged =
        section !== currentSection ||
        this.$route.params.episode_id !== this.currentEpisodeId ||
        this.$route.params.production_id !== this.currentProductionId

      const isProperContext =
        this.$route.params.production_id &&
        this.currentProduction &&
        ((this.isTVShow && this.currentEpisode) || !this.isTVShow) &&
        section &&
        this.$route.path.indexOf('manage') < 0

      if (isProperContext) {
        if (!isListPage && isContextChanged) {
          this.$router.push(this[`${section}Path`])
        } else if (isListPage) {
          this.$router.push(this[`${section}Path`])
        }
      }

      return this.$route.path
    }
  },

  watch: {
    $route () {
      const productionId = this.$route.params.production_id
      const episodeId = this.$route.params.episode_id

      // Url changes because current production changes.
      if (productionId && this.currentProductionId !== productionId) {
        this.currentProductionId = productionId

      // Url changes because current episode changes.
      } else if (episodeId && this.currentEpisodeId !== episodeId) {
        this.currentEpisodeId = episodeId
      }

      if (!productionId) {
        this.currentProductionId = null
        this.currentEpisodeId = null
        this.currentProjectSection = null
        this.setCurrentEpisode(null)
        this.setProduction(null)
      } else {
        let section = this.getCurrentSectionFromRoute()
        if (this.currentProjectSection !== section) {
          this.currentProjectSection = section
        }
      }
    },

    currentProductionId () {
      this.setProduction(`${this.currentProductionId}`)
      this.clearEpisodes()
      if (this.isTVShow) {
        this.loadEpisodes(() => {
          if (!this.currentEpisode) { // When production is empty
            this.currentProjectSection = this.getCurrentSectionFromRoute()
          } else {
            this.currentEpisodeId =
              this.$route.params.episode_id || this.currentEpisode.id
            this.currentProjectSection = this.getCurrentSectionFromRoute()
          }
        })
      } else {
        this.currentProjectSection = this.getCurrentSectionFromRoute()
        this.currentEpisodeId = null
        this.setProduction(`${this.currentProduction.id}`)
        this.updateRoute()
      }
    },

    currentEpisodeId () {
      if (this.isTVShow) {
        if (this.currentEpisode) {
          this.setCurrentEpisode(`${this.currentEpisodeId}`)
        } else {
          this.setCurrentEpisode(null)
        }
        this.updateRoute()
      } else {
        this.clearEpisodes()
      }
    },

    currentEpisode () {
      if (
        this.currentEpisode &&
        this.currentEpisode.id !== this.currentEpisodeId
      ) {
        this.currentEpisodeId = this.currentEpisode.id
      }
    },

    currentProjectSection () {
      this.updateRoute()
    }
  },

  socket: {
    events: {
      'notifications:new' (eventData) {
        if (this.user.id === eventData.person_id) {
          const notificationId = eventData.notification_id
          this.loadNotification(notificationId)
        }
      }
    }
  }
}
</script>

<style scoped>
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
}

.user-nav {
  cursor: pointer;
}

.user-nav.active {
}

.user-menu {
  position: fixed;
  top: 60px;
  width: 200px;
  right: 0;
  background-color: white;
  padding: 1em 1em 1em 1em;
  z-index: 203;
  box-shadow: 2px 3px 3px rgba(0,0,0,0.2);
  transition-property: all;
  transition-duration: .5s;
  transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
  border-left: 1px solid #EEE;
  border-bottom: 1px solid #EEE;
}

.user-menu ul {
  margin-left: 0;
}

.user-menu li {
  cursor: pointer;
  padding: 0.2em;
  font-size: 1.1em;
  list-style-type: none;
}

.user-menu li a {
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
}

.context-selector-label {
  margin-right: 1em;
}

.context-selector {
  margin-top: 23px;
  margin-right: 1em;
}

.has-no-notifications {
  margin-top: 5px;
  color: #CCC;
}

.has-notifications {
  margin-top: 5px;
  color: #00B242;
}

.icon-link {
  margin: 0 0.5em;
}

strong {
  margin-right: 1em;
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

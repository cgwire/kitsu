<template>
  <div class="navbar">
    <aside :class="{ 'hidden-bar': isSidebarHidden }">
      <div>
        <router-link class="home-link" to="/" @click="toggleSidebar()">
          <div class="company-logo has-text-centered">
            <img
              :src="logoPath"
              v-if="organisation && organisation.has_avatar"
            />
            <img
              src="../../assets/kitsu-text-dark.svg"
              width="180"
              v-else-if="isDarkTheme"
            />
            <img src="../../assets/kitsu-text.svg" width="180" v-else />
          </div>
        </router-link>

        <section>
          <div v-if="!isCurrentUserClient">
            <h2>{{ $t('main.workspace') }}</h2>

            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'todos' }">
                <check-icon size="0.9x" />
                {{ $t('tasks.my_tasks') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()" v-if="isCurrentUserSupervisor">
              <router-link :to="{ name: 'checks' }">
                <play-circle-icon size="0.9x" />
                {{ $t('tasks.my_checks') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'open-productions' }">
                <film-icon size="0.9x" />
                {{ $t('productions.open_productions') }}
              </router-link>
            </p>
          </div>

          <div v-if="!isCurrentUserClient && !isCurrentUserVendor">
            <h2>{{ $t('main.studio') }}</h2>

            <p @click="toggleSidebar()" v-if="isCurrentUserAdmin">
              <router-link :to="{ name: 'productions' }">
                <film-icon size="0.9x" />
                {{ $t('productions.title') }}
              </router-link>
            </p>

            <p @click="toggleSidebar()" v-if="isCurrentUserAdmin">
              <router-link :to="{ name: 'people' }">
                <users-icon size="0.9x" />
                {{ $t('people.title') }}
              </router-link>
            </p>

            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'timesheets' }">
                <clock-icon size="0.9x" />
                {{ $t('timesheets.title') }}
              </router-link>
            </p>

            <p @click="toggleSidebar()" v-if="isCurrentUserAdmin">
              <router-link :to="{ name: 'main-schedule' }">
                <calendar-icon size="0.9x" />
                {{ $t('schedule.title_main') }}
              </router-link>
            </p>

            <p @click="toggleSidebar()">
              <router-link
                :to="{ name: 'newsfeed' }"
                v-if="isCurrentUserManager"
              >
                <clock-icon size="0.9x" />
                {{ $t('news.title') }}
              </router-link>
            </p>
          </div>

          <div v-if="isCurrentUserAdmin">
            <h2>{{ $t('main.admin') }}</h2>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'departments' }">
                <hexagon-icon size="0.9x" />
                {{ $t('departments.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link to="/task-types">
                <copy-icon size="0.9x" />
                {{ $t('task_types.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link to="/task-status" class="task-status-link">
                <award-icon size="0.9x" />
                {{ $t('task_status.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link to="/asset-types">
                <box-icon size="0.9x" />
                {{ $t('asset_types.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'custom-actions' }">
                <git-pull-request-icon size="0.9x" />
                {{ $t('custom_actions.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'status-automations' }">
                <tool-icon size="0.9x" />
                {{ $t('status_automations.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'settings' }">
                <settings-icon size="0.9x" />
                {{ $t('settings.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'logs' }">
                <list-icon size="0.9x" />
                {{ $t('logs.title') }}
              </router-link>
            </p>
          </div>
        </section>
      </div>
    </aside>
    <div
      id="c-mask"
      @click="toggleSidebar()"
      v-bind:class="{ 'is-active': !isSidebarHidden }"
    ></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  AwardIcon,
  BoxIcon,
  CopyIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  FilmIcon,
  GitPullRequestIcon,
  HexagonIcon,
  ListIcon,
  PlayCircleIcon,
  SettingsIcon,
  ToolIcon,
  UsersIcon
} from 'vue-feather-icons'

export default {
  name: 'sidebar',
  components: {
    AwardIcon,
    BoxIcon,
    CopyIcon,
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    FilmIcon,
    GitPullRequestIcon,
    HexagonIcon,
    ListIcon,
    PlayCircleIcon,
    SettingsIcon,
    ToolIcon,
    UsersIcon
  },

  data() {
    return {
      title: '',
      logoPath: ''
    }
  },

  mounted() {
    this.reset()
  },

  computed: {
    ...mapGetters([
      'isDarkTheme',
      'isCurrentUserAdmin',
      'isCurrentUserClient',
      'isCurrentUserManager',
      'isCurrentUserSupervisor',
      'isCurrentUserVendor',
      'isSidebarHidden',
      'organisation'
    ])
  },

  methods: {
    ...mapActions(['toggleSidebar']),

    reset() {
      this.title = this.organisation.name
      this.logoPath =
        '/api/pictures/thumbnails/organisations/' +
        `${this.organisation.id}.png?t=` +
        new Date().toISOString()
    }
  },

  watch: {
    organisation() {
      this.reset()
    }
  }
}
</script>

<style lang="scss" scoped>
.dark aside {
  background-color: #2f3136;
  color: $white-grey;

  a {
    color: $white-grey;
  }

  p:hover {
    background: $dark-grey-light;
  }
}

aside {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 250px;
  background-color: white;
  padding: 15px;
  overflow-y: auto;
  z-index: 205;
  box-shadow: 1px 0px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  h2 {
    border: 0;
    text-transform: uppercase;
    font-size: 1em;
    color: $grey;
  }
}

aside.hidden-bar {
  left: -250px;
  transition: all 0.3s ease;
}

aside p a {
  font-size: 1.4em;
  color: $grey-strong;
  display: flex;
  align-items: center;
  font-weight: 300;

  svg {
    margin-right: 0.5em;
  }
}

aside section {
  margin-bottom: 2em;
}

.sidebar-title {
  margin-top: 0.5em;
  margin-bottom: 1.5em;
  text-align: center;
  font-size: 1.6em;
}

.company-logo {
  width: 200px;
  img {
    border-radius: 5px;
  }
}

#c-mask {
  position: fixed;
  z-index: 204;
  top: 0;
  left: 0;
  overflow: hidden;
  width: 0;
  height: 0;
  background-color: #000;
  opacity: 0;
}

#c-mask.is-active {
  width: 100%;
  height: 100%;
}

h2 {
  margin-top: 2em;
  margin-bottom: 0.3em;
}

p {
  padding-left: 0.3em;
}

p:hover {
  cursor: pointer;
  background: $white-grey;
  border-radius: 5px;
  transform: scale(1.05);
  transition: 0.2s ease transform;
}

@media screen and (max-width: 768px) {
  .company-logo img {
    width: 40px;
    margin: 0;
    flex: 1;
  }

  .home-link {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .home-link h2 {
    margin-bottom: 0;
  }
}
</style>

<template>
  <div class="navbar">
    <aside :class="{ 'hidden-bar': isSidebarHidden, smallfont: isLongLocale }">
      <div>
        <router-link class="home-link" to="/" @click="toggleSidebar()">
          <div
            class="company-logo has-text-centered"
            :title="organisation.name"
          >
            <img
              :src="organisationLogoPath"
              :alt="organisation.name"
              v-if="organisation.has_avatar"
            />
            <img
              src="../../assets/kitsu-text-dark.svg"
              width="180"
              alt="Kitsu"
              v-else-if="isDarkTheme"
            />
            <img
              src="../../assets/kitsu-text.svg"
              width="180"
              alt="Kitsu"
              v-else
            />
          </div>
        </router-link>

        <section>
          <div v-if="!isCurrentUserClient">
            <h2>{{ $t('main.workspace') }}</h2>

            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'todos' }">
                <kitsu-icon class="nav-icon" name="my-tasks" />
                {{ $t('tasks.my_tasks') }}
              </router-link>
            </p>
            <p
              @click="toggleSidebar()"
              v-if="isCurrentUserSupervisor || isCurrentUserManager"
            >
              <router-link :to="{ name: 'checks' }">
                <kitsu-icon class="nav-icon" name="my-checks" />
                {{ $t('tasks.my_checks') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'entity-chats' }">
                <kitsu-icon class="nav-icon" name="message" />
                {{ $t('chats.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'open-productions' }">
                <kitsu-icon class="nav-icon" name="my-productions" />
                {{ $t('productions.open_productions') }}
              </router-link>
            </p>
          </div>

          <div v-if="!isCurrentUserClient && !isCurrentUserVendor">
            <h2>{{ $t('main.studio') }}</h2>

            <p @click="toggleSidebar()" v-if="isCurrentUserAdmin">
              <router-link :to="{ name: 'productions' }">
                <kitsu-icon class="nav-icon" name="productions" />
                {{ $t('productions.title') }}
              </router-link>
            </p>

            <p @click="toggleSidebar()" v-if="isCurrentUserAdmin">
              <router-link :to="{ name: 'people' }">
                <kitsu-icon class="nav-icon" name="team" />
                {{ $t('people.title') }}
              </router-link>
            </p>

            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'timesheets' }">
                <kitsu-icon class="nav-icon" name="timesheets" />
                {{ $t('timesheets.title') }}
              </router-link>
            </p>

            <p @click="toggleSidebar()" v-if="isCurrentUserAdmin">
              <router-link :to="{ name: 'main-schedule' }">
                <kitsu-icon class="nav-icon" name="schedule" />
                {{ $t('schedule.title_main') }}
              </router-link>
            </p>

            <p
              @click="toggleSidebar()"
              v-if="isCurrentUserSupervisor || isCurrentUserManager"
            >
              <router-link :to="{ name: 'team-schedule' }">
                <kitsu-icon class="nav-icon" name="team-schedule" />
                {{ $t('team_schedule.title_main') }}
              </router-link>
            </p>
            <p
              @click="toggleSidebar()"
              v-if="isCurrentUserSupervisor || isCurrentUserManager"
            >
              <router-link :to="{ name: 'all-tasks' }">
                <kitsu-icon class="nav-icon" name="check" />
                {{ $t('tasks.all_tasks') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()" v-if="isCurrentUserManager">
              <router-link :to="{ name: 'newsfeed' }">
                <kitsu-icon class="nav-icon" name="newsFeed" />
                {{ $t('news.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()" v-if="mainConfig.indexer_configured">
              <router-link :to="{ name: 'entity-search' }">
                <kitsu-icon class="nav-icon" name="search" />
                {{ $t('search.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'asset-library' }">
                <kitsu-icon class="nav-icon" name="assets" />
                {{ $t('library.asset_library') }}
              </router-link>
            </p>
          </div>
          <div v-for="plugin in studioPlugins" :key="plugin.id">
            <p @click="toggleSidebar()">
              <router-link
                :to="{
                  name: 'plugin',
                  params: { plugin_id: plugin.plugin_id }
                }"
              >
                <icon
                  class="nav-icon"
                  :name="plugin.icon"
                  :size="20"
                  :stroke-width="1.5"
                />
                {{ plugin.name }}
              </router-link>
            </p>
          </div>

          <div v-if="isCurrentUserAdmin">
            <h2>{{ $t('main.admin') }}</h2>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'departments' }">
                <kitsu-icon class="nav-icon" name="departments" />
                {{ $t('departments.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'studios' }">
                <building-icon class="nav-icon" />
                {{ $t('studios.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'task-types' }">
                <kitsu-icon class="nav-icon" name="task-types" />
                {{ $t('task_types.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'task-status' }">
                <kitsu-icon class="nav-icon" name="task-status" />
                {{ $t('task_status.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'asset-types' }">
                <kitsu-icon class="nav-icon" name="asset-types" />
                {{ $t('asset_types.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'salary-scale' }">
                <rows-4-icon class="nav-icon" />
                {{ $t('budget.salary_scale_title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'software-licenses' }">
                <egg-icon class="nav-icon" />
                {{ $t('software_licenses.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'hardware-items' }">
                <computer-icon class="nav-icon" />
                {{ $t('hardware_items.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'custom-actions' }">
                <kitsu-icon class="nav-icon" name="custom" />
                {{ $t('custom_actions.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'status-automations' }">
                <kitsu-icon class="nav-icon" name="automations" />
                {{ $t('status_automations.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'project-templates' }">
                <layers-icon class="nav-icon" />
                {{ $t('project_templates.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'backgrounds' }">
                <globe-icon class="nav-icon" />
                {{ $t('backgrounds.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'bots' }">
                <bot-icon class="nav-icon" />
                {{ $t('bots.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'settings' }">
                <kitsu-icon class="nav-icon" name="settings" />
                {{ $t('settings.title') }}
              </router-link>
            </p>
            <p @click="toggleSidebar()">
              <router-link :to="{ name: 'logs' }">
                <kitsu-icon class="nav-icon" name="logs" />
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
      :class="{ 'is-active': !isSidebarHidden }"
    ></div>
  </div>
</template>

<script setup>
/* eslint-disable no-unused-vars */
import {
  BotIcon,
  BuildingIcon,
  ComputerIcon,
  EggIcon,
  GlobeIcon,
  LayersIcon,
  Rows4Icon
} from 'lucide-vue-next'
import { computed, defineAsyncComponent } from 'vue'
import { useStore } from 'vuex'

import { localeCode } from '@/lib/lang'

import KitsuIcon from '@/components/widgets/KitsuIcon.vue'

const Icon = defineAsyncComponent(() => import('@/components/widgets/Icon.vue'))
/* eslint-enable no-unused-vars */

const store = useStore()

// Computed
// --------------------------------------------------------------------------

const isCurrentUserAdmin = computed(() => store.getters.isCurrentUserAdmin)
const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)
const isCurrentUserManager = computed(() => store.getters.isCurrentUserManager)
const isCurrentUserSupervisor = computed(
  () => store.getters.isCurrentUserSupervisor
)
const isCurrentUserVendor = computed(() => store.getters.isCurrentUserVendor)
const isDarkTheme = computed(() => store.getters.isDarkTheme)
const isSidebarHidden = computed(() => store.getters.isSidebarHidden)
const mainConfig = computed(() => store.getters.mainConfig)
const organisation = computed(() => store.getters.organisation)
const organisationLogoPath = computed(() => store.getters.organisationLogoPath)
const studioPlugins = computed(() => store.getters.studioPlugins)

const isLongLocale = computed(() => ['fr', 'ja'].includes(localeCode.value))

// Functions
// --------------------------------------------------------------------------

const toggleSidebar = () => store.dispatch('toggleSidebar')
</script>

<style lang="scss" scoped>
.dark aside {
  background-color: #2f3136;
  color: $white-grey;

  a {
    color: $white-grey;
  }
}

aside {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 230px;
  background-color: white;
  padding: 15px;
  overflow-y: auto;
  z-index: 205;
  box-shadow: 1px 0 6px rgba(0, 0, 0, 0.2);
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
  background: var(--background-hover);
  border-radius: 5px;
  transform: scale(1.05);
  transition: 0.2s ease transform;
}

.nav-icon {
  margin-left: 0;
  margin-right: 0.5em;
  width: 20px;
}

.smallfont p {
  font-size: 0.85em;
}

@media screen and (max-width: 768px) {
  .company-logo {
    width: auto;
  }

  .company-logo img {
    max-width: 100%;
    margin: 0;
  }

  .home-link {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
</style>

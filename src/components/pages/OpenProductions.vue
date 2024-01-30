<template>
  <div class="open-productions page">
    <div class="social-contributions flexcolumn" v-if="isContributions">
      <h1 class="subtitle has-text-centered">
        {{ $t('intro.title') }}
      </h1>
      <div class="flexrow">
        <img
          class="flexrow-item kitsu-with-body"
          src="../../assets/illustrations/kitsu-band.png"
        />
        <div class="filler">
          <span class="close-contributions" @click="hideContributions">
            <x-icon size="0.9x" />
          </span>
          <p>
            {{ $t('intro.main') }}
          </p>
          <ul>
            <li>
              {{ $t('intro.first') }}
              <a href="https://github.com/cgwire/kitsu">GitHub</a>
            </li>
            <li>
              {{ $t('intro.second') }}
              <a href="https://twitter.com/cgwirekitsu">X</a>
              {{ $t('main.or') }}
              <a href="https://www.linkedin.com/company/cgwire/">LinkedIn</a>
            </li>
            <li>
              {{ $t('intro.third') }}
              <a href="https://discord.gg/VbCxtKN">Discord</a>
            </li>
            <li>
              {{ $t('intro.four') }}
              <a href="https://cgwire.canny.io">Canny</a>
            </li>
            <li>
              {{ $t('intro.five') }}
              <a href="https://liberapay.com/CGWire/donate">Liberapay</a>
            </li>
            <li>
              {{ $t('intro.six') }}
              <a href="https://cg-wire.com/pricing">offers</a>
            </li>
            <li>
              {{ $t('intro.seven') }}
            </li>
          </ul>
          <p>
            {{ $t('intro.eight') }}
          </p>
        </div>
      </div>
    </div>
    <div class="has-text-centered" v-if="isOpenProductionsLoading">
      <spinner />
    </div>
    <div
      class="flexrow open-productions-header"
      v-if="!isOpenProductionsLoading && openProductions.length > 0"
    >
      <img class="flexrow-item" src="../../assets/kitsu.png" width="23" />
      <h1 class="title flexrow-item">
        {{ $t('productions.home.title') }}
      </h1>
      <div class="filler"></div>
      <a
        id="create-production-button"
        class="button flexrow-item"
        @click="newProductionPage"
        v-if="isCurrentUserAdmin"
      >
        {{ $t('productions.home.create_new') }}
      </a>
    </div>
    <div
      class="open-productions-box"
      v-if="!isOpenProductionsLoading && openProductions.length > 0"
    >
      <div class="flexrow search-area" v-if="openProductions.length > 6">
        <search-field
          ref="search-field"
          class="search-field"
          @change="onSearchChange"
        />
      </div>

      <div
        :class="{
          'open-productions-list': true,
          'is-grid': openProductions && openProductions.length > 4
        }"
      >
        <div
          class="open-production has-text-centered"
          v-if="!filteredProductions?.length"
        >
          {{ $t('main.search.no_result') }}
        </div>
        <div
          class="open-production has-text-centered"
          :key="production.id"
          v-for="production in filteredProductions"
        >
          <router-link :to="getPath(production)">
            <div
              class="avatar has-text-centered"
              v-bind:style="{
                background: getAvatarColor(production)
              }"
            >
              <span v-if="!production.has_avatar">
                {{ generateAvatar(production) }}
              </span>
              <img :src="getThumbnailPath(production)" v-else />
            </div>
            <div class="production-name">
              {{ production.name }}
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="has-text-centered welcome" v-else>
      <p class="kitsu-logo info">
        <img src="../../assets/illustrations/empty_production.png" />
      </p>
      <div v-if="isCurrentUserAdmin">
        <p class="has-text-centered info">
          {{ $t('productions.home.empty') }}
        </p>
        <p class="has-text-centered mt1">
          <button class="button big-button" @click="newProductionPage">
            {{ $t('productions.home.create_new') }}
          </button>
        </p>
      </div>
      <div v-else-if="isCurrentUserClient">
        <p class="has-text-centered">
          {{ $t('productions.home.no_prod_for_client') }}
        </p>
      </div>
      <div v-else-if="!isCurrentUserManager">
        <p class="has-text-centered">
          {{ $t('productions.home.no_task') }}
        </p>
      </div>
    </div>
    <edit-production-modal
      :active="modals.isNewDisplayed"
      :is-loading="loading.edit"
      :is-error="errors.edit"
      @confirm="confirmEditProduction"
      @cancel="hideNewModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import { XIcon } from 'vue-feather-icons'
import { buildNameIndex } from '@/lib/indexing'
import preferences from '@/lib/preferences'

import colors from '@/lib/colors'
import EditProductionModal from '@/components/modals/EditProductionModal'
import SearchField from '@/components/widgets/SearchField'
import Spinner from '@/components/widgets/Spinner'

export default {
  name: 'open-productions',

  components: {
    EditProductionModal,
    SearchField,
    Spinner,
    XIcon
  },

  data() {
    return {
      isContributions: true,
      filteredProductions: [],
      search: '',
      errors: {
        edit: false
      },
      loading: {
        edit: false
      },
      modals: {
        isNewDisplayed: false
      }
    }
  },

  mounted() {
    this.$refs['search-field']?.focus()
    this.filteredProductions = this.openProductions
    this.productionIndex = buildNameIndex(this.openProductions)
    this.isContributions =
      this.mainConfig.is_self_hosted &&
      preferences.getPreference('open-productions:contributions') !== 'false'
  },

  computed: {
    ...mapGetters([
      'isCurrentUserAdmin',
      'isCurrentUserManager',
      'isCurrentUserClient',
      'isOpenProductionsLoading',
      'lastProductionScreen',
      'mainConfig',
      'openProductions'
    ])
  },

  methods: {
    ...mapActions(['newProduction']),

    generateAvatar(production) {
      const firstLetter = production.name.length > 0 ? production.name[0] : 'P'
      return firstLetter.toUpperCase()
    },

    getAvatarColor(production) {
      return colors.fromString(production.name)
    },

    getPath(production) {
      return this.sectionPath(production, this.lastProductionScreen)
    },

    sectionPath(production, section) {
      const routeName = production.homepage || section
      const route = {
        name: routeName,
        params: {
          production_id: production.id
        },
        query: {}
      }
      if (production.production_type === 'tvshow') {
        route.name = `episode-${routeName}`
        if (section !== 'edits') {
          route.params.episode_id = production.first_episode_id
        } else {
          route.params.episode_id = 'all'
        }
      }
      const isEntityPage = [
        'assets',
        'shots',
        'edits',
        'sequences',
        'episodes'
      ].includes(routeName)
      if (isEntityPage) {
        route.query.search = ''
      }
      return route
    },

    getThumbnailPath(production) {
      return `/api/pictures/thumbnails/projects/${production.id}.png`
    },

    confirmEditProduction(form) {
      this.errors.edit = false
      this.loading.edit = true
      this.newProduction(form)
        .then(() => {
          this.modals.isNewDisplayed = false
          this.loading.edit = false
        })
        .catch(err => {
          console.error(err)
          this.loading.edit = false
          this.errors.edit = true
        })
    },

    newProductionPage() {
      this.$router.push({
        name: 'new-production'
      })
    },

    hideNewModal() {
      this.modals.isNewDisplayed = false
    },

    onSearchChange(search) {
      if (search === '') {
        this.filteredProductions = this.openProductions
      } else {
        this.filteredProductions = this.productionIndex[search]
      }
    },

    hideContributions() {
      this.isContributions = false
      preferences.setPreference('open-productions:contributions', false)
    }
  },

  watch: {},

  metaInfo() {
    return {
      title: `${this.$t('productions.home.title')} - Kitsu`
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .open-productions {
    background: $dark-grey-light;
  }

  .open-productions-box {
    background: $dark-grey-lighter;
    box-shadow: 0 0 4px 2px #333;
  }

  .open-productions-list {
    .open-production:hover .avatar {
      box-shadow: 0 0 4px 2px #444;
    }
  }

  .big-button {
    background: $dark-grey-2;
    box-shadow: 0 0 4px 0 #393;
  }
}

h1.title {
  margin-bottom: 0;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: $grey;
  font-size: 1.9em;
}

.is-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  .open-production {
    margin: 2em auto 0 auto;
  }
}

.open-productions .open-productions-list {
  max-width: 1000px;
  margin: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  text-align: center;

  .avatar {
    width: 100px;
    height: 100px;
    margin: auto;
    font-size: 64px;
    font-weight: bold;
    border-radius: 25px;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    border-radius: 25px;
  }

  .open-production {
    overflow-wrap: break-word;
    padding: 10px;
    cursor: pointer;
    padding: 1em;
    flex: 1;
  }

  .open-production:hover {
    transition: all 0.4s ease-in-out;
    transform: scale(1.1);
  }

  .open-production:hover .avatar {
    transition: all 0.4s ease-in-out;
    box-shadow: 0 0 4px 2px var(--box-shadow);
  }

  .open-production:hover .production-name {
    transition: all 0.4s ease-in-out;
    transform: scale(1.15);
    text-shadow: 0px 0px 3px var(--box-shadow);
  }
}

.production-name {
  font-size: 1.4em;
  text-transform: uppercase;
  color: $grey;
  margin: 0.5em auto;
  width: 200px;
}

.welcome {
  max-width: 1000px;
  margin: auto;

  h1 {
    margin-top: 1em;
  }
}

.kitsu-logo {
  margin-top: 4em;
}

a.secondary {
  color: #bbb;
}

a.secondary:hover {
  text-decoration: underline;
}

.new-production-link {
  margin-top: 4em;

  a {
    color: #bbb;
  }
}

.open-productions {
  background: #fafafa;
}

.open-productions-box {
  background: white;
  box-shadow: 0 0 3px 3px #eee;
  border-radius: 3em;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 3em 3em 4em 3em;
}

.open-productions-header {
  margin-top: 4em;
  margin-bottom: 1em;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  img {
    margin-left: 3px;
  }
}

.open-productions.page {
  height: auto;
  min-height: 100vh;
  padding-bottom: 3em;
}

.social-contributions {
  background: var(--background);
  border: 3px solid var(--selected);
  box-shadow: 0 0 3px 3px var(--box-shadow-alt);
  color: var(--text);
  border-radius: 1em;
  font-size: 1.1rem;
  max-width: 800px;
  margin-bottom: 0em;
  margin-top: 2em;
  margin-left: auto;
  margin-right: auto;
  padding: 2em;
  position: relative;

  a {
    color: $green;
  }

  ul {
    margin-bottom: 1em;
    margin-top: 1em;
  }

  .close-contributions {
    cursor: pointer;
    position: absolute;
    right: 30px;
    top: 15px;
    width: 2px;
  }

  .kitsu-with-body {
    margin-right: 2em;
    width: 320px;
  }
}

.big-button {
  background: $white;
  border: 1px solid $green;
  box-shadow: 0 0 4px 0 #9c9;
  color: $green;
  margin-top: 1em;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
    width: auto;
  }

  &:active {
    box-shadow: none;
  }
}

.search-area {
  justify-content: center;
}

.info {
  img {
    width: 800px;
  }
}

@media screen and (max-width: 768px) {
  .title {
    margin-top: 1em;
  }

  .production-name {
    font-size: 1.1em;
  }

  .page {
    padding-top: 3em;
  }

  .open-productions-header {
    margin-bottom: 2em;
    h1 {
      font-size: 1.6em;
      font-weight: bold;
      margin-bottom: 1em;
      margin-top: 0;
      padding-top: 0;
    }
  }

  .open-productions-box {
    padding: 0;
  }

  .flexrow {
    flex-direction: column;
  }
}
</style>

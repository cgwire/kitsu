<template>
  <div class="open-productions page">
    <div class="social-contributions" v-if="isContributions">
      <div class="flexrow">
        <div class="flexrow-item left-column">
          <h1 class="subtitle">
            {{ $t('intro.title') }}
          </h1>
          <img
            class="kitsu-with-body"
            src="../../assets/illustrations/kitsu-band.png"
            alt=""
          />
        </div>
        <div class="filler">
          <span
            class="close-contributions"
            role="button"
            tabindex="0"
            @click="hideContributions"
            @keydown.enter.prevent="hideContributions"
            @keydown.space.prevent="hideContributions"
          >
            <x-icon :size="14" />
          </span>
          <p>
            {{ $t('intro.main') }}
          </p>
          <div class="cta-list">
            <a
              class="cta cta-github"
              href="https://github.com/cgwire/kitsu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <star-icon :size="18" />
              {{ $t('intro.star_github') }}
            </a>
            <a
              class="cta cta-discord"
              href="https://discord.gg/kitsu-community"
              target="_blank"
              rel="noopener noreferrer"
            >
              <message-circle-icon :size="18" />
              {{ $t('intro.join_discord') }}
            </a>
            <a
              class="cta cta-partner"
              href="https://cg-wire.com/partners"
              target="_blank"
              rel="noopener noreferrer"
            >
              <handshake-icon :size="18" />
              {{ $t('intro.join_partner') }}
            </a>
          </div>
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
      <img class="logo" src="../../assets/kitsu.png" width="23" alt="" />
      <h1 class="title filler">
        {{ $t('productions.home.title') }}
      </h1>
      <button
        class="button"
        @click="newProductionPage"
        v-if="isCurrentUserAdmin"
      >
        {{ $t('productions.home.create_new') }}
      </button>
    </div>
    <div
      class="open-productions-box"
      v-if="!isOpenProductionsLoading && openProductions.length > 0"
    >
      <div class="flexrow search-area" v-if="openProductions.length > 6">
        <search-field
          ref="search-field"
          class="search-field ml1"
          @change="onSearchChange"
          v-focus
        />
      </div>

      <div
        :class="{
          'open-productions-list': true,
          'is-grid': openProductions?.length > 4
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
              :style="{
                background: getAvatarColor(production)
              }"
            >
              <template v-if="!production.has_avatar">
                {{ generateAvatar(production) }}
              </template>
              <img :src="getThumbnailPath(production)" alt="" v-else />
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
        <img src="../../assets/illustrations/empty_production.png" alt="" />
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
  </div>
</template>

<script>
import {
  HandshakeIcon,
  MessageCircleIcon,
  StarIcon,
  XIcon
} from 'lucide-vue-next'
import { mapGetters } from 'vuex'

import { buildNameIndex } from '@/lib/indexing'
import colors from '@/lib/colors'
import preferences from '@/lib/preferences'

import SearchField from '@/components/widgets/SearchField.vue'
import Spinner from '@/components/widgets/Spinner.vue'

export default {
  name: 'open-productions',

  components: {
    HandshakeIcon,
    MessageCircleIcon,
    SearchField,
    Spinner,
    StarIcon,
    XIcon
  },

  data() {
    return {
      isContributions: false,
      filteredProductions: []
    }
  },

  mounted() {
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
    generateAvatar(production) {
      const firstLetter = production.name?.[0] || 'P'
      return firstLetter.toUpperCase()
    },

    getAvatarColor(production) {
      return colors.fromString(production.name)
    },

    getPath(production) {
      return this.sectionPath(production, this.lastProductionScreen)
    },

    sectionPath(production, section) {
      const routeName = this.isCurrentUserClient
        ? 'playlists'
        : production.homepage || section
      const route = {
        name: routeName,
        params: {
          production_id: production.id
        },
        query: {}
      }
      if (production.production_type === 'tvshow') {
        if (routeName !== 'episodes') {
          route.name = `episode-${routeName}`
        }
        if (
          !['edits', 'episodes'].includes(routeName) &&
          production.first_episode_id
        ) {
          route.params.episode_id = production.first_episode_id
        } else {
          route.params.episode_id = 'all'
        }
      } else if (
        production.production_type === 'shots' &&
        routeName === 'assets'
      ) {
        route.name = 'shots'
      } else if (
        production.production_type === 'assets' &&
        ['shots', 'sequences'].includes(routeName)
      ) {
        route.name = 'assets'
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
      const lastUpdate = production.updated_at || production.created_at
      const timestamp = Date.parse(lastUpdate)
      return `/api/pictures/thumbnails/projects/${production.id}.png?t=${timestamp}`
    },

    newProductionPage() {
      this.$router.push({
        name: 'new-production'
      })
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

  watch: {
    openProductions() {
      if (this.openProductions.length > 6) {
        const searchQuery = this.$refs['search-field']?.getValue() || ''
        this.onSearchChange(searchQuery)
      } else {
        this.filteredProductions = this.openProductions
      }
    }
  },

  head() {
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
    text-shadow: 0 0 3px var(--box-shadow);
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
  gap: 0 1em;
  margin-top: 4em;
  margin-bottom: 1em;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  .logo {
    margin: 0 3px;
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
  margin-bottom: 0;
  margin-top: 2em;
  margin-left: auto;
  margin-right: auto;
  padding: 2em;
  position: relative;

  a {
    color: $green;
  }

  .left-column {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 1em;
    margin-right: 2em;

    .subtitle {
      margin-bottom: 0;
      text-align: center;
    }
  }

  .filler {
    padding: 1em 2em;
  }

  .cta-list {
    display: flex;
    flex-direction: column;
    gap: 0.8em;
    margin-top: 1.5em;
    max-width: 400px;
  }

  .cta {
    align-items: center;
    background: var(--background-alt-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    display: flex;
    font-weight: 500;
    gap: 0.8em;
    padding: 0.8em 1.2em;
    transition: all 0.2s ease-in-out;

    svg {
      color: var(--accent);
    }

    &:hover {
      border-color: var(--accent);
      transform: translateX(4px);
    }
  }

  .cta-github {
    --accent: #{$yellow};
  }

  .cta-discord {
    --accent: #{$blue};
  }

  .cta-partner {
    --accent: #{$green};
  }

  .close-contributions {
    align-items: center;
    border-radius: 50%;
    color: var(--text-alt);
    cursor: pointer;
    display: flex;
    height: 28px;
    justify-content: center;
    position: absolute;
    right: 15px;
    top: 15px;
    transition: all 0.2s ease-in-out;
    width: 28px;

    &:hover {
      background: var(--background-alt);
      color: var(--text);
    }
  }

  .kitsu-with-body {
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
    padding: 1em 0;
  }

  .open-productions-header,
  .social-contributions .flexrow {
    flex-direction: column;
  }
}
</style>

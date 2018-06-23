<template>
  <div class="open-productions page">
    <div class="has-text-centered" v-if="isOpenProductionsLoading">
      <spinner></spinner>
    </div>
    <div v-else-if="openProductions.length > 0">
      <h1 class="title has-text-centered">
        <activity-icon></activity-icon>
        {{ $t('productions.home.title') }}
      </h1>
      <div class="open-productions-list">
        <div
          class="open-production has-text-centered"
          v-for="production in openProductions">

          <router-link
            :to="getPath(production)"
          >
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
          <router-link
            class="secondary"
            :to="{
              name: 'assets',
              params: {production_id: production.id}
            }"
          >
            {{ $t('assets.title') }}
          </router-link>
          -
          <router-link
            class="secondary"
            :to="{
              name: 'shots',
              params: {production_id: production.id}
            }"
          >
            {{ $t('shots.title') }}
          </router-link>
          -
          <router-link
            class="secondary"
            :to="{
              name: 'breakdown',
              params: {production_id: production.id}
            }"
          >
            {{ $t('breakdown.title') }}
          </router-link>
        </div>
      </div>
      <div class="has-text-centered new-production-link">
        <router-link
          :to="{name: 'open-productions-new'}"
        >
          {{ $t('productions.home.create_new') }}
        </router-link>
      </div>
    </div>

    <div class="has-text-centered welcome" v-else>
      <p class="kitsu-logo">
        <img src="../assets/kitsu.png" />
      </p>
      <h1 class="title has-text-centered">
        {{ $t('productions.home.welcome') }}
      </h1>
      <div v-if="isCurrentUserManager">
        <p class="has-text-centered">
          {{ $t('productions.home.empty') }}
        </p>
        <p class="has-text-centered">
          <button-link
            class="level-item big-button"
            :text="$t('productions.home.create_new')"
            :path="{name: 'open-productions-new'}"
            :is-responsive="false"
          >
          </button-link>
        </p>
      </div>
      <div v-else>
        <p class="has-text-centered">
          {{ $t('productions.home.no_task') }}
        </p>
      </div>
    </div>


    <edit-production-modal
      :active="modals.isNewDisplayed"
      :is-loading="editProduction.isLoading"
      :is-error="editProduction.isError"
      :cancel-route="'/open-productions'"
      @confirm="confirmEditProduction"
    >
    </edit-production-modal>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ActivityIcon } from 'vue-feather-icons'

import colors from '../lib/colors.js'
import ButtonLink from './widgets/ButtonLink'
import EditProductionModal from './modals/EditProductionModal'
import Spinner from './widgets/Spinner'

export default {
  name: 'open-productions',

  components: {
    ActivityIcon,
    ButtonLink,
    EditProductionModal,
    Spinner
  },

  data () {
    return {
      modals: {
        isNewDisplayed: false
      }
    }
  },

  computed: {
    ...mapGetters([
      'openProductions',
      'isCurrentUserManager',
      'editProduction',
      'lastProductionScreen',
      'isOpenProductionsLoading'
    ])
  },

  methods: {
    ...mapActions([
      'newProduction'
    ]),

    generateAvatar (production) {
      const firstLetter = production.name.length > 0 ? production.name[0] : 'P'
      return firstLetter.toUpperCase()
    },

    getAvatarColor (production) {
      return colors.fromString(production.name)
    },

    getPath (production) {
      return {
        name: this.lastProductionScreen,
        params: {production_id: production.id}
      }
    },

    getThumbnailPath (production) {
      return `/api/pictures/thumbnails/projects/${production.id}.png`
    },

    confirmEditProduction (form) {
      this.newProduction({
        data: form,
        callback: (err, production) => {
          if (!err) {
            this.modals.isNewDisplayed = false
            this.$router.push({
              name: 'assets',
              params: {
                production_id: production.id
              }
            })
          }
        }
      })
    },

    handleModalsDisplay () {
      const path = this.$store.state.route.path

      if (path.indexOf('new') > 0) {
        this.modals.isNewDisplayed = true
      } else {
        this.modals.isNewDisplayed = false
      }
    }
  },

  watch: {
    $route () { this.handleModalsDisplay() }
  },

  created () {
    this.handleModalsDisplay()
  },

  metaInfo () {
    return {
      title: `${this.$t('productions.home.title')} - Kitsu`
    }
  }
}
</script>

<style scoped>
h1 {
  margin-top: 3em;
  margin-bottom: 3em;
}

.avatar {
  width: 100px;
  height: 100px;
}

.open-productions-list {
  max-width: 1000px;
  margin: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.open-production {
  width: 200px;
  flex: 1;
  padding: 10px;
  cursor: pointer;
}

.avatar {
  margin: auto;
  font-size: 64px;
  font-weight: bold;
  border-radius: 0;
}

.avatar img {
  border-radius: 0;
  width: 100%;
  height: 100%;
}

.open-production:hover .avatar {
  outline: 5px solid #CCC;
  transition: outline .2s ease-in-out;
}

.production-name {
  font-size: 1.4em;
  text-transform: uppercase;
  color: #999;
  margin-top: 0.5em;
}

.welcome {
  max-width: 1000px;
  margin: auto;
}

.kitsu-logo {
  margin-top: 4em;
}

.welcome h1 {
  margin-top: 1em;
}

a.secondary {
  color: #BBB;
}

a.secondary:hover {
  text-decoration: underline
}

.new-production-link {
  margin-top: 4em;
}

.new-production-link a {
  color: #BBB;
}

@media screen and (max-width: 768px) {
  .title {
    margin-top: 1em;
  }

  .production-name {
    font-size: 1.1em;
  }
}
</style>

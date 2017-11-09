<template>
  <div class="open-productions page">

    <div v-if="openProductions.length > 0">
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
               background: getAvatarColor(production),
               width: size + 'px',
               height: size + 'px'
            }">
              {{ generateAvatar(production) }}
            </div>
            <div class="production-name">
              {{ production.name }}
            </div>
          </router-link>
        </div>
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
            path="/productions/new"
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

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ActivityIcon } from 'vue-feather-icons'

import colors from '../lib/colors.js'
import ButtonLink from './widgets/ButtonLink'

export default {
  name: 'menu',

  components: {
    ActivityIcon,
    ButtonLink
  },

  data () {
    return {
      size: 100
    }
  },

  computed: {
    ...mapGetters([
      'openProductions',
      'isCurrentUserManager'
    ])
  },

  methods: {
    ...mapActions([
      'loadProductions'
    ]),

    generateAvatar (production) {
      const firstLetter = production.name.length > 0 ? production.name[0] : 'P'
      return firstLetter.toUpperCase()
    },
    getAvatarColor (production) {
      return colors.fromString(production.name)
    },
    getPath (production) {
      return `/productions/${production.id}/assets`
    }
  }
}
</script>

<style scoped>
h1 {
  margin-top: 3em;
  margin-bottom: 3em;
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

.big-button {
  border-radius: 2px;
  background: #00B242;
  border-color: #00B242;
  color: white;
  font-size: 1.3em;
  max-width: 280px;
  margin: 1em auto;
}
</style>

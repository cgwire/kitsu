<template>
  <div class="production-name">
    <router-link class="flexrow" :to="productionRoute">
      <div
         class="flexrow-item avatar has-text-centered"
         v-if="withAvatar"
         v-bind:style="{
         background: getAvatarColor(project),
         width: size + 'px',
         height: size + 'px',
         'font-size': (size - 15) + 'px',
         'line-height': size + 'px'
      }">
        <span v-if="!project.has_avatar">
          {{ generateAvatar(project) }}
        </span>
        <span v-else>
          <img :src="getThumbnailPath(project)" />
        </span>
      </div>
      <span class="flexrow-item" v-if="!onlyAvatar">
        {{ project.name }}
      </span>
    </router-link>
  </div>
</template>

<script>
import colors from '../../lib/colors.js'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'production-name',

  props: {
    project: {
      default: () => {},
      type: Object
    },
    size: {
      default: 40,
      type: Number
    },
    onlyAvatar: {
      default: false,
      type: Boolean
    },
    withAvatar: {
      default: true,
      type: Boolean
    },
    lastProductionScreen: {
      default: 'assets',
      type: String
    }
  },

  computed: {
    ...mapGetters([
    ]),

    productionRoute () {
      return {
        name: this.lastProductionScreen,
        params: {
          production_id: this.project.id
        }
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    generateAvatar (project) {
      const firstLetter = project.name.length > 0 ? project.name[0] : 'P'
      return firstLetter.toUpperCase()
    },

    getAvatarColor (project) {
      return colors.fromString(project.name)
    },

    getThumbnailPath (production) {
      return `/api/pictures/thumbnails/projects/${production.id}.png`
    }
  }
}
</script>

<style scoped>
.production-name a {
  color: inherit;
}

.avatar {
  margin-right: 0.3em;
}
</style>

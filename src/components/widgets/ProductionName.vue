<template>
  <div class="production-name">
    <router-link
      class="flexrow"
      :title="productionInfo"
      :to="productionRoute"
    >
      <div
         class="flexrow-item avatar has-text-centered"
         v-if="withAvatar"
         :style="{
           background: getAvatarColor(project),
           width: size + 'px',
           height: size + 'px',
           'font-size': (size - 15) + 'px',
           'line-height': size + 'px'
         }"
       >
        <span v-if="!project.has_avatar">
          {{ generateAvatar(project) }}
        </span>
        <img
          :src="getThumbnailPath(project)"
          :style="{
            width: size + 'px',
            height: size + 'px'
          }"
          v-else
        />
      </div>
      <span class="flexrow-item avatar-name" v-if="!onlyAvatar">
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
      let route = {
        name: this.lastProductionScreen,
        params: {
          production_id: this.project.id
        }
      }
      if (this.project.first_episode_id) {
        route.name = `episode-${this.lastProductionScreen}`
        route.params.episode_id = this.project.first_episode_id
      }
      return route
    },

    productionInfo () {
      const fps = this.project.fps
      const ratio = this.project.ratio
      const resolution = this.project.resolution
      if (fps || ratio || resolution) {
        return `fps: ${fps}\nratio: ${ratio}\nresolution: ${resolution}`
      } else {
        return ''
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

<style lang="scss" scoped>
.production-name a {
  color: inherit;
}

.flexrow-item {
  margin: 0;
}

.avatar-name {
  margin-left: 0.8em;
}
</style>

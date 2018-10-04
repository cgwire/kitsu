<template>
<td class="production-name">
  <div
    class="flexrow"
    v-tooltip="tooltipOptions"
  >
    <router-link
      :to="productionRoute"
    >
      <div
         class="flexrow-item avatar has-text-centered"
         v-if="withAvatar"
         v-bind:style="{
         background: getAvatarColor(entry),
         width: size + 'px',
         height: size + 'px',
         'font-size': (size - 15) + 'px',
         'line-height': size + 'px'
      }">
        <span v-if="!entry.has_avatar">
          {{ generateAvatar(entry) }}
        </span>
        <span v-else>
          <img :src="getThumbnailPath(entry)" />
        </span>
      </div>
      <span class="flexrow-item" v-if="!onlyAvatar">
        {{ entry.name }}
      </span>
    </router-link>
  </div>
</td>
</template>

<script>
import colors from '../../lib/colors.js'
import { mapGetters, mapActions } from 'vuex'

export default {uname: 'production-name-cell',

  props: {
    entry: {
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
    },
    isTooltip: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    ...mapGetters([
    ]),

    productionRoute () {
      let route = {
        name: this.lastProductionScreen,
        params: {
          production_id: this.entry.id
        }
      }
      if (this.entry.first_episode_id) {
        route.name = `episode-${this.lastProductionScreen}`
        route.params.episode_id = this.entry.first_episode_id
      }
      return route
    },

    productionInfo () {
      const fps = this.entry.fps
      const ratio = this.entry.ratio
      const resolution = this.entry.resolution
      const infos = []
      if (fps) infos.push(`${this.$t('productions.fields.fps')}: ${fps}`)
      if (ratio) infos.push(`${this.$t('productions.fields.ratio')}: ${ratio}`)
      if (resolution) {
        infos.push(`${this.$t('productions.fields.resolution')}: ${resolution}`)
      }
      if (infos.length > 0 && this.isTooltip) {
        return infos.join('<br>')
      } else {
        return ''
      }
    },

    tooltipOptions () {
      return {
        content: this.productionInfo,
        delay: {
          hide: 5000
        }
      }
    }
  },

  methods: {
    ...mapActions([
    ]),

    generateAvatar (entry) {
      const firstLetter = entry.name.length > 0 ? entry.name[0] : 'P'
      return firstLetter.toUpperCase()
    },

    getAvatarColor (entry) {
      return colors.fromString(entry.name)
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
</style>

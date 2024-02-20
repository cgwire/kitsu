<template>
  <div class="flexrow production-name" :title="productionInfo">
    <router-link
      class="flexrow flexrow-item"
      :to="productionRoute"
      v-if="isLink"
    >
      <div
        class="flexrow-item avatar has-text-centered"
        :style="style"
        v-if="withAvatar"
      >
        <template v-if="!entry.has_avatar">
          {{ generatedAvatar }}
        </template>
        <img :src="thumbnailPath" v-else />
      </div>
      <span class="flexrow-item" v-if="!onlyAvatar">
        {{ entry.name }}
      </span>
    </router-link>
    <div class="flexrow flexrow-item" v-else>
      <div
        class="flexrow-item avatar has-text-centered"
        :style="style"
        v-if="withAvatar"
      >
        <template v-if="!entry.has_avatar">
          {{ generatedAvatar }}
        </template>
        <img :src="thumbnailPath" v-else />
      </div>
      <span class="flexrow-item" v-if="!onlyAvatar">
        {{ entry.name }}
      </span>
    </div>
  </div>
</template>

<script>
import colors from '@/lib/colors.js'

export default {
  name: 'production-name-cell',

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
    },
    isLink: {
      default: true,
      type: Boolean
    }
  },

  computed: {
    generatedAvatar() {
      const firstLetter = this.entry.name?.[0] || 'P'
      return firstLetter.toUpperCase()
    },

    productionRoute() {
      const route = {
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

    productionInfo() {
      if (!this.isTooltip) {
        return ''
      }
      const fps = this.entry?.fps
      const ratio = this.entry?.ratio
      const resolution = this.entry?.resolution
      const infos = []
      if (fps) {
        infos.push(`${this.$t('productions.fields.fps')}: ${fps}`)
      }
      if (ratio) {
        infos.push(`${this.$t('productions.fields.ratio')}: ${ratio}`)
      }
      if (resolution) {
        infos.push(`${this.$t('productions.fields.resolution')}: ${resolution}`)
      }
      return infos.join(' - ')
    },

    style() {
      return {
        background: colors.fromString(this.entry.name),
        width: `${this.size}px`,
        height: `${this.size}px`,
        'font-size': `${this.size - 15}px`,
        'line-height': `${this.size}px`
      }
    },

    thumbnailPath() {
      return `/api/pictures/thumbnails/projects/${this.entry.id}.png`
    }
  }
}
</script>

<style lang="scss" scoped>
.production-name a {
  color: inherit;
}

.avatar {
  border-radius: 12px;
  img {
    border-radius: 12px;
  }
}
</style>

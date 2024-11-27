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
import { mapGetters } from 'vuex'

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
    ...mapGetters(['isCurrentUserClient']),

    generatedAvatar() {
      const firstLetter = this.entry.name?.[0] || 'P'
      return firstLetter.toUpperCase()
    },

    productionRoute() {
      return this.sectionPath(this.entry, this.lastProductionScreen)
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
      const lastUpdate = this.entry.updated_at || this.entry.created_at
      const timestamp = Date.parse(lastUpdate)
      return `/api/pictures/thumbnails/projects/${this.entry.id}.png?t=${timestamp}`
    }
  },

  methods: {
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

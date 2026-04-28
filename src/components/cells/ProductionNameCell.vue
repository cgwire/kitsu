<template>
  <div class="flexrow production-name" :title="productionInfo" v-if="entry">
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

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import colors from '@/lib/colors.js'

const ENTITY_PAGES = ['assets', 'shots', 'edits', 'sequences', 'episodes']

const props = defineProps({
  entry: { type: Object, default: () => ({}) },
  isLink: { type: Boolean, default: true },
  isTooltip: { type: Boolean, default: false },
  lastProductionScreen: { type: String, default: 'assets' },
  onlyAvatar: { type: Boolean, default: false },
  size: { type: Number, default: 40 },
  withAvatar: { type: Boolean, default: true }
})

const { t } = useI18n()
const store = useStore()

const isCurrentUserClient = computed(() => store.getters.isCurrentUserClient)

const sectionPath = (production, section) => {
  const routeName = isCurrentUserClient.value
    ? 'playlists'
    : production.homepage || section
  const route = {
    name: routeName,
    params: { production_id: production.id },
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
  } else if (production.production_type === 'shots' && routeName === 'assets') {
    route.name = 'shots'
  } else if (
    production.production_type === 'assets' &&
    ['shots', 'sequences'].includes(routeName)
  ) {
    route.name = 'assets'
  }
  if (ENTITY_PAGES.includes(routeName)) {
    route.query.search = ''
  }
  return route
}

const generatedAvatar = computed(() => {
  const firstLetter = props.entry.name?.[0] || 'P'
  return firstLetter.toUpperCase()
})

const productionRoute = computed(() =>
  sectionPath(props.entry, props.lastProductionScreen)
)

const productionInfo = computed(() => {
  if (!props.isTooltip) return ''
  const infos = []
  if (props.entry?.fps) {
    infos.push(`${t('productions.fields.fps')}: ${props.entry.fps}`)
  }
  if (props.entry?.ratio) {
    infos.push(`${t('productions.fields.ratio')}: ${props.entry.ratio}`)
  }
  if (props.entry?.resolution) {
    infos.push(
      `${t('productions.fields.resolution')}: ${props.entry.resolution}`
    )
  }
  return infos.join(' - ')
})

const style = computed(() => ({
  background: colors.fromString(props.entry.name),
  width: `${props.size}px`,
  height: `${props.size}px`,
  'font-size': `${props.size - 15}px`,
  'line-height': `${props.size}px`
}))

const thumbnailPath = computed(() => {
  const lastUpdate = props.entry.updated_at || props.entry.created_at
  const timestamp = Date.parse(lastUpdate)
  return `/api/pictures/thumbnails/projects/${props.entry.id}.png?t=${timestamp}`
})
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

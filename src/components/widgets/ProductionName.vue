<template>
  <div class="production-name flexrow" v-if="production">
    <span
      class="flexrow-item avatar has-text-centered"
      :style="{
        background: avatarColor,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size - 15}px`,
        lineHeight: `${size}px`
      }"
      :title="production.name"
      v-if="withAvatar"
    >
      <template v-if="!production.has_avatar">{{ avatar }}</template>
      <img
        :src="thumbnailPath"
        :style="{
          width: `${size}px`,
          height: `${size}px`
        }"
        v-else
      />
    </span>
    <span
      class="flexrow-item avatar-name"
      :style="{
        'margin-left': withAvatar ? '0.8em' : '0'
      }"
      v-if="!onlyAvatar"
    >
      {{ production.name }}
    </span>
  </div>
</template>

<script>
import colors from '@/lib/colors.js'

export default {
  name: 'production-name',

  props: {
    onlyAvatar: {
      default: false,
      type: Boolean
    },
    production: {
      default: () => {},
      type: Object
    },
    size: {
      default: 40,
      type: Number
    },
    withAvatar: {
      default: true,
      type: Boolean
    }
  },

  computed: {
    avatar() {
      const firstLetter = this.production.name[0] || 'P'
      return firstLetter.toUpperCase()
    },

    avatarColor() {
      return colors.fromString(this.production.name)
    },

    thumbnailPath() {
      const lastUpdate =
        this.production.updated_at || this.production.created_at
      const timestamp = Date.parse(lastUpdate)
      return `/api/pictures/thumbnails/projects/${this.production.id}.png?t=${timestamp}`
    }
  }
}
</script>

<style lang="scss" scoped>
.flexrow-item {
  margin: 0;
}

.avatar-name {
  color: $black;

  .dark & {
    color: $white;
  }
}
</style>

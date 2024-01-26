<template>
  <div class="production-name flexrow">
    <span
      class="flexrow-item avatar has-text-centered"
      :style="{
        background: avatarColor,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size - 15}px`,
        lineHeight: `${size}px`
      }"
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
    <span class="flexrow-item avatar-name" v-if="!onlyAvatar">
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
      return `/api/pictures/thumbnails/projects/${this.production.id}.png`
    }
  }
}
</script>

<style lang="scss" scoped>
.flexrow-item {
  margin: 0;
}

.avatar-name {
  margin-left: 0.8em;
}
</style>

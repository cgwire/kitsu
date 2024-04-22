<template>
  <span
    class="avatar has-text-centered"
    :class="{ bot: person.is_bot }"
    :style="style"
    v-if="isLink && person.id"
  >
    <router-link
      :to="{
        name: 'person',
        params: {
          person_id: person.id
        }
      }"
      :title="person.full_name"
    >
      <img
        :loading="this.isLazy ? 'lazy' : undefined"
        alt=""
        :src="person.avatarPath"
        v-if="person.has_avatar"
      />
      <template v-else>{{ person.initials }}</template>
    </router-link>
  </span>

  <span
    class="avatar has-text-centered"
    :class="{ bot: person.is_bot }"
    :title="person.full_name"
    :style="style"
    v-else
  >
    <img
      :loading="this.isLazy ? 'lazy' : undefined"
      alt=""
      :src="person.avatarPath"
      v-if="person.has_avatar"
    />
    <template v-else>{{ person.initials }}</template>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'people-avatar',

  props: {
    person: {
      type: Object,
      required: true
    },
    size: {
      type: Number,
      default: 40
    },
    fontSize: {
      type: Number,
      default: 18
    },
    isLink: {
      type: Boolean,
      default: true
    },
    isLazy: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    ...mapGetters(['isDarkTheme']),

    style() {
      return {
        color: this.isDarkTheme ? '#333' : '#FFF',
        width: `${this.size}px`,
        height: `${this.size}px`,
        fontSize: this.person.has_avatar ? 0 : `${this.fontSize}px`,
        backgroundColor: this.person.color
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  color: #333;
  display: flex;
  align-items: center;
  font-weight: bold;
  justify-content: center;
  position: relative;
  flex-shrink: 0;

  a {
    margin: 0;
  }

  img {
    max-height: 100%;
    height: 100%;
    width: 100%;
  }
}

.flexrow-item {
  margin-right: 10px;
}
</style>

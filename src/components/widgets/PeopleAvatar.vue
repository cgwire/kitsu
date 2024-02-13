<template>
  <span
    class="avatar has-text-centered"
    :class="{ bot: person.is_bot }"
    :style="style"
    v-if="isLink"
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
export default {
  name: 'people-avatar',

  props: {
    person: {
      type: Object,
      default: () => ({
        id: 'empty',
        color: '#FFF'
      })
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
    style() {
      return {
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
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

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

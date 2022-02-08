<template>
<div class="avatar-wrapper">
  <span
    class="avatar has-text-centered"
    :title="person.full_name"
    :style="{
      background: person.color,
      width: size +'px',
      height: size + 'px',
      'font-size': fontSize + 'px'
    }"
  >
    <img
      class="avatar-image"
      :src="avatarPath"
      v-if="person.has_avatar && noCache"
    />
    <img
      class="avatar-image"
      v-lazy="avatarPath"
      :key="avatarKey"
      v-else-if="person.has_avatar"
    />
    <span v-else>
      {{ initials }}
    </span>
  </span>

  <div
    class="avatar-menu"
  >
    <router-link
      :to="{ name: 'person', params: { person_id: person.id } }"
      class="menu-button flexrow"
    >
      <user-icon class="flexrow-item" size="1.2x" />
      <span class="flexrow-item">Open {{ person.name }} page</span>
    </router-link>
    <div
      class="menu-button flexrow"
      @click.stop="$emit('unassign', person)"
    >
      <user-minus-icon class="flexrow-item" size="1.2x" />
      <span class="flexrow-item">Unassign {{ person.name }}</span>
    </div>
  </div>
</div>
</template>

<script>
import { UserIcon, UserMinusIcon } from 'vue-feather-icons'

export default {
  name: 'person-avatar',

  components: {
    UserIcon,
    UserMinusIcon
  },

  data () {
    return {
      avatarPath: '',
      avatarKey: '',
      initials: ''
    }
  },

  props: {
    person: {
      type: Object,
      default: () => ({
        id: 'empty', color: '#FFF'
      })
    },
    size: { type: Number, default: 40 },
    'font-size': { type: Number, default: 18 },
    'is-link': { type: Boolean, default: true },
    'no-cache': { type: Boolean, default: false },
    isMenu: { type: Boolean, default: false }
  },

  created () {
    this.reloadAvatar()
  },

  methods: {
    reloadAvatar () {
      this.avatarPath =
        this.person.avatarPath + '?unique=' + this.person.uniqueHash
      this.avatarKey =
        this.person.id + '-' + this.person.uniqueHash
    }
  },

  mounted () {
    this.initials = this.person.initials
  },

  watch: {
    person () {
      this.reloadAvatar()
    },

    'person.uniqueHash' () {
      this.reloadAvatar()
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar img {
  max-height: 100%;
  height: 100%;
  width: 100%;
}

.avatar {
  position: relative;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar span {
  flex: 1;
}

.avatar a {
  padding: 0;
  margin: 0;
  color: white;
}

.flexrow-item {
  margin-right: 10px;
}

.avatar-wrapper {
  position: relative;

  .avatar-menu {
    background: var(--background-alt);
    border-radius: 5px;
    box-shadow: 0 2px 6px var(--box-shadow);
    display: none;
    left: -3px;
    padding: 0.5em;
    position: absolute;
    visibility: hidden;
    width: 250px;
    z-index: 3;
  }

  .menu-button {
    align-items: center;
    color: var(--text);
    border-radius: 5px;
    padding: 5px;

    &:first-child {
      color: var(--text);
      margin-bottom: 0.5em;
    }

    &:last-child {
      margin-top: 0.5em;
    }

    &:hover {
      background: var(--background-hover);
    }
  }

  &:hover {
    .avatar-menu {
      display: inline-block;
      visibility: visible;
    }
  }
}
</style>

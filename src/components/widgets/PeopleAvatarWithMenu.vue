<template>
  <div class="avatar-wrapper">
    <span
      class="avatar has-text-centered"
      :class="{ bot: person.is_bot }"
      :title="person.full_name"
      :style="style"
    >
      <img
        :loading="this.isLazy ? 'lazy' : undefined"
        alt=""
        :src="person.avatarPath"
        v-if="person.has_avatar"
      />
      <template v-else>{{ person.initials }}</template>
    </span>

    <div class="avatar-menu">
      <router-link
        :to="{ name: 'person', params: { person_id: person.id } }"
        class="menu-button flexrow"
      >
        <user-icon class="flexrow-item" size="1.2x" />
        <span class="flexrow-item">
          {{ $t('main.avatar.open_page', { personName: person.name }) }}
        </span>
      </router-link>
      <div class="menu-button flexrow" @click.stop="$emit('unassign', person)">
        <user-minus-icon class="flexrow-item" size="1.2x" />
        <span class="flexrow-item">
          {{ $t('main.avatar.unassign', { personName: person.name }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { UserIcon, UserMinusIcon } from 'vue-feather-icons'

export default {
  name: 'people-avatar-with-menu',

  components: {
    UserIcon,
    UserMinusIcon
  },

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
    },
    isMenu: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters(['isDarkTheme']),

    style() {
      return {
        color: this.isDarkTheme ? '#333' : '#FFF',
        'font-weight': this.isDarkTheme ? 'bold' : 'normal',
        width: `${this.size}px`,
        height: `${this.size}px`,
        fontSize: `${this.fontSize}px`,
        backgroundColor: this.person.color
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  a {
    padding: 0;
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

<template>
<div
  class="notification-bell nav-item"
>
  <router-link :to="{name: 'notifications'}">
    <bell-icon
      :class="notificationBellClass"
    />
    <span
      class="number"
      :title="notificationCount + ' ' +
              $tc('notifications.unread_notifications',
                   notificationCount)"
      v-if="isNewNotification"
    >
      {{ notificationCount }}
    </span>
  </router-link>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BellIcon } from 'vue-feather-icons'

export default {
  name: 'notification-bell',
  components: {
    BellIcon
  },

  props: {
    isWhite: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
      'isNewNotification',
      'notificationCount'
    ]),

    notificationBellClass () {
      if (this.isNewNotification) {
        return { 'has-notifications': true }
      } else {
        if (this.isWhite) {
          return {
            'has-no-notifications': true,
            white: true
          }
        } else {
          return { 'has-no-notifications': true }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .has-no-notifications {
    color: $grey;

    &.white {
      color: $white-grey;
    }
  }

  .number {
    background: $pink-transparent;
    border: 2px solid $pink;
    color: $pink;
    font-size: 0.9em;
    margin: 0;
  }
}

.has-no-notifications {
  margin-top: 5px;
  color: $light-grey;

  &.white {
    color: $white-grey;
  }
}

.notification-bell {
  position: relative;
}

.has-notifications {
  margin-top: 5px;
  color: $orange;
}

.number {
  position: absolute;
  left: 20px;
  background: $orange-light;
  border: 2px solid $orange;
  color: $orange;
  font-size: 0.8em;
  margin: 0;
  width: auto;
  min-width: 20px;
  height: 20px;
  padding: 2px;
}
</style>

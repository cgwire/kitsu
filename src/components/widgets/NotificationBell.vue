<template>
  <div class="notification-bell" :class="{ active: isNotificationPage }">
    <router-link :to="{ name: 'notifications' }">
      <bell-icon
        class="align-middle"
        :class="
          isNewNotification ? 'has-notifications' : 'has-no-notifications'
        "
      />
      <span
        class="number"
        :title="`${notificationCount} ${$tc('notifications.unread_notifications', notificationCount)}`"
        v-if="isNewNotification"
      >
        {{ notificationCount }}
      </span>
    </router-link>
  </div>
</template>

<script>
/*
 * Widget use to show if there is notification. The count is extracted directly
 * from the Vuex store.
 * If there is no value, it doesn't show a counter. If there are some, it adds
 * a badge giving the number of unread notifications.
 */
import { mapGetters } from 'vuex'
import { BellIcon } from 'lucide-vue-next'

export default {
  name: 'notification-bell',

  components: {
    BellIcon
  },

  computed: {
    ...mapGetters(['isNewNotification', 'notificationCount']),

    isNotificationPage() {
      return this.$route.name === 'notifications'
    }
  }
}
</script>

<style lang="scss" scoped>
.dark {
  .has-no-notifications {
    color: $grey;

    &:hover {
      color: $white;
    }
  }

  .has-notifications {
    color: $pink;
  }

  .number {
    background: $pink-light;
    border: 2px solid $pink-strong;
    color: $pink-strong;
    font-size: 0.9em;
  }
}

.notification-bell {
  position: relative;
  width: 40px;
  height: 40px;

  &.active {
    border-radius: 50%;
    background: var(--background-selectable);

    .dark & {
      background: $dark-grey-light;
    }
  }
}

.has-no-notifications {
  color: $light-grey;

  &:hover {
    color: var(--text);
  }
}

.has-notifications {
  color: $orange;
}

.number {
  position: absolute;
  left: 20px;
  top: 3px;
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

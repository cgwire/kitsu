<template>
<div
  class="nav-item"
>
  <router-link :to="{name: 'notifications'}">
    <bell-icon
      :class="notificationBellClass"
    />
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
      'isNewNotification'
    ]),

    notificationBellClass () {
      if (this.isNewNotification) {
        return { 'has-notifications': true }
      } else {
        if (this.isWhite) {
          return {
            'has-no-notifications': true,
            'white': true
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
.dark .has-no-notifications {
  color: $grey;

  &.white {
    color: $white-grey;
  }
}

.has-no-notifications {
  margin-top: 5px;
  color: $light-grey;

  &.white {
    color: $white-grey;
  }
}

.has-notifications {
  margin-top: 5px;
  color: $orange;
}
</style>

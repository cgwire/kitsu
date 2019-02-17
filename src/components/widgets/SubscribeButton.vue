<template>
<button
  class="button"
  :title="buttonTitle"
  @click="$emit('click')"
>
  <eye-icon
    class="icon is-small only-icon"
    v-if="subscribed"
  />
  <eye-off-icon
    class="icon is-small only-icon"
    v-else
  />
</button>
</template>

<script>
import {
  EyeIcon,
  EyeOffIcon
} from 'vue-feather-icons'

export default {
  name: 'subscribe-button',
  components: {
    EyeIcon,
    EyeOffIcon
  },
  props: {
    subscribed: {
      default: false,
      type: Boolean
    }
  },

  computed: {
    buttonTitle () {
      if (!this.subscribed) {
        return this.$t('tasks.subscribe_notifications')
      } else {
        return this.$t('tasks.unsubscribe_notifications')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.button .icon.is-small.only-icon {
  margin-right: 0;
}
</style>

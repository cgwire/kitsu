<template>
  <button class="button" :title="buttonTitle" @click="$emit('click')">
    <eye-icon class="icon is-small" v-if="subscribed" />
    <eye-off-icon class="icon is-small" v-else />
  </button>
</template>

<script>
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

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

  emits: ['click'],

  computed: {
    buttonTitle() {
      if (!this.subscribed) {
        return this.$t('tasks.subscribe_notifications')
      } else {
        return this.$t('tasks.unsubscribe_notifications')
      }
    }
  }
}
</script>

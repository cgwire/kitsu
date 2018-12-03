<template functional>
<td class="actions has-text-right">
  <router-link
    class="button"
    :to="props.editRoute"
    v-if="!props.hideEdit && !props.entry.canceled"
  >
    <img src="../../assets/icons/edit.svg" class="icon is-small" />
  </router-link>

  <router-link
    class="button"
    :to="props.restoreRoute"
    v-if="props.entry.canceled"
  >
    <img src="../../assets/icons/rotate-ccw.svg" class="icon is-small" />
  </router-link>

  <router-link
    class="button"
    :to="props.deleteRoute"
    v-if="!props.hideDelete && !props.entry.canceled && isCurrentUserAdmin"
  >
    <img src="../../assets/icons/trash.svg" class="icon is-small" />
  </router-link>

  <router-link
    class="button"
    :to="props.deleteRoute"
    v-else-if="!props.hideDelete"
  >
    <img src="../../assets/icons/trash.svg" class="icon is-small" />
  </router-link>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'row-actions',
  props: {
    entry: {
      type: Object,
      default: () => {
        return {}
      }
    },
    editRoute: {
      type: Object,
      default: () => {
        return { name: 'home' }
      }
    },
    deleteRoute: {
      type: Object,
      default: () => {
        return { name: 'home' }
      }
    },
    restoreRoute: {
      type: Object,
      default: null
    },
    hideEdit: {
      type: Boolean,
      default: false
    },
    hideDelete: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters([
      'isCurrentUserAdmin'
    ])
  },
  methods: {
    ...mapActions([
    ])
  }
}
</script>

<style scoped>
</style>

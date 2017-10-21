<template>
<td class="actions has-text-right">
  <button-link
    icon="edit"
    :path="editRoute"
    v-if="!hideEdit && !entry.canceled"
  >
  </button-link>
  <button-link v-if="entry.canceled"
    icon="restore"
    :path="restoreRoute"
  >
  </button-link>
  <button-link v-else
    icon="delete"
    :path="deleteRoute"
  >
  </button-link>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import ButtonLink from './ButtonLink'

export default {
  name: 'row-actions',
  components: {
    ButtonLink
  },
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
    }
  },
  computed: {
    ...mapGetters([
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

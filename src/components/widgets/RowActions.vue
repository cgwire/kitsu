<template>
<td class="actions has-text-right">
  <button
    class="button"
    data-test="button-history"
    @click="$emit('history-clicked')"
    v-if="!hideHistory"
  >
    <clock-icon class="icon is-small only-icon" />
  </button>

  <button
    class="button"
    data-test="button-edit"
    @click="$emit('edit-clicked')"
    v-if="!hideEdit && !entry.canceled"
  >
    <edit-icon class="icon is-small only-icon" />
  </button>

  <button
    class="button"
    data-test="button-restore"
    @click="$emit('restore-clicked')"
    v-if="entry.canceled"
  >
    <rotate-ccw-icon class="icon is-small only-icon" />
  </button>

  <button
    class="button"
    data-test="button-delete-admin"
    @click="$emit('delete-clicked')"
    v-if="!hideDelete && !entry.canceled && isCurrentUserAdmin"
  >
    <trash-icon class="icon is-small only-icon" />
  </button>

  <button
    class="button"
    data-test="button-delete"
    @click="$emit('delete-clicked')"
    v-else-if="!hideDelete"
  >
    <trash-icon class="icon is-small only-icon" />
  </button>
</td>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import {
  ClockIcon,
  EditIcon,
  RotateCcwIcon,
  TrashIcon
} from 'vue-feather-icons'

export default {
  name: 'row-actions',
  components: {
    ClockIcon,
    EditIcon,
    RotateCcwIcon,
    TrashIcon
  },

  props: {
    entry: {
      type: Object,
      default: () => {
        return {}
      }
    },
    hideEdit: {
      type: Boolean,
      default: false
    },
    hideDelete: {
      type: Boolean,
      default: false
    },
    hideHistory: {
      type: Boolean,
      default: true
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

<style lang="scss" scoped>
.button {
  margin-left: 0.2em;
}
</style>

<template>
  <td class="actions has-text-right">
    <button
      class="button"
      :title="$t('row_actions.history')"
      data-test="button-history"
      tabindex="-1"
      @click="$emit('history-clicked')"
      v-if="!hideHistory"
    >
      <clock-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.edit')"
      data-test="button-edit"
      tabindex="-1"
      @click="$emit('edit-clicked')"
      v-if="!hideEdit && !entry.canceled"
    >
      <edit-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.change_avatar')"
      data-test="button-avatar"
      tabindex="-1"
      @click="$emit('avatar-clicked')"
      v-if="!hideAvatar"
    >
      <camera-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.change_password')"
      data-test="button-change-password"
      tabindex="-1"
      @click="$emit('change-password-clicked')"
      v-if="!hideChangePassword && !entry.canceled && isCurrentUserAdmin"
    >
      <key-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.restore')"
      data-test="button-restore"
      tabindex="-1"
      @click="$emit('restore-clicked')"
      v-if="entry.canceled"
    >
      <rotate-ccw-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.delete')"
      data-test="button-delete-admin"
      tabindex="-1"
      @click="$emit('delete-clicked')"
      v-if="!hideDelete && !entry.canceled && isCurrentUserAdmin"
    >
      <trash-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.delete')"
      data-test="button-delete"
      tabindex="-1"
      @click="$emit('delete-clicked')"
      v-else-if="!hideDelete"
    >
      <trash-icon class="icon is-small" />
    </button>

    <button
      class="button"
      :title="$t('row_actions.refresh')"
      data-test="button-refresh"
      tabindex="-1"
      @click="$emit('refresh-clicked')"
      v-else-if="!hideRefresh"
    >
      <refresh-cw-icon class="icon is-small" />
    </button>
  </td>
</template>

<script>
import { mapGetters } from 'vuex'

import {
  CameraIcon,
  ClockIcon,
  EditIcon,
  KeyIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TrashIcon
} from 'lucide-vue-next'

export default {
  name: 'row-actions-cell',

  components: {
    CameraIcon,
    ClockIcon,
    EditIcon,
    KeyIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    TrashIcon
  },

  props: {
    entry: {
      type: Object,
      default: () => ({})
    },
    hideAvatar: {
      type: Boolean,
      default: true
    },
    hideChangePassword: {
      type: Boolean,
      default: true
    },
    hideDelete: {
      type: Boolean,
      default: false
    },
    hideEdit: {
      type: Boolean,
      default: false
    },
    hideHistory: {
      type: Boolean,
      default: true
    },
    hideRefresh: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'avatar-clicked',
    'change-password-clicked',
    'delete-clicked',
    'edit-clicked',
    'history-clicked',
    'refresh-clicked',
    'restore-clicked'
  ],

  computed: {
    ...mapGetters(['isCurrentUserAdmin'])
  }
}
</script>

<style lang="scss" scoped>
.button {
  margin-left: 0.2em;
}
</style>

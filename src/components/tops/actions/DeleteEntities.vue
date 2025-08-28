<template>
  <div class="flexrow">
    <div class="flexrow-item is-wide" v-if="!isLoading">
      <button class="button is-danger is-wide" @click="confirmDeletion">
        {{ text }}
      </button>
    </div>
    <div class="flexrow-item" v-else>
      <spinner :size="20" class="spinner" />
    </div>
    <div class="flexrow-item error" v-if="isError">
      {{ errorText }}
    </div>
  </div>
  <hard-delete-modal
    active
    :error-text="errorText"
    :is-loading="isLoading"
    :is-error="isError"
    :text="hardDeleteTextComputed"
    :lock-text="hardDeleteLockTextComputed"
    @cancel="modals.deleteConfirmation = false"
    @confirm="confirm"
    v-if="modals.deleteConfirmation"
  />
</template>

<script>
import Spinner from '@/components/widgets/Spinner.vue'
import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'

export default {
  name: 'delete-entities',

  components: {
    Spinner,
    HardDeleteModal
  },

  props: {
    isError: {
      default: false,
      type: Boolean
    },
    isLoading: {
      default: false,
      type: Boolean
    },
    errorText: {
      default: '',
      type: String
    },
    text: {
      default: '',
      type: String
    },
    // HARD DELETE MODAL
    requireHardDeleteConfirmation: {
      default: false,
      type: Boolean
    },
    hardDeleteText: {
      default: '',
      type: String
    },
    hardDeleteLockText: {
      default: '',
      type: String
    }
  },

  emits: ['confirm'],

  data() {
    return {
      modals: {
        deleteConfirmation: false
      }
    }
  },

  computed: {
    hardDeleteTextComputed() {
      return (
        this.hardDeleteText ||
        this.$t('hard_delete.delete_for_selection_hard_text')
      )
    },
    hardDeleteLockTextComputed() {
      return (
        this.hardDeleteLockText ||
        this.$t('hard_delete.delete_for_selection_hard_lock_text')
      )
    }
  },

  methods: {
    confirmDeletion() {
      if (this.requireHardDeleteConfirmation) {
        this.modals.deleteConfirmation = true
      } else {
        this.confirm()
      }
    },
    confirm() {
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.is-wide {
  margin: 0;
  border-radius: 10px;
  flex: 1;
  width: 100%;
}
</style>

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
    :text="hardDeleteMessage"
    :lock-text="hardDeleteLockMessage"
    @cancel="modals.deleteConfirmation = false"
    @confirm="confirm"
    v-if="modals.deleteConfirmation"
  />
</template>

<script setup>
// Imports
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import HardDeleteModal from '@/components/modals/HardDeleteModal.vue'
import Spinner from '@/components/widgets/Spinner.vue'

// Composables
const { t } = useI18n()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
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
})

const emit = defineEmits(['confirm'])

// State
// --------------------------------------------------------------------------
const modals = reactive({
  deleteConfirmation: false
})

// Computed
// --------------------------------------------------------------------------
const hardDeleteMessage = computed(
  () => props.hardDeleteText || t('hard_delete.delete_for_selection_hard_text')
)

const hardDeleteLockMessage = computed(
  () =>
    props.hardDeleteLockText ||
    t('hard_delete.delete_for_selection_hard_lock_text')
)

// Functions
// --------------------------------------------------------------------------
const confirm = () => emit('confirm')

const confirmDeletion = () => {
  if (props.requireHardDeleteConfirmation) {
    modals.deleteConfirmation = true
  } else {
    confirm()
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

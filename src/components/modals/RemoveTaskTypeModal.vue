<template>
  <base-modal
    :active="active"
    :title="$t('task_types.remove_title')"
    @cancel="$emit('cancel')"
  >
    <p class="remaining-tasks mb1">
      {{
        $t('task_types.remaining_tasks', {
          count: nbTasks,
          name: taskType?.name
        })
      }}
    </p>
    <checkbox
      :label="$t('task_types.remaining_tasks_delete', { count: nbTasks })"
      v-model="isDeletingTasks"
    />
    <text-field
      ref="lock-field"
      :label="$t('task_types.remaining_tasks_lock', { name: taskType?.name })"
      v-model="lockText"
      @enter="confirm"
      v-if="isDeletingTasks"
    />
    <modal-footer
      :confirm-label="$t('main.remove')"
      :error-text="$t('task_types.remove_error')"
      :is-disabled="isConfirmDisabled"
      :is-error="isError"
      :is-loading="isLoading"
      @cancel="$emit('cancel')"
      @confirm="confirm"
    />
  </base-modal>
</template>

<script setup>
// Imports
// --------------------------------------------------------------------------
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import BaseModal from '@/components/modals/BaseModal.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'
import Checkbox from '@/components/widgets/Checkbox.vue'
import TextField from '@/components/widgets/TextField.vue'

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  active: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  nbTasks: { type: Number, default: 0 },
  taskType: { type: Object, default: null }
})

const emit = defineEmits(['cancel', 'confirm'])

// State
// --------------------------------------------------------------------------
const lockFieldRef = useTemplateRef('lock-field')

const isDeletingTasks = ref(false)
const lockText = ref('')

// Computed
// --------------------------------------------------------------------------

// The tasks go with their comments and previews: the task type name is asked
// first, like for the Delete all of the entity lists.
const isConfirmDisabled = computed(
  () => isDeletingTasks.value && lockText.value !== props.taskType?.name
)

// Functions
// --------------------------------------------------------------------------
const confirm = () => {
  if (!isConfirmDisabled.value) emit('confirm', isDeletingTasks.value)
}

// Watchers
// --------------------------------------------------------------------------
watch(isDeletingTasks, async () => {
  lockText.value = ''
  if (isDeletingTasks.value) {
    await nextTick()
    lockFieldRef.value?.focus()
  }
})
</script>

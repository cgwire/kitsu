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
      :error-text="$t('task_types.remaining_tasks_lock_error')"
      :errored="isLockErrored"
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
const isLockRejected = ref(false)
const lockText = ref('')

// Computed
// --------------------------------------------------------------------------
const expectedName = computed(() => normalizeName(props.taskType?.name))
const typedName = computed(() => normalizeName(lockText.value))

// The tasks go with their comments and previews: the task type name is asked
// first, like for the Delete all of the entity lists.
const isConfirmDisabled = computed(
  () =>
    isDeletingTasks.value &&
    (!expectedName.value || typedName.value !== expectedName.value)
)

// Red once the text can no longer become the name, or once Enter tried an
// unfinished one: a start of the name still being typed is not wrong yet.
const isLockErrored = computed(
  () => isLockRejected.value || !expectedName.value.startsWith(typedName.value)
)

// Functions
// --------------------------------------------------------------------------

// Case and outer spaces do not count: the field label shows the name in
// capitals, and the lock asks for intent, not for an exact copy.
const normalizeName = name => (name ?? '').trim().toLowerCase()

// Enter in the field gets here past the footer, which ignores the clicks
// while the removal runs.
const confirm = () => {
  if (props.isLoading) return
  if (isConfirmDisabled.value) isLockRejected.value = true
  else emit('confirm', isDeletingTasks.value)
}

// Watchers
// --------------------------------------------------------------------------
watch(lockText, () => {
  isLockRejected.value = false
})

watch(isDeletingTasks, async () => {
  lockText.value = ''
  isLockRejected.value = false
  if (isDeletingTasks.value) {
    await nextTick()
    lockFieldRef.value?.focus()
  }
})
</script>

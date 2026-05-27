<template>
  <base-modal
    :active="active"
    :title="$t('comments.move_modal.title')"
    @cancel="$emit('cancel')"
  >
    <p class="explanation">
      {{ $t('comments.move_modal.intro') }}
    </p>

    <p class="no-target" v-if="targetTaskTypes.length === 0">
      <em>{{ $t('comments.move_modal.no_target') }}</em>
    </p>

    <form @submit.prevent v-else>
      <combobox-task-type
        :label="$t('comments.move_modal.target_label')"
        :task-type-list="targetTaskTypes"
        v-model="targetTaskTypeId"
      />
    </form>

    <modal-footer
      :error-text="$t('comments.move_modal.error')"
      :is-disabled="!targetTaskTypeId"
      :is-error="isError"
      :is-loading="isLoading"
      @cancel="$emit('cancel')"
      @confirm="onConfirm"
    />
  </base-modal>
</template>

<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { useStore } from 'vuex'

import { useModal } from '@/composables/modal'

import BaseModal from '@/components/modals/BaseModal.vue'
import ComboboxTaskType from '@/components/widgets/ComboboxTaskType.vue'
import ModalFooter from '@/components/modals/ModalFooter.vue'

const store = useStore()

const props = defineProps({
  active: { type: Boolean, default: false },
  comment: { type: Object, default: null },
  sourceTask: { type: Object, default: null },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['cancel', 'confirm'])

useModal(toRef(props, 'active'), emit)

const targetTaskTypeId = ref('')

const taskMap = computed(() => store.getters.taskMap)
const taskTypeMap = computed(() => store.getters.taskTypeMap)

const targetTasksByTypeId = computed(() => {
  const byType = new Map()
  if (!props.sourceTask) return byType
  for (const task of taskMap.value.values()) {
    if (
      task.entity_id === props.sourceTask.entity_id &&
      task.id !== props.sourceTask.id &&
      !byType.has(task.task_type_id)
    ) {
      byType.set(task.task_type_id, task)
    }
  }
  return byType
})

const targetTaskTypes = computed(() => {
  return [...targetTasksByTypeId.value.keys()]
    .map(id => taskTypeMap.value.get(id))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
})

const onConfirm = () => {
  const task = targetTasksByTypeId.value.get(targetTaskTypeId.value)
  if (!task) return
  emit('confirm', task.id)
}

watch(
  () => props.active,
  () => {
    targetTaskTypeId.value = targetTaskTypes.value[0]?.id || ''
  }
)
</script>

<style lang="scss" scoped>
.explanation {
  color: var(--text-alt);
  margin-bottom: 1.25rem;
}

.no-target {
  color: var(--text-alt);
  margin-bottom: 1.25rem;
  text-align: center;
}
</style>

<template>
  <div class="field task-status-set-field">
    <label class="label" :id="labelId" v-if="label">{{ label }}</label>
    <div class="statuses" ref="statusesRef">
      <template
        :key="taskStatus.id"
        v-for="(taskStatus, index) in selectedTaskStatuses"
      >
        <span class="connector" v-if="index > 0">
          {{ $t('status_automations.connectors.or') }}
        </span>
        <span
          class="tag task-status"
          :style="{
            background: backgroundColor(taskStatus),
            color: color(taskStatus)
          }"
        >
          {{ taskStatus.short_name }}
          <button
            type="button"
            class="delete is-small remove-status"
            :aria-label="
              $t('task_status.remove_status', { name: taskStatus.name })
            "
            @click="removeTaskStatus(taskStatus.id, index)"
          ></button>
        </span>
      </template>
      <combobox-status
        class="add-status"
        add-placeholder
        :aria-labelledby="label ? labelId : ''"
        :open-top="openTop"
        :task-status-list="remainingTaskStatuses"
        :with-margin="false"
        @update:model-value="addTaskStatus"
        v-if="remainingTaskStatuses.length > 0"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, useId } from 'vue'
import { useStore } from 'vuex'

import { useTaskStatusStyle } from '@/composables/taskStatus'

import ComboboxStatus from '@/components/widgets/ComboboxStatus.vue'

const store = useStore()
const { backgroundColor, color } = useTaskStatusStyle()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: Array, default: () => [] },
  openTop: { type: Boolean, default: false },
  // The statuses offered: a chosen status missing from it, an archived one
  // for instance, is still shown.
  taskStatusList: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:model-value'])

// State
// --------------------------------------------------------------------------
// The field label names its picker.
const labelId = useId()
const statusesRef = ref(null)

// Computed
// --------------------------------------------------------------------------
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const selectedTaskStatuses = computed(() =>
  props.modelValue
    .map(taskStatusId => taskStatusMap.value.get(taskStatusId))
    .filter(Boolean)
)

const remainingTaskStatuses = computed(() =>
  props.taskStatusList.filter(
    taskStatus => !props.modelValue.includes(taskStatus.id)
  )
)

// Functions
// --------------------------------------------------------------------------
// A removed tag takes its focused button along, and the picker goes once
// every status is chosen: the focus moves to the nearest tag, else to the
// picker, so that the keyboard keeps its place.
const focusTag = async index => {
  await nextTick()
  const removeButtons = statusesRef.value?.querySelectorAll('.remove-status')
  const target =
    removeButtons?.[Math.min(index, removeButtons.length - 1)] ??
    statusesRef.value?.querySelector('[role="combobox"]')
  target?.focus()
}

const addTaskStatus = taskStatusId => {
  const isLastStatus = remainingTaskStatuses.value.length === 1
  emit('update:model-value', [...props.modelValue, taskStatusId])
  if (isLastStatus) focusTag(props.modelValue.length)
}

const removeTaskStatus = (taskStatusId, index) => {
  emit(
    'update:model-value',
    props.modelValue.filter(id => id !== taskStatusId)
  )
  focusTag(index)
}
</script>

<style lang="scss" scoped>
// As the comboboxes next to it, so that the labels of a row line up.
.field .label {
  padding-top: 5px;
}

.statuses {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4em;
}

.connector {
  font-size: 0.85em;
}

.task-status {
  margin: 0;
  font-size: 0.8em;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.add-status {
  margin-bottom: 0;
}
</style>

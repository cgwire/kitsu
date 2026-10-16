<template>
  <div class="status-automation flexrow">
    <span class="flexrow-item entity-type">
      {{ entityType }}
    </span>
    <status-automation-conditions
      class="flexrow-item conditions"
      inline
      :status-automation="statusAutomation"
    />
    <span class="flexrow-item trigger-type">
      {{
        statusAutomation.out_field_type === 'ready_for'
          ? $t('status_automations.change_ready_for')
          : $t('status_automations.change_status')
      }}
    </span>
    <span class="out-task-type flexrow-item">
      <task-type-name
        :task-type="getTaskType(statusAutomation.out_task_type_id)"
      />
    </span>
    <span
      class="flexrow-item"
      v-if="statusAutomation.out_field_type === 'status'"
    >
      {{ $t('main.to') }}
    </span>
    <span class="out-task-status flexrow-item">
      <task-status-cell
        :entry="getTaskStatus(statusAutomation.out_task_status_id)"
        v-if="statusAutomation.out_field_type === 'status'"
      />
    </span>
    <span class="flexrow-item guard" v-if="guardStatuses.length > 0">
      {{ $t('status_automations.only_from') }}
      <span
        class="tag"
        :key="taskStatus.id"
        :style="{
          background: backgroundColor(taskStatus),
          color: color(taskStatus)
        }"
        v-for="taskStatus in guardStatuses"
      >
        {{ taskStatus.short_name }}
      </span>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useTaskStatusStyle } from '@/composables/taskStatus'
import { getGuardStatusIds } from '@/lib/statusautomations'

import TaskStatusCell from '@/components/cells/TaskStatusCell.vue'
import StatusAutomationConditions from '@/components/widgets/StatusAutomationConditions.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const { t } = useI18n()
const store = useStore()
const { backgroundColor, color } = useTaskStatusStyle()

const props = defineProps({
  statusAutomation: {
    type: Object,
    default: null
  }
})

const getTaskStatus = computed(() => store.getters.getTaskStatus)
const getTaskType = computed(() => store.getters.getTaskType)

const guardStatuses = computed(() =>
  props.statusAutomation.out_field_type === 'status'
    ? getGuardStatusIds(props.statusAutomation)
        .map(taskStatusId => getTaskStatus.value(taskStatusId))
        .filter(Boolean)
    : []
)

const entityType = computed(() => {
  const et = props.statusAutomation.entity_type
  return t(`status_automations.entity_types.${et.toLowerCase()}`)
})
</script>

<style lang="scss" scoped>
.status-automation {
  text-transform: none;
  color: var(--text);
  padding: 1em;
}

.flexrow-item {
  text-align: left;
}

.entity-type {
  text-transform: capitalize;
  min-width: 40px;
}

.conditions {
  text-align: left;
}

.out-task-status {
  min-width: 100px;
}

.trigger-type {
  min-width: 160px;
}

.guard {
  white-space: nowrap;
}

.guard .tag {
  margin-left: 0.3em;
  font-size: 0.8em;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>

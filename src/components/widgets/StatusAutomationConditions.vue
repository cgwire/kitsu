<template>
  <div class="status-automation-conditions" :class="{ inline }">
    <template
      :key="`${index}-${condition.task_type_id}`"
      v-for="(condition, index) in conditions"
    >
      <span class="connector" v-if="index > 0">
        {{ $t(`status_automations.connectors.${operator}`) }}
      </span>
      <span
        class="condition"
        :class="{ 'guard-only': isGuardOnly(condition) }"
        :title="getGuardOnlyTitle(condition)"
      >
        <alert-triangle-icon
          class="guard-only-icon"
          :size="14"
          v-if="isGuardOnly(condition)"
        />
        <task-type-name
          :task-type="getTaskType(condition.task_type_id)"
          v-if="getTaskType(condition.task_type_id)"
        />
        <span
          class="tag task-status"
          :key="taskStatus.id"
          :style="{
            background: backgroundColor(taskStatus),
            color: color(taskStatus)
          }"
          v-for="taskStatus in getTaskStatuses(condition)"
        >
          {{ taskStatus.short_name }}
        </span>
      </span>
    </template>
  </div>
</template>

<script setup>
import { AlertTriangleIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useTaskStatusStyle } from '@/composables/taskStatus'
import { getTrigger } from '@/lib/statusautomations'

import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const { t } = useI18n()
const store = useStore()
const { backgroundColor, color } = useTaskStatusStyle()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  inline: { type: Boolean, default: false },
  statusAutomation: { type: Object, default: () => ({}) },
  withPriorityWarnings: { type: Boolean, default: false }
})

// Computed
// --------------------------------------------------------------------------
const getTaskType = computed(() => store.getters.getTaskType)
const taskStatusMap = computed(() => store.getters.taskStatusMap)

const trigger = computed(() => getTrigger(props.statusAutomation))
const conditions = computed(() => trigger.value.conditions)
const operator = computed(() => trigger.value.operator)

const guardOnlyTaskTypeIds = computed(() =>
  props.withPriorityWarnings
    ? new Set(
        store.getters
          .getGuardOnlyConditions(props.statusAutomation)
          .map(condition => condition.task_type_id)
      )
    : new Set()
)

// Functions
// --------------------------------------------------------------------------
const isGuardOnly = condition =>
  guardOnlyTaskTypeIds.value.has(condition.task_type_id)

const getTaskStatuses = condition =>
  condition.task_status_ids
    .map(taskStatusId => taskStatusMap.value.get(taskStatusId))
    .filter(Boolean)

const getGuardOnlyTitle = condition => {
  if (!isGuardOnly(condition)) return undefined
  return t(`status_automations.guard_only_condition_${operator.value}`, {
    taskType: getTaskType.value(condition.task_type_id)?.name ?? ''
  })
}
</script>

<style lang="scss" scoped>
.status-automation-conditions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2em;

  &.inline {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4em;
  }
}

.condition {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3em;
}

.inline .condition {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.condition.guard-only {
  opacity: 0.6;
}

.guard-only-icon {
  color: $orange-carrot;
}

.connector {
  color: var(--text-alt);
  font-size: 0.85em;
}

// The look of the applied status next to it (TaskStatusCell).
.task-status {
  margin: 0;
  font-size: 0.8em;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}
</style>

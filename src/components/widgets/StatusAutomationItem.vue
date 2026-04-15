<template>
  <div class="status-automation flexrow">
    <span class="flexrow-item entity-type">
      {{ entityType }}
    </span>
    <span class="in-task-type flexrow-item">
      <task-type-name
        class="in-task-type flexrow-item"
        :task-type="getTaskType(statusAutomation.in_task_type_id)"
      />
    </span>
    <span class="in-task-status flexrow-item">
      <task-status-cell
        :entry="getTaskStatus(statusAutomation.in_task_status_id)"
        v-if="statusAutomation.in_field_type !== 'ready_for'"
      />
    </span>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import TaskStatusCell from '@/components/cells/TaskStatusCell.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const { t } = useI18n()
const store = useStore()

const props = defineProps({
  statusAutomation: {
    type: Object,
    default: null
  },
  productionId: {
    type: String,
    default: null
  },
  deletable: {
    type: Boolean,
    default: false
  }
})

const getTaskStatus = computed(() => store.getters.getTaskStatus)
const getTaskType = computed(() => store.getters.getTaskType)

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

.in-task-type {
  text-align: left;
}

.out-task-status {
  min-width: 100px;
}

.trigger-type {
  min-width: 160px;
}
</style>

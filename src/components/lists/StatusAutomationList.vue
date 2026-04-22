<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('status_automations.fields.entity_type') }}
            </th>
            <th scope="col" class="in-task-type">
              {{ $t('status_automations.fields.in_task_type') }}
            </th>
            <th scope="col" class="in-task-status">
              {{ $t('status_automations.fields.in_task_status') }}
            </th>
            <th scope="col" class="automation-type">
              {{ $t('status_automations.fields.out_field_type') }}
            </th>
            <th scope="col" class="out-task-type">
              {{ $t('status_automations.fields.out_task_type') }}
            </th>
            <th scope="col" class="out-task-status">
              {{ $t('status_automations.fields.out_task_status') }}
            </th>
            <th scope="col" class="import-last-revision">
              {{ $t('status_automations.fields.import_last_revision') }}
            </th>
            <th scope="col" class="actions">&nbsp;</th>
          </tr>
        </thead>
        <tbody class="datatable-body">
          <tr
            class="datatable-row"
            :key="statusAutomation.id"
            v-for="statusAutomation in statusAutomations"
          >
            <td scope="row" class="name entity-type">
              <div class="flexrow">
                <span
                  class="flexrow-item"
                  :title="$t('status_automations.wrong_automation')"
                  v-if="isStatusAutomationDisabled(statusAutomation)"
                >
                  <alert-triangle-icon />
                </span>
                <span class="flexrow-item">
                  {{ statusAutomation.entityType }}
                </span>
              </div>
            </td>
            <task-type-cell
              class="in-task-type"
              :task-type="getTaskType(statusAutomation.in_task_type_id)"
            />
            <task-status-cell
              class="in-task-status"
              :entry="taskStatusMap.get(statusAutomation.in_task_status_id)"
            />
            <td class="input-separator">
              {{
                statusAutomation.out_field_type === 'ready_for'
                  ? $t('status_automations.change_ready_for')
                  : $t('status_automations.change_status')
              }}
            </td>
            <task-type-cell
              class="out-task-type"
              :task-type="getTaskType(statusAutomation.out_task_type_id)"
            />
            <task-status-cell
              class="out-task-status"
              v-if="statusAutomation.out_field_type === 'status'"
              :entry="taskStatusMap.get(statusAutomation.out_task_status_id)"
            />
            <td class="name out-task-status" v-else></td>
            <td class="import-last-revision">
              <span class="mobile-label">
                {{ $t('status_automations.fields.import_last_revision') }}:
              </span>
              {{ formatBoolean(statusAutomation.import_last_revision) }}
            </td>
            <row-actions-cell
              @edit-clicked="$emit('edit-clicked', statusAutomation)"
              @delete-clicked="$emit('delete-clicked', statusAutomation)"
              v-if="isEditable"
            />
            <td class="actions has-text-right" v-else>
              <button
                class="button"
                @click="$emit('remove-clicked', statusAutomation.id)"
              >
                {{ $t('main.remove') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered nb-status-automations">
      {{ entries.length }}
      {{ $t('status_automations.number', entries.length) }}
    </p>
  </div>
</template>

<script setup>
import { AlertTriangleIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskStatusCell from '@/components/cells/TaskStatusCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

const { t } = useI18n()
const store = useStore()

// Props / Emits

const props = defineProps({
  entries: { type: Array, default: () => [] },
  isEditable: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

defineEmits(['delete-clicked', 'edit-clicked', 'remove-clicked'])

// Computed

const taskStatusMap = computed(() => store.getters.taskStatusMap)
const getTaskType = computed(() => store.getters.getTaskType)
const isStatusAutomationDisabled = computed(
  () => store.getters.isStatusAutomationDisabled
)

const statusAutomations = computed(() =>
  props.entries.map(statusAutomation => ({
    ...statusAutomation,
    entityType: t(
      `status_automations.entity_types.${statusAutomation.entity_type.toLowerCase()}`
    )
  }))
)

// Functions

const formatBoolean = value => (value ? t('main.yes') : t('main.no'))
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 120px;
  min-width: 120px;
}

td.name {
  text-transform: capitalize;
}

.in-task-type {
  width: 150px;
  min-width: 150px;
}

.in-task-status {
  width: 150px;
  min-width: 150px;
}

.separator {
  width: 150px;
  min-width: 150px;
}

.out-task-type {
  width: 150px;
  min-width: 150px;
}

.out-task-status {
  width: 150px;
  min-width: 150px;
}

.thead {
  width: 100%;
}

.nb-status-automations {
  color: var(--text);
}

.mobile-label {
  display: none;
}

@media screen and (max-width: 768px) {
  .datatable-wrapper {
    overflow-x: visible;
    border: 0;
    background: transparent;
  }

  table.datatable {
    display: block;
    background: transparent;
  }

  .datatable-head {
    display: none;
  }

  .datatable-body {
    display: block;
  }

  .data-list .datatable .datatable-row,
  .data-list .datatable .datatable-row:nth-child(even),
  .data-list .datatable .datatable-row:hover,
  .data-list .datatable .datatable-row:last-child {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'entity entity'
      'in-type in-status'
      'separator separator'
      'out-type out-status'
      'revision revision';
    align-items: center;
    gap: 0.5em;
    padding: 0.75em;
    margin-bottom: 0.5em;
    background-color: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .data-list .datatable .datatable-row td,
  .data-list .datatable .datatable-row :deep(td),
  .data-list .datatable .datatable-row:last-child td,
  .data-list .datatable .datatable-row:last-child:nth-child(even) td,
  .data-list .datatable .datatable-row:last-child:hover td {
    display: block;
    width: auto;
    min-width: 0;
    padding: 0;
    border: 0;
    background-color: transparent !important;
  }

  td.entity-type {
    grid-area: entity;
    font-weight: 600;
    font-size: 1.1em;
  }

  .in-task-type {
    grid-area: in-type;
  }

  .in-task-status {
    grid-area: in-status;
    justify-self: end;
  }

  .input-separator {
    grid-area: separator;
    color: var(--text-alt);
    font-style: italic;
    font-size: 0.9em;
  }

  .out-task-type {
    grid-area: out-type;
  }

  .out-task-status {
    grid-area: out-status;
    justify-self: end;
  }

  .import-last-revision {
    grid-area: revision;
    padding-top: 0.25em !important;
    color: var(--text-alt);
    font-size: 0.9em;
  }

  .mobile-label {
    display: inline;
    font-weight: 500;
  }

  .actions,
  :deep(.actions) {
    display: none !important;
  }

  :deep(.tag) {
    margin: 0;
  }
}
</style>

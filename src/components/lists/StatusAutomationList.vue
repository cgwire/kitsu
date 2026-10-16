<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('status_automations.fields.entity_type') }}
            </th>
            <th scope="col" class="conditions">
              {{ $t('status_automations.fields.conditions') }}
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
            <th scope="col" class="guard">
              {{ $t('status_automations.fields.out_only_if_task_status_ids') }}
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
                  v-if="
                    withPriorityWarnings &&
                    isStatusAutomationDisabled(statusAutomation)
                  "
                >
                  <alert-triangle-icon />
                </span>
                <span class="flexrow-item">
                  {{ statusAutomation.entityType }}
                </span>
              </div>
            </td>
            <td class="conditions">
              <status-automation-conditions
                :status-automation="statusAutomation"
                :with-priority-warnings="withPriorityWarnings"
              />
            </td>
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
            <td
              class="guard"
              :class="{
                'is-empty': getGuardStatuses(statusAutomation).length === 0
              }"
            >
              <template v-if="getGuardStatuses(statusAutomation).length > 0">
                <span class="mobile-label">
                  {{
                    $t('status_automations.fields.out_only_if_task_status_ids')
                  }}:
                </span>
                <span
                  class="tag"
                  :key="taskStatus.id"
                  :style="{
                    background: backgroundColor(taskStatus),
                    color: color(taskStatus)
                  }"
                  v-for="taskStatus in getGuardStatuses(statusAutomation)"
                >
                  {{ taskStatus.short_name }}
                </span>
              </template>
            </td>
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

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :with-thumbnail="false"
    />

    <p class="has-text-centered nb-status-automations">
      {{ entries.length }}
      {{ $t('status_automations.number', { count: entries.length }) }}
    </p>
  </div>
</template>

<script setup>
import { AlertTriangleIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { useTaskStatusStyle } from '@/composables/taskStatus'
import { getGuardStatusIds } from '@/lib/statusautomations'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TaskStatusCell from '@/components/cells/TaskStatusCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import StatusAutomationConditions from '@/components/widgets/StatusAutomationConditions.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const { t } = useI18n()
const store = useStore()
const { backgroundColor, color } = useTaskStatusStyle()

// Props / Emits
// --------------------------------------------------------------------------
const props = defineProps({
  entries: { type: Array, default: () => [] },
  isEditable: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  // The priorities of the current production: the production settings set
  // it, the admin page and the templates have no current production.
  withPriorityWarnings: { type: Boolean, default: false }
})

defineEmits(['delete-clicked', 'edit-clicked', 'remove-clicked'])

// Computed
// --------------------------------------------------------------------------
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
// --------------------------------------------------------------------------
const formatBoolean = value => (value ? t('main.yes') : t('main.no'))

// Called from the template: the task status map is filled in place, so a
// computed over it would keep its first read.
const getGuardStatuses = statusAutomation =>
  statusAutomation.out_field_type === 'status'
    ? getGuardStatusIds(statusAutomation)
        .map(taskStatusId => taskStatusMap.value.get(taskStatusId))
        .filter(Boolean)
    : []
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

.conditions {
  min-width: 260px;
}

.guard {
  min-width: 150px;
}

.guard .tag {
  margin: 0.2em;
  font-size: 0.8em;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
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
      'conditions conditions'
      'separator separator'
      'out-type out-status';
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

  .conditions {
    grid-area: conditions;
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

  // A full row each after the output, so that a card without a guard gets
  // no empty row, and no extra gap, for it.
  .guard,
  .import-last-revision {
    grid-column: 1 / -1;
  }

  td.guard.is-empty {
    display: none !important;
  }

  .import-last-revision {
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

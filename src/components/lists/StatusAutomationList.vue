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
          <th scope="col" class="separator">====></th>
          <th scope="col" class="out-task-type">
            {{ $t('status_automations.fields.out_task_type') }}
          </th>
          <th scope="col" class="in-task-status">
            {{ $t('status_automations.fields.out_task_status') }}
          </th>
          <th scope="col" class="actions">&nbsp;</th>
        </tr>
      </thead>
      <tbody class="datatable-body">
        <tr class="datatable-row"
          v-for="statusAutomation in entries"
          v-bind:class="[isStatusAutomationDisabled(statusAutomation) ? 'canceled' : '']"
          :key="statusAutomation.id"
        >
          <th scope="row" class="name">
            {{ statusAutomation.entity_type }}
          </th>
          <task-type-name
            class="in-task-type"
            :task-type="getTaskType(statusAutomation.in_task_type_id)"
            :disable="isStatusAutomationDisabled(statusAutomation)"
          />
          <task-status-name class="in-task-status"
            v-if="statusAutomation.in_field_type === 'status'"
            :entry="getTaskStatus(statusAutomation.in_task_status_id)"
            :disable="isStatusAutomationDisabled(statusAutomation)"
          />
          <td class="input-separator">
            =={{ statusAutomation.out_field_type === 'ready_for' ? 'Ready For' : '' }}==>
          </td>
          <task-type-name
            class="out-task-type"
            :task-type="getTaskType(statusAutomation.out_task_type_id)"
            :disable="isStatusAutomationDisabled(statusAutomation)"
          />
          <task-status-name class="out-task-status"
            v-if="statusAutomation.out_field_type === 'status'"
            :entry="getTaskStatus(statusAutomation.out_task_status_id)"
            :disable="isStatusAutomationDisabled(statusAutomation)"
          />
          <td class="name out-task-status"
          v-else
          >
            ---------------
          </td>
          <row-actions-cell
            v-if="isEditable"
            :entry-id="statusAutomation.id"
            @edit-clicked="$emit('edit-clicked', statusAutomation)"
            @delete-clicked="$emit('delete-clicked', statusAutomation)"
          />
          <td
          v-else
          >
            <button
              class="button"
              @click="removeStatusAutomation(statusAutomation.id)"
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
  />

  <p class="has-text-centered nb-status-automations">
    {{ entries.length }} {{ $tc('status_automations.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { formatListMixin } from '@/components/mixins/format'

import RowActionsCell from '@/components/cells/RowActionsCell'
import TableInfo from '@/components/widgets/TableInfo'
import TaskTypeName from '../cells/TaskTypeName'
import TaskStatusName from '../cells/TaskStatusName'

export default {
  name: 'status-automation-list',
  mixins: [formatListMixin],

  props: [
    'entries',
    'isLoading',
    'isError',
    'isEditable'
  ],
  data () {
    return {}
  },
  components: {
    RowActionsCell,
    TableInfo,
    TaskTypeName,
    TaskStatusName
  },
  computed: {
    ...mapGetters([
      'getTaskStatus',
      'getTaskType',
      'isTaskTypePriorityHigherById',
      'isStatusAutomationDisabled',
      'remainingStatusAutomations'
    ])
  },
  methods: {
    ...mapActions([
      'removeStatusAutomationFromProduction'
    ]),

    async removeStatusAutomation (statusAutomationId) {
      await this.removeStatusAutomationFromProduction(statusAutomationId)
      await this.$nextTick()
      // Reselect the remainingStatusAutomations to avoid empty statusAutomationId
      if (this.remainingStatusAutomations.length > 0) {
        this.statusAutomationId = this.remainingStatusAutomations[0].id
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
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
  width: 100%
}
</style>

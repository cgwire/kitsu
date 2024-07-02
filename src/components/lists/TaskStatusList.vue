<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('task_status.fields.name') }}
            </th>
            <th scope="col" class="short-name">
              {{ $t('task_status.fields.short_name') }}
            </th>
            <th scope="col" class="is-default">
              {{ $t('task_status.fields.is_default') }}
            </th>
            <th scope="col" class="is-done">
              {{ $t('task_status.fields.is_done') }}
            </th>
            <th scope="col" class="is-retake">
              {{ $t('task_status.fields.is_retake') }}
            </th>
            <th scope="col" class="is-artist-allowed">
              {{ $t('task_status.fields.is_artist_allowed') }}
            </th>
            <th scope="col" class="is-client-allowed">
              {{ $t('task_status.fields.is_client_allowed') }}
            </th>
            <th scope="col" class="is-feedback-request">
              {{ $t('task_status.fields.is_feedback_request') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <draggable
          class="datatable-body"
          draggable=".task-status"
          tag="tbody"
          :value="entries"
          @end="updateTaskStatusPriority($event.oldIndex, $event.newIndex)"
        >
          <tr
            class="datatable-row task-status"
            v-for="entry in entries"
            :key="entry.id"
          >
            <td class="name">
              {{ entry.name }}
              <span
                class="help-tooltip"
                :title="entry.description"
                v-if="entry.description"
              >
                <help-circle-icon class="icon is-small" />
              </span>
            </td>
            <task-status-cell class="short-name" :entry="entry" />
            <boolean-cell class="is-default" :value="entry.is_default" />
            <boolean-cell class="is-done" :value="entry.is_done" />
            <boolean-cell class="is-retake" :value="entry.is_retake" />
            <boolean-cell
              class="is-artist-allowed"
              :value="entry.is_artist_allowed"
            />
            <boolean-cell
              class="is-client-allowed"
              :value="entry.is_client_allowed"
            />
            <boolean-cell
              class="is-feedback-request"
              :value="entry.is_feedback_request"
            />
            <row-actions-cell
              :entry-id="entry.id"
              :hide-delete="entry.is_default === true || entry.for_concept"
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </draggable>
      </table>
    </div>

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered nb-task-status">
      {{ entries.length }} {{ $tc('task_status.number', entries.length) }}
    </p>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { HelpCircleIcon } from 'vue-feather-icons'

import { formatListMixin } from '@/components/mixins/format'

import BooleanCell from '@/components/cells/BooleanCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskStatusCell from '@/components/cells/TaskStatusCell.vue'

export default {
  name: 'task-status-list',

  mixins: [formatListMixin],

  props: {
    entries: {
      type: Array,
      default: () => []
    },
    isError: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },

  components: {
    BooleanCell,
    draggable,
    HelpCircleIcon,
    RowActionsCell,
    TableInfo,
    TaskStatusCell
  },

  methods: {
    async updateTaskStatusPriority(oldIndex, newIndex) {
      const taskStatuses = [...this.entries]
      const taskStatus = taskStatuses[oldIndex]
      taskStatuses.splice(oldIndex, 1)
      taskStatuses.splice(newIndex, 0, taskStatus)
      await this.updateTaskStatusPriorities(taskStatuses)
    },

    async updateTaskStatusPriorities(taskStatuses) {
      const taskStatusPriorities = taskStatuses.map((taskStatus, index) => ({
        id: taskStatus.id,
        priority: index + 1
      }))
      this.$emit('update-priorities', taskStatusPriorities)
    }
  }
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 200px;
  min-width: 200px;
}

.short-name {
  width: 150px;
  min-width: 150px;
}

.is-reviewable,
.is-done,
.is-default,
.is-retake,
.is-artist-allowed,
.is-client-allowed,
.is-feedback-request {
  text-align: center;
  width: 140px;
  min-width: 140px;
}

.task-status {
  cursor: grab;
}

.task-status[draggable='true'] {
  cursor: grabbing;
}
</style>

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
            <th scope="col" class="is-wip">
              {{ $t('task_status.fields.is_wip') }}
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
          item-key="id"
          tag="tbody"
          @end="updateTaskStatusPriorities"
          v-model="taskStatuses"
        >
          <template #item="{ element: taskStatus }">
            <tr class="datatable-row task-status">
              <td class="name">
                {{ taskStatus.name }}
                <span
                  :title="taskStatus.description"
                  v-if="taskStatus.description"
                >
                  <help-circle-icon class="icon is-small" />
                </span>
              </td>
              <task-status-cell class="short-name" :entry="taskStatus" />
              <boolean-cell class="is-default" :value="taskStatus.is_default" />
              <boolean-cell class="is-wip" :value="taskStatus.is_wip" />
              <boolean-cell class="is-done" :value="taskStatus.is_done" />
              <boolean-cell class="is-retake" :value="taskStatus.is_retake" />
              <boolean-cell
                class="is-artist-allowed"
                :value="taskStatus.is_artist_allowed"
              />
              <boolean-cell
                class="is-client-allowed"
                :value="taskStatus.is_client_allowed"
              />
              <boolean-cell
                class="is-feedback-request"
                :value="taskStatus.is_feedback_request"
              />
              <row-actions-cell
                :entry-id="taskStatus.id"
                :hide-delete="
                  taskStatus.is_default === true || taskStatus.for_concept
                "
                @edit-clicked="$emit('edit-clicked', taskStatus)"
                @delete-clicked="$emit('delete-clicked', taskStatus)"
              />
            </tr>
          </template>
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
import { HelpCircleIcon } from 'lucide-vue-next'
import draggable from 'vuedraggable'

import { formatListMixin } from '@/components/mixins/format'

import BooleanCell from '@/components/cells/BooleanCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskStatusCell from '@/components/cells/TaskStatusCell.vue'

export default {
  name: 'task-status-list',

  mixins: [formatListMixin],

  components: {
    BooleanCell,
    draggable,
    HelpCircleIcon,
    RowActionsCell,
    TableInfo,
    TaskStatusCell
  },

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

  emits: ['delete-clicked', 'edit-clicked', 'update-priorities'],

  data() {
    return {
      taskStatuses: []
    }
  },

  mounted() {
    this.taskStatuses = this.entries
  },

  computed: {},

  methods: {
    async updateTaskStatusPriorities() {
      const taskStatusPriorities = this.taskStatuses.map(
        (taskStatus, index) => ({
          id: taskStatus.id,
          priority: index + 1
        })
      )
      this.$emit('update-priorities', taskStatusPriorities)
    }
  },

  watch: {
    entries() {
      this.taskStatuses = this.entries
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

.is-default,
.is-wip,
.is-done,
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

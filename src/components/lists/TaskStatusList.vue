<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="short-name">
              {{ $t('task_status.fields.short_name') }}
            </th>
            <th scope="col" class="name">
              {{ $t('task_status.fields.name') }}
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
          :disabled="isMobile"
          @end="updateTaskStatusPriorities"
          v-model="taskStatuses"
        >
          <template #item="{ element: status }">
            <tr class="datatable-row task-status">
              <task-status-cell
                class="short-name"
                :entry="status"
                :data-label="$t('task_status.fields.short_name')"
              />
              <td class="name" :data-label="$t('task_status.fields.name')">
                {{ status.name }}
                <span :title="status.description" v-if="status.description">
                  <help-circle-icon class="icon is-small" />
                </span>
              </td>
              <boolean-cell
                class="is-default"
                :value="status.is_default"
                :data-label="$t('task_status.fields.is_default')"
              />
              <boolean-cell
                class="is-wip"
                :value="status.is_wip"
                :data-label="$t('task_status.fields.is_wip')"
              />
              <boolean-cell
                class="is-done"
                :value="status.is_done"
                :data-label="$t('task_status.fields.is_done')"
              />
              <boolean-cell
                class="is-retake"
                :value="status.is_retake"
                :data-label="$t('task_status.fields.is_retake')"
              />
              <boolean-cell
                class="is-artist-allowed"
                :value="status.is_artist_allowed"
                :data-label="$t('task_status.fields.is_artist_allowed')"
              />
              <boolean-cell
                class="is-client-allowed"
                :value="status.is_client_allowed"
                :data-label="$t('task_status.fields.is_client_allowed')"
              />
              <boolean-cell
                class="is-feedback-request"
                :value="status.is_feedback_request"
                :data-label="$t('task_status.fields.is_feedback_request')"
              />
              <row-actions-cell
                class="datatable-row-footer"
                :hide-delete="status.is_default === true || status.for_concept"
                @edit-clicked="$emit('edit-clicked', status)"
                @delete-clicked="$emit('delete-clicked', status)"
              />
            </tr>
          </template>
        </draggable>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="8"
      :with-thumbnail="false"
    />

    <p class="has-text-centered nb-task-status">
      {{ entries.length }} {{ $t('task_status.number', entries.length) }}
    </p>
  </div>
</template>

<script setup>
import { HelpCircleIcon } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import BooleanCell from '@/components/cells/BooleanCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TaskStatusCell from '@/components/cells/TaskStatusCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'delete-clicked',
  'edit-clicked',
  'update-priorities'
])

// State

const isMobile = ref(false)
const taskStatuses = ref([...props.entries])

// Functions

const updateTaskStatusPriorities = () => {
  emit(
    'update-priorities',
    taskStatuses.value.map((status, index) => ({
      id: status.id,
      priority: index + 1
    }))
  )
}

// Watchers

watch(
  () => props.entries,
  entries => {
    taskStatuses.value = [...entries]
  }
)

// Lifecycle

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
})
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

@media screen and (max-width: 768px) {
  // Drag-and-drop is disabled on mobile, so reset the grab cursor.
  .task-status,
  .task-status[draggable='true'] {
    cursor: default;
  }

  // Stack each row as a card, mirroring the AssetTypeList mobile layout.
  :deep(.datatable-wrapper) {
    background: transparent;
    border: 0;
    overflow-x: visible;
  }

  .datatable,
  .datatable-body {
    display: block;
    width: 100%;
  }

  .datatable-head {
    display: none;
  }

  .datatable-row {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 12px;
    display: block;
    margin-bottom: 0.75em;
    padding: 0.85em 1em;
  }

  .dark .datatable-row {
    background: var(--background-alt);
  }

  .datatable-row td {
    border: 0;
    display: block;
    height: auto;
    max-width: none;
    min-width: 0;
    padding: 0.4em 0;
    text-align: left;
    width: auto;
  }

  .datatable-row td[data-label]::before {
    color: var(--text-alt);
    content: attr(data-label);
    display: block;
    font-size: 0.75em;
    letter-spacing: 0.06em;
    margin-bottom: 0.2em;
    text-transform: uppercase;
  }

  .datatable-row .name {
    font-size: 1.05em;
    font-weight: 600;
    padding-top: 0;

    &::before {
      display: none;
    }
  }

  .datatable-row .actions {
    display: none;
  }
}
</style>

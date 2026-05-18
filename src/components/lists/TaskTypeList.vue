<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head" v-if="entries.length > 0">
          <tr>
            <th scope="col" class="department">
              {{ $t('task_types.fields.department') }}
            </th>
            <th scope="col" class="name">
              {{ $t('task_types.fields.name') }}
            </th>
            <th scope="col" class="short_name">
              {{ $t('task_types.fields.short_name') }}
            </th>
            <th scope="col" class="allow-timelog">
              {{ $t('task_types.fields.allow_timelog') }}
            </th>
            <th scope="col" class="description">
              {{ $t('task_types.fields.description') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>

        <draggable
          class="datatable-body"
          item-key="id"
          tag="tbody"
          :disabled="isMobile"
          @end="updatePriority"
          v-model="items"
        >
          <template #item="{ element: taskType }">
            <tr class="datatable-row tasktype-item">
              <td
                class="department"
                :data-label="$t('task_types.fields.department')"
              >
                <department-name
                  :department="getDepartment(taskType.department_id)"
                  v-if="!isEmpty(taskType.department_id)"
                />
              </td>
              <task-type-cell
                class="name"
                :task-type="taskType"
                :data-label="$t('task_types.fields.name')"
              />
              <td
                class="short_name"
                :data-label="$t('task_types.fields.short_name')"
              >
                {{ taskType.short_name }}
              </td>
              <boolean-cell
                class="allow-timelog"
                :value="taskType.allow_timelog"
                :data-label="$t('task_types.fields.allow_timelog')"
              />
              <td :data-label="$t('task_types.fields.description')">
                {{ taskType.description }}
              </td>
              <row-actions-cell
                class="datatable-row-footer"
                :task-type-id="taskType.id"
                @delete-clicked="$emit('delete-clicked', taskType)"
                @edit-clicked="$emit('edit-clicked', taskType)"
              />
            </tr>
          </template>
          <template #footer v-if="!entries.length">
            <tr class="empty">
              <th scope="rowgroup" colspan="6">
                <span class="text">
                  {{ $t('task_types.no_task_types') }}
                </span>
              </th>
            </tr>
          </template>
        </draggable>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="4"
      :with-thumbnail="false"
    />

    <p class="has-text-centered nb-task-types" v-if="entries.length > 0">
      {{ entries.length }} {{ $t('task_types.number', entries.length) }}
    </p>
  </div>
</template>

<script setup>
import draggable from 'vuedraggable'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'

import BooleanCell from '@/components/cells/BooleanCell.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'

const store = useStore()

// Props / Emits

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
const items = ref([])

// Functions

const getDepartment = id => store.getters.getDepartment(id)

const isEmpty = value => value === undefined || value === null || value === ''

const updatePriority = () => {
  const forms = items.value.map((item, index) => {
    const priority = index + 1
    item.priority = priority
    return { id: item.id, name: item.name, priority: String(priority) }
  })
  emit('update-priorities', forms)
}

// Watchers

watch(
  () => props.entries,
  entries => {
    items.value = JSON.parse(JSON.stringify(entries))
  },
  { deep: true, immediate: true }
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
.department {
  width: 200px;
  min-width: 200px;
}

.name {
  width: 300px;
  min-width: 300px;
}

.short_name {
  width: 200px;
  min-width: 200px;
}

.allow-timelog {
  width: 100px;
  min-width: 100px;
  text-align: center;
}

.actions {
  min-width: 100px;
}

.tasktype-item {
  cursor: grab;
}

.tasktype-item[draggable='true'] {
  cursor: grabbing;
}

.empty {
  th {
    font-size: 1.2rem;
    padding-top: 30px;
    text-align: center;
  }
  span {
    color: var(--text);
    font-weight: normal;
    font-style: italic;
  }
}

.data-list {
  margin-top: 0;
}

@media screen and (max-width: 768px) {
  // Drag-and-drop is disabled on mobile, so reset the grab cursor.
  .tasktype-item,
  .tasktype-item[draggable='true'] {
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

  // Override App.vue's global `:last-child { background: transparent !important }`
  // rule, which would otherwise leave the last card with only its border drawn.
  .datatable-row,
  .datatable-row:last-child {
    background: var(--background) !important;
    border: 1px solid var(--border);
    border-radius: 12px;
    display: block;
    margin-bottom: 0.75em;
    padding: 0.85em 1em;
  }

  .dark .datatable-row,
  .dark .datatable-row:last-child {
    background: var(--background-alt) !important;
  }

  .datatable-row td {
    background-color: transparent !important;
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

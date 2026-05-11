<template>
  <div class="data-list">
    <div class="datatable-wrapper">
      <table class="datatable">
        <thead class="datatable-head">
          <tr>
            <th scope="col" class="name">
              {{ $t('asset_types.fields.name') }}
            </th>
            <th scope="col" class="short-name">
              {{ $t('asset_types.fields.short_name') }}
            </th>
            <th scope="col" class="task-types">
              {{ $t('asset_types.fields.task_types') }}
            </th>
            <th scope="col" class="actions"></th>
          </tr>
        </thead>
        <tbody class="datatable-body" v-if="entries.length">
          <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
            <td class="name" :data-label="$t('asset_types.fields.name')">
              {{ entry.name }}
              <span :title="entry.description" v-if="entry.description">
                <help-circle-icon class="icon is-small" />
              </span>
            </td>
            <td
              class="short-name"
              :data-label="$t('asset_types.fields.short_name')"
              v-if="entry.short_name"
            >
              {{ entry.short_name }}
            </td>
            <td class="short-name" v-else></td>
            <td
              class="task-types"
              :data-label="$t('asset_types.fields.task_types')"
              v-if="entry.task_types?.length"
            >
              <span
                :key="taskType.id"
                class="task-type-name flexrow-item"
                v-for="taskType in sortedTaskTypes(entry.task_types)"
              >
                <task-type-name :task-type="taskType" v-if="taskType.id" />
              </span>
            </td>
            <td
              class="task-types"
              :data-label="$t('asset_types.fields.task_types')"
              v-else
            >
              {{ $t('asset_types.include_all') }}
            </td>
            <row-actions-cell
              @edit-clicked="$emit('edit-clicked', entry)"
              @delete-clicked="$emit('delete-clicked', entry)"
            />
          </tr>
        </tbody>
      </table>
    </div>

    <table-info
      :is-loading="isLoading"
      :is-error="isError"
      :cells="2"
      :with-thumbnail="false"
    />

    <p class="has-text-centered nb-asset-types">
      {{ entries.length }} {{ $t('asset_types.number', entries.length) }}
    </p>
  </div>
</template>

<script setup>
import { HelpCircleIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useStore } from 'vuex'

import { sortTaskTypes } from '@/lib/sorting'

import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeName from '@/components/widgets/TaskTypeName.vue'

const store = useStore()

defineProps({
  entries: { type: Array, default: () => [] },
  isError: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
})

defineEmits(['delete-clicked', 'edit-clicked'])

// Computed

const taskTypeMap = computed(() => store.getters.taskTypeMap)

// Functions

const sortedTaskTypes = taskTypeIds => {
  const taskTypes =
    taskTypeIds
      ?.map(taskTypeId => taskTypeMap.value.get(taskTypeId))
      .filter(Boolean) ?? []
  return sortTaskTypes(taskTypes)
}
</script>

<style lang="scss" scoped>
.datatable-body tr:first-child th,
.datatable-body tr:first-child td {
  border-top: 0;
}

.name {
  width: 300px;
  padding: 1em;
}

@media screen and (max-width: 768px) {
  // Turn each row into a card: the table head disappears, every cell is
  // labelled via its data-label attribute, and the actions cell collapses
  // to a footer row. Keep the wrapper's overflow-y: auto from the global
  // .datatable-wrapper rule so the list still scrolls inside .fixed-page.
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
    padding: 0.4em 0;
    width: auto;
  }

  // Cells without a data-label are placeholders to keep the desktop
  // table columns aligned — collapse them on mobile so empty fields
  // don't leave gaps.
  .datatable-row td:not([data-label]):not(.actions):not(.name) {
    display: none;
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

  // The name doubles as the card title — drop its label and bump the
  // font weight.
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

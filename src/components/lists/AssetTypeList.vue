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
            <td class="name">
              {{ entry.name }}
              <span :title="entry.description" v-if="entry.description">
                <help-circle-icon class="icon is-small" />
              </span>
            </td>
            <td class="short-name">
              {{ entry.short_name }}
            </td>
            <td class="task-types" v-if="entry.task_types?.length">
              <span
                :key="taskType.id"
                class="task-type-name flexrow-item"
                v-for="taskType in sortedTaskTypes(entry.task_types)"
              >
                <task-type-name :task-type="taskType" v-if="taskType.id" />
              </span>
            </td>
            <td class="task-types" v-else>
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
  .name {
    width: auto;
    padding: 0.5em;
  }

  .datatable-body td,
  .datatable-head th {
    padding: 0.5em;
  }
}
</style>

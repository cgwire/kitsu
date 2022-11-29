<template>
<div class="data-list">
  <div class="datatable-wrapper">
    <table class="datatable">
      <thead class="datatable-head">
        <tr>
          <th scope="col" class="name">{{ $t('asset_types.fields.name') }}</th>
          <th scope="col" class="task-types">
            {{ $t('asset_types.fields.task_types') }}
          </th>
          <th scope="col" class="actions"></th>
        </tr>
      </thead>
      <tbody class="datatable-body" v-if="entries.length > 0">
        <tr class="datatable-row" v-for="entry in entries" :key="entry.id">
          <td class="name">
             {{ entry.name }}
          </td>
          <td class="task-types" v-if="(entry.task_types || []).length > 0">
            <span
              :key="taskType.id"
              class="task-type-name flexrow-item"
              v-for="taskType in sortTaskTypes(entry.task_types)"
            >
              <task-type-name
                :task-type="taskType"
                v-if="taskType.id"
              />
            </span>
          </td>
          <td class="task-types" v-else>
            {{ $t('asset_types.include_all') }}
          </td>
          <row-actions-cell
            :entry-id="entry.id"
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
  >
  </table-info>

  <p class="has-text-centered nb-asset-types">
    {{ entries.length }} {{ $tc('asset_types.number', entries.length) }}
  </p>

</div>
</template>

<script>
import { sortTaskTypes } from '@/lib/sorting'

import { mapGetters, mapActions } from 'vuex'
import RowActionsCell from '@/components/cells/RowActionsCell'
import TableInfo from '@/components/widgets/TableInfo'
import TaskTypeName from '@/components/widgets/TaskTypeName'

export default {
  name: 'asset-type-list',
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

  data () {
    return {}
  },
  components: {
    TaskTypeName,
    RowActionsCell,
    TableInfo
  },
  computed: {
    ...mapGetters([
      'taskTypeMap'
    ])
  },
  methods: {
    ...mapActions([
    ]),

    sortTaskTypes (taskTypeIds = []) {
      const taskTypes = taskTypeIds
        .map(taskTypeId => this.taskTypeMap.get(taskTypeId))
      return sortTaskTypes(taskTypes)
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
  width: 300px;
  padding: 1em;
}
</style>

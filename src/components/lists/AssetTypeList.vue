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
          <td class="task-types">
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
import { sortByName } from '@/lib/sorting'

import { mapGetters, mapActions } from 'vuex'
import RowActionsCell from '../cells/RowActionsCell'
import TableInfo from '../widgets/TableInfo'
import TaskTypeName from '../widgets/TaskTypeName'

export default {
  name: 'asset-type-list',
  props: [
    'entries',
    'isLoading',
    'isError'
  ],
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
      return sortByName(taskTypeIds
        .map(taskTypeId => this.taskTypeMap.get(taskTypeId)))
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

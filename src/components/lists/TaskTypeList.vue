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
          @end="updatePriority"
          v-model="items"
        >
          <template #item="{ element: taskType }">
            <tr class="datatable-row tasktype-item">
              <td class="department">
                <department-name
                  :department="getDepartment(taskType.department_id)"
                  v-if="!isEmpty(taskType.department_id)"
                />
              </td>
              <task-type-cell class="name" :task-type="taskType" />
              <td class="short_name">
                {{ taskType.short_name }}
              </td>
              <boolean-cell
                class="allow-timelog"
                :value="taskType.allow_timelog"
              />
              <td>
                {{ taskType.description }}
              </td>
              <row-actions-cell
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

    <table-info :is-loading="isLoading" :is-error="isError" />

    <p class="has-text-centered nb-task-types" v-if="entries.length > 0">
      {{ entries.length }} {{ $tc('task_types.number', entries.length) }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'

import BooleanCell from '@/components/cells/BooleanCell.vue'
import DepartmentName from '@/components/widgets/DepartmentName.vue'
import RowActionsCell from '@/components/cells/RowActionsCell.vue'
import TableInfo from '@/components/widgets/TableInfo.vue'
import TaskTypeCell from '@/components/cells/TaskTypeCell.vue'

export default {
  name: 'task-type-list',

  components: {
    draggable,
    BooleanCell,
    DepartmentName,
    RowActionsCell,
    TableInfo,
    TaskTypeCell
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
      items: []
    }
  },

  computed: {
    ...mapGetters(['getDepartment'])
  },

  methods: {
    updatePriority() {
      const items = this.items
      const forms = []
      items.forEach((item, index) => {
        index += 1
        const form = {
          id: item.id,
          name: item.name,
          priority: String(index)
        }
        item.priority = index
        forms.push(form)
      })
      this.$emit('update-priorities', forms)
    },

    isEmpty(value) {
      return value === undefined || value === null || value === ''
    }
  },

  watch: {
    entries: {
      deep: true,
      immediate: true,
      handler() {
        this.items = JSON.parse(JSON.stringify(this.entries))
      }
    }
  }
}
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

.priority {
  width: 80px;
  min-width: 80px;
}

.allow-timelog {
  width: 100px;
  min-width: 100px;
  text-align: center;
}

.actions {
  min-width: 100px;
}

.color {
  width: 100px;
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
</style>
